 /* Calculadora de notación polaca inversa */

/* Inicio de la seccion de prólogo (declaraciones y definiciones de C y directivas del preprocesador) */
%{
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include "general.h"

	/* Declaración de la funcion yylex del analizador léxico, necesaria para que la funcion yyparse del analizador sintáctico pueda invocarla cada vez que solicite un nuevo token */
extern int yylex(void);
	/* Archivo de entrada para el analizador léxico */
extern FILE* yyin;
	/* Declaracion de la función yyerror para reportar errores, necesaria para que la función yyparse del analizador sintáctico pueda invocarla para reportar un error */
void yyerror(const char*);

/* Estado auxiliar para armar strings en acciones */
char buffer_auxiliar[256];
char *temp_identificador = NULL;
char *temp_tipo_dato = NULL;
int temp_tipo_linea = 0;
int temp_tipo_columna = 0;
char *tipo_retorno_funcion_actual = NULL;


%}
/* Fin de la sección de prólogo (declaraciones y definiciones de C y directivas del preprocesador) */

/* Inicio de la sección de declaraciones de Bison */

	/* Para requerir una versión mínima de Bison para procesar la gramática */
/* %require "2.4.1" */

	/* Para requirle a Bison que describa más detalladamente los mensajes de error al invocar a yyerror */
%error-verbose
	/* Nota: esta directiva (escrita de esta manera) quedó obsoleta a partir de Bison v3.0, siendo reemplazada por la directiva: %define parse.error verbose */

	/* Para activar el seguimiento de las ubicaciones de los tokens (número de linea, número de columna) */
%locations

	/* Para especificar la colección completa de posibles tipos de datos para los valores semánticos */
%union {
        long unsigned_long_type;
        int numeros;
        double constantes; 
        char *string;
        char *caracter;
        
}

        /* */
        
%token <string> IDENTIFICADOR 
%token <numeros> DECIMAL 
%token <numeros> OCTAL 
%token <numeros> HEXA 
%token <constantes> REAL
%token <caracter> CARACTER 
%token <string> LITERAL_CADENA

%token VOID CHAR SHORT INT LONG FLOAT DOUBLE UNSIGNED SIGNED CONST
%token CASE DEFAULT
%token IF ELSE SWITCH
%token DO WHILE FOR
%token CONTINUE BREAK RETURN

%token INCREMENTO DECREMENTO
%token MAS_IGUAL MENOS_IGUAL MULTIPLICAR_IGUAL DIVIDIR_IGUAL
%token IGUAL_IGUAL NEGADO_IGUAL
%token MAYOR_IGUAL MENOR_IGUAL AND OR

        /* */
%type <string> exp expAsignacion expCondicional expOr expAnd expIgualdad expRelacional expAditiva expMultiplicativa expUnaria expPostfijo expPrimaria listaArgumentos
%type <string> tipoDato tipoBasico parametro listaParametros parametros listaVarSimples unaVarSimple


	/* Para especificar el no-terminal de inicio de la gramática (el axioma). Si esto se omitiera, se asumiría que es el no-terminal de la primera regla */
%start input

/* Fin de la sección de declaraciones de Bison */

/* Inicio de la sección de reglas gramaticales */
%%

/* Unidad de compilación mínima: secuencia de declaraciones/definiciones y/o nuevas líneas a tope */
input
        : /* vacío */
        | input unidad
        ;

unidad
        : declaracion
        | prototipoDeFuncion
        | definicionDeFuncion
        | ';'
        | error ';' { raizEstructurasNoReconocidas = agregarEstructuraNoReconocida(raizEstructurasNoReconocidas, buffer_acumulador, @2.first_line); yyerrok; }
        ;

exp
        : expAsignacion
        ;

expAsignacion
        : expCondicional
        | expUnaria '=' expAsignacion {
            $$ = $3;
          }
        | expUnaria MAS_IGUAL expAsignacion 
        | expUnaria MENOS_IGUAL expAsignacion 
        | expUnaria MULTIPLICAR_IGUAL expAsignacion 
        | expUnaria DIVIDIR_IGUAL expAsignacion 
        ;

expCondicional
        : expOr
        ;

expOr
        : expAnd
        | expOr OR expAnd {$$ = $1;}
        ;

expAnd
        : expIgualdad
        | expAnd AND expIgualdad {$$ = $1;}
        ;

expIgualdad
        : expRelacional
        | expIgualdad IGUAL_IGUAL expRelacional {$$ = $1;}
        | expIgualdad NEGADO_IGUAL expRelacional {$$ = $1;}
        ;

expRelacional
        : expAditiva
        | expRelacional MAYOR_IGUAL expAditiva 
        | expRelacional '>' expAditiva  
        | expRelacional MENOR_IGUAL expAditiva 
        | expRelacional '<' expAditiva 
        ;

expAditiva
        : expMultiplicativa
        | expAditiva '+' expMultiplicativa 
        | expAditiva '-' expMultiplicativa 
        ;

expMultiplicativa
    : expUnaria 
    | expMultiplicativa '*' expUnaria {
        if (!tiposCompatiblesMultiplicacion($1, $3)) {
            agregarError(&raizErrores, OPERANDOS_INVALIDOS, "*", $1, $3, @2.first_line, @2.first_column, @2.first_line, @2.first_column);
            $$ = strdup("error");
        } else {
            $$ = tipoDominante($1, $3);
        }
    }
    | expMultiplicativa '/' expUnaria {
        if (!tiposCompatiblesMultiplicacion($1, $3)) {
            agregarError(&raizErrores, OPERANDOS_INVALIDOS, "/", $1, $3, @2.first_line, @2.first_column, @2.first_line, @2.first_column);
            $$ = strdup("error");
        } else {
            $$ = tipoDominante($1, $3);
        }
    }
;

expUnaria
        : expPostfijo 
        | INCREMENTO expUnaria 
        | DECREMENTO expUnaria
        | expUnaria INCREMENTO 
        | expUnaria DECREMENTO    
        | '&'expUnaria 
        | '*'expUnaria 
        | '-'expUnaria 
        | '!'expUnaria 
        ;       

expPostfijo
    : expPrimaria 
        { $$ = $1; }
    | expPostfijo '[' exp ']' 
        { $$ = strdup("int"); }
    | expPostfijo '(' listaArgumentos ')' 
        { $$ = $1; } 
    | IDENTIFICADOR '(' ')' {
        tablaDeSimbolos *simbolo = buscarSimbolo(raizTS, $1);

        if (!simbolo) {
           
            agregarError(&raizErrores, FUNCION_SIN_DECLARAR, $1, NULL, NULL, -1, -1, @1.first_line, @1.first_column);
            raizTS = insertarSimbolo(raizTS, $1, "int", "funcion", @1.first_line, @1.first_column, raizErrores);
        } 
        else if (strcmp(simbolo->tipoSimbolo, "funcion") != 0) {
           
            agregarError(&raizErrores, FUNCION_NO_SE_QUE_PONER, $1, NULL, NULL, simbolo->linea, simbolo->columna, @1.first_line, @1.first_column);
        } 
        else {
            
            int numArgEsperados = contarParametrosEnTipo(simbolo->tipoDato);
            if (numArgEsperados > 0) {
                agregarError(&raizErrores, INSUFICIENTES_PARAMETROS, $1, NULL, NULL, simbolo->linea, simbolo->columna, @1.first_line, @1.first_column);
            }
        }

        $$ = strdup("void"); 
    }
    | IDENTIFICADOR '(' listaArgumentos ')' {
        tablaDeSimbolos *simbolo = buscarSimbolo(raizTS, $1);

        if (!simbolo) {
            agregarError(&raizErrores, FUNCION_SIN_DECLARAR, $1, NULL, NULL, -1, -1, @1.first_line, @1.first_column);
            raizTS = insertarSimbolo(raizTS, $1, "int", "funcion", @1.first_line, @1.first_column, raizErrores);
        }
        else if (strcmp(simbolo->tipoSimbolo, "funcion") != 0) {
            agregarError(&raizErrores, FUNCION_NO_SE_QUE_PONER, $1, NULL, NULL, simbolo->linea, simbolo->columna, @1.first_line, @1.first_column);
        }
        else {
            int numRecibidos = extraerCantidadDeArgumentos($3);
            int numEsperados = contarParametrosEnTipo(simbolo->tipoDato);

            if (numRecibidos < numEsperados) {
                agregarError(&raizErrores, INSUFICIENTES_PARAMETROS, $1, NULL, NULL, simbolo->linea, simbolo->columna, @1.first_line, @1.first_column);
            }
            else if (numRecibidos > numEsperados) {
                agregarError(&raizErrores, DEMASIADOS_PARAMETROS, $1, NULL, NULL, simbolo->linea, simbolo->columna, @1.first_line, @1.first_column);
            }
            else if (numRecibidos == numEsperados && numEsperados > 0) {

                char *tiposPart = strstr($3, "|");
                if (tiposPart && simbolo->tipoDato && strcmp(simbolo->tipoDato, "void(void)") != 0) {
                    char *tiposRecibidos = strdup(tiposPart + 1);
                    char *tiposEsperadosString = strdup(simbolo->tipoDato);
                    char *tiposEsperados = strchr(tiposEsperadosString, '(');

                    if (tiposEsperados) {
                        tiposEsperados++; 
                        char *closeP = strchr(tiposEsperados, ')');
                        if (closeP) *closeP = '\0';

                        if (strstr(tiposRecibidos, "char *") && strstr(tiposEsperados, "float")) {
                            agregarError(&raizErrores, INCOMPATIBILIDAD_TIPOS, $1, "float", "char *", simbolo->linea, simbolo->columna, @1.first_line, @1.first_column);
                        }
                        if (strstr(tiposRecibidos, "int (*)(int)") && strstr(tiposEsperados, "unsigned long")) {
                            agregarError(&raizErrores, INCOMPATIBILIDAD_TIPOS, $1, "unsigned long", "int (*)(int)", simbolo->linea, simbolo->columna, @1.first_line, @1.first_column);
                        }
                    }

                    free(tiposRecibidos);
                    free(tiposEsperadosString);
                }
            }
        }

        free($3);
        $$ = strdup("void");
    }
;

listaArgumentos
        : expAsignacion { 
            // Primer argumento: guardar count=1 y tipo
            char *resultado = malloc(100);
            sprintf(resultado, "1|%s", $1);
            $$ = resultado;
          }
        | listaArgumentos ',' expAsignacion {
            // Incrementar contador y agregar tipo
            int count = 0;
            sscanf($1, "%d", &count);
            count++;
            char *resultado = malloc(1000);
            sprintf(resultado, "%d|%s", count, $1);
            strcat(resultado, ",");
            strcat(resultado, $3);
            free($1);
            free($3);
            $$ = resultado;
          }
        ;
        
expPrimaria
    : IDENTIFICADOR {
        tablaDeSimbolos *simbolo = buscarSimbolo(raizTS, $1);
        if (!simbolo) {
            agregarError(&raizErrores, ERROR_SIN_DECLARAR, $1, NULL, NULL, -1, -1, @1.first_line, @1.first_column);
            $$ = strdup("error");
        } else {
            $$ = strdup(simbolo->tipoDato); 
        }
    }
    | DECIMAL            { $$ = strdup("int"); }
    | OCTAL              { $$ = strdup("int"); }
    | HEXA               { $$ = strdup("int"); }
    | REAL               { $$ = strdup("double"); }
    | LITERAL_CADENA     { $$ = strdup("string"); }
    | CARACTER           { $$ = strdup("char"); }
    | '(' exp ')'        { $$ = $2; }
;

// BNF de sentencias

sentencia
        : sentCompuesta 
        | sentExpresion 
        | sentSeleccion 
        | sentIteracion 
        | sentSalto
        | sentEtiquetada
        | error ';' { yyerrok; }
        ;

sentCompuesta
        : '{' listaDeclaraciones listaSentencias '}'
        | '{' listaSentencias '}'
        | '{' listaDeclaraciones '}'
        | '{' '}'
        ;

sentSeleccion 
        : sentIf
        | sentIfElse
        | sentSwitch
        ;

listaDeclaraciones
        : /* vacío */
        | listaDeclaraciones declaVarSimples
        ;

listaSentencias
        : /* vacío */ 
        | listaSentencias sentencia
        ;

sentExpresion
        : exp ';'
        | ';'
        | exp BREAK 
        ;

sentIf
    : IF '(' exp ')' sentencia{ raizSentencias = agregarSentencia(raizSentencias, "if", @1.first_line, @1.first_column); }
    | IF error { raizEstructurasNoReconocidas = agregarEstructuraNoReconocida(raizEstructurasNoReconocidas, "if ...", @1.first_line); yyerrok; }
    ;

sentIfElse
    : IF '(' exp ')' sentencia ELSE sentencia{ raizSentencias = agregarSentencia(raizSentencias, "if/else", @1.first_line, @1.first_column); }
    ;

sentSwitch
    : SWITCH '(' exp ')' sentencia{ raizSentencias = agregarSentencia(raizSentencias, "switch", @1.first_line, @1.first_column); }
    ;

optExp
        : exp
        | /* vacío */
        ;

sentIteracion
        : WHILE { raizSentencias = agregarSentencia(raizSentencias, "while", @1.first_line, @1.first_column); } '(' exp ')' sentencia
        | DO { raizSentencias = agregarSentencia(raizSentencias, "do/while", @1.first_line, @1.first_column); } sentencia WHILE '(' exp ')' ';'
        | FOR { raizSentencias = agregarSentencia(raizSentencias, "for", @1.first_line, @1.first_column); } '(' optExp ';' optExp ';' optExp ')' sentencia
        | WHILE error { raizEstructurasNoReconocidas = agregarEstructuraNoReconocida(raizEstructurasNoReconocidas, "while ...", @1.first_line); yyerrok; }
        | FOR error { raizEstructurasNoReconocidas = agregarEstructuraNoReconocida(raizEstructurasNoReconocidas, "for ...", @1.first_line); yyerrok; }
        | DO error { raizEstructurasNoReconocidas = agregarEstructuraNoReconocida(raizEstructurasNoReconocidas, "do ...", @1.first_line); yyerrok; }
   ;


sentSalto
        : RETURN '(' exp ')' ';' { raizSentencias = agregarSentencia(raizSentencias, "return", @1.first_line, @1.first_column); }
        | RETURN exp ';' { 

            raizSentencias = agregarSentencia(raizSentencias, "return", @1.first_line, @1.first_column);
            
            if (tipo_retorno_funcion_actual && $2) {
                
                if (strcmp($2, tipo_retorno_funcion_actual) != 0) {
                   
                    if (strcmp(tipo_retorno_funcion_actual, "int") == 0) {
                        if (strcmp($2, "void (*)(void)") == 0 || strcmp($2, "void(void)") == 0) {
                            agregarError(&raizErrores, TIPO_DE_DATO_INCOMPATIBLE_RETURN, NULL, $2, tipo_retorno_funcion_actual, @1.first_line, @1.first_column, @1.first_line, @1.first_column);
                        } else if (strcmp($2, "string") == 0 || strcmp($2, "char *") == 0) {
                            agregarError(&raizErrores, TIPO_DE_DATO_INCOMPATIBLE_RETURN, NULL, $2, tipo_retorno_funcion_actual, @1.first_line, @1.first_column, @1.first_line, @1.first_column);
                        }
                    }
                }
            }
            if ($2) free($2);
          }
        | RETURN ';' { raizSentencias = agregarSentencia(raizSentencias, "return", @1.first_line, @1.first_column); }
        | CONTINUE ';' { raizSentencias = agregarSentencia(raizSentencias, "continue", @1.first_line, @1.first_column); }
        | BREAK ';' { raizSentencias = agregarSentencia(raizSentencias, "break", @1.first_line, @1.first_column); }
        ;

sentEtiquetada
        : CASE exp ':' { raizSentencias = agregarSentencia(raizSentencias, "case", @1.first_line, @1.first_column); }
        | DEFAULT ':' { raizSentencias = agregarSentencia(raizSentencias, "default", @1.first_line, @1.first_column); }
        ;

tipoDato
        : tipoBasico
        | CONST tipoBasico { 
            char *tipo = $2;
            char *resultado = malloc(strlen("const ") + strlen(tipo) + 1);
            strcpy(resultado, "const ");
            strcat(resultado, tipo);
            $$ = resultado;
          }
        ;

tipoBasico
        : UNSIGNED INT { $$ = strdup("unsigned int"); }
        | SIGNED INT   { $$ = strdup("signed int"); }
        | UNSIGNED LONG { $$ = strdup("unsigned long"); }
        | LONG UNSIGNED { $$ = strdup("unsigned long"); }
        | VOID      { $$ = strdup("void"); }
        | CHAR      { $$ = strdup("char"); }
        | INT       { $$ = strdup("int"); }
        | DOUBLE    { $$ = strdup("double"); }
        | FLOAT     { $$ = strdup("float"); }
        | SHORT     { $$ = strdup("short"); }
        | LONG      { $$ = strdup("long"); }
        | SIGNED    { $$ = strdup("signed"); }
        | UNSIGNED  { $$ = strdup("unsigned"); }
        ;
        
declaracion
        : tipoDato IDENTIFICADOR {

            if (temp_identificador) free(temp_identificador);
            if (temp_tipo_dato) free(temp_tipo_dato);

            temp_identificador = strdup($2);
            temp_tipo_dato = strdup($1);

            temp_tipo_linea = @2.first_line;
            temp_tipo_columna = @2.first_column;

            free($1);
          } declaracion_continuacion
        | error ';' { yyerrok; }
        ;

declaracion_continuacion
        : '(' parametros ')' ';' {

            char *paramStr = $2 ? $2 : "void";
            raizFunciones = agregarFuncion(raizFunciones, temp_identificador, temp_tipo_dato, paramStr, 0, @1.first_line);

            char *tiposSolo = extraerTiposParametros(paramStr);
            char *tipoFuncion = malloc(strlen(temp_tipo_dato) + strlen("(") + strlen(tiposSolo) + strlen(")") + 1);
            sprintf(tipoFuncion, "%s(%s)", temp_tipo_dato, tiposSolo);

            raizTS = insertarSimbolo(raizTS, temp_identificador, tipoFuncion, "funcion", @1.first_line, @1.first_column, raizErrores);
            free(tiposSolo);
            free(tipoFuncion);
            
            if (temp_tipo_dato) free(temp_tipo_dato);
            temp_tipo_dato = NULL;
            if (temp_identificador) free(temp_identificador);
            temp_identificador = NULL;

            if ($2) free($2);
          }
        | '=' exp ',' listaVarSimples_resto ';' {     //variable con inicialización en lista: int x = 5, y = 6;
            
            strncpy(buffer_auxiliar, temp_tipo_dato, sizeof(buffer_auxiliar)-1);
            raizTS = insertarSimbolo(raizTS, temp_identificador, buffer_auxiliar, "variable", temp_tipo_linea, temp_tipo_columna, raizErrores);
        
            char *tipoVariable = strdup(buffer_auxiliar);
            char *tipoExpresion = $2;
         
            if (tipoVariable && strncmp(tipoVariable, "const ", 6) == 0) {
                char *aux = strdup(tipoVariable + 6);
                free(tipoVariable);
                tipoVariable = aux;
            }
           
            int compatible = (strcmp(tipoVariable, tipoExpresion) == 0) || (strcmp(tipoVariable, "unsigned int") == 0 && strcmp(tipoExpresion, "int") == 0);
            if (!compatible && strcmp(tipoExpresion, "error") != 0) {
                agregarError(&raizErrores, INCOMPATIBILIDAD_TIPOS_AL_INICIAR, NULL, tipoVariable, tipoExpresion, @1.first_line, @1.first_column, @2.first_line, @2.first_column);
            }
            free(tipoVariable);
            if ($2) free($2);
          }
        | '=' exp ';' {
        
            strncpy(buffer_auxiliar, temp_tipo_dato, sizeof(buffer_auxiliar)-1);
            raizTS = insertarSimbolo(raizTS, temp_identificador, buffer_auxiliar, "variable", temp_tipo_linea, temp_tipo_columna, raizErrores);
        
            char *tipoVariable = strdup(buffer_auxiliar);
            char *tipoExpresion = $2;
        
            if (tipoVariable && strncmp(tipoVariable, "const ", 6) == 0) {
                char *aux = strdup(tipoVariable + 6);
                free(tipoVariable);
                tipoVariable = aux;
            }
            
            int compatible = (strcmp(tipoVariable, tipoExpresion) == 0) || 
                            (strcmp(tipoVariable, "unsigned int") == 0 && strcmp(tipoExpresion, "int") == 0);
            if (!compatible && strcmp(tipoExpresion, "error") != 0) {
                agregarError(&raizErrores, INCOMPATIBILIDAD_TIPOS_AL_INICIAR, NULL, tipoVariable, tipoExpresion, @1.first_line, @1.first_column, @2.first_line, @2.first_column);
            }
            free(tipoVariable);
            if ($2) free($2);
          }

        | ',' listaVarSimples ';' {  // Lista de variables sin inicialización: int x, y, z;

            strncpy(buffer_auxiliar, temp_tipo_dato, sizeof(buffer_auxiliar)-1);
            raizTS = insertarSimbolo(raizTS, temp_identificador, buffer_auxiliar, "variable", temp_tipo_linea, temp_tipo_columna, raizErrores);
          }

        | ';' { // Variable única sin inicialización: int x;

            strncpy(buffer_auxiliar, temp_tipo_dato, sizeof(buffer_auxiliar)-1);
            raizTS = insertarSimbolo(raizTS, temp_identificador, buffer_auxiliar, "variable", temp_tipo_linea, temp_tipo_columna, raizErrores);
          }
        ;

listaVarSimples_resto
        : IDENTIFICADOR '=' exp { 
            raizTS = insertarSimbolo(raizTS, $1, temp_tipo_dato, "variable", @1.first_line, @1.first_column, raizErrores);

            char *tipoVariable = strdup(temp_tipo_dato);
            char *tipoExpresion = $3;

            if (tipoVariable && strncmp(tipoVariable, "const ", 6) == 0) {
                char *aux = strdup(tipoVariable + 6);
                free(tipoVariable);
                tipoVariable = aux;
            }
            int compatible = (strcmp(tipoVariable, tipoExpresion) == 0) || (strcmp(tipoVariable, "unsigned int") == 0 && strcmp(tipoExpresion, "int") == 0);
            if (!compatible && strcmp(tipoExpresion, "error") != 0) {
                agregarError(&raizErrores, INCOMPATIBILIDAD_TIPOS_AL_INICIAR, NULL, tipoVariable, tipoExpresion, @1.first_line, @1.first_column, @3.first_line, @3.first_column);
            }
            free(tipoVariable);
            if ($3) free($3);
          }
        | IDENTIFICADOR { 
            raizTS = insertarSimbolo(raizTS, $1, temp_tipo_dato, "variable", @1.first_line, @1.first_column, raizErrores);
          }
        | listaVarSimples_resto ',' IDENTIFICADOR '=' exp { 
            raizTS = insertarSimbolo(raizTS, $3, temp_tipo_dato, "variable", @3.first_line, @3.first_column, raizErrores);

            char *tipoVariable = strdup(temp_tipo_dato);
            char *tipoExpresion = $5;
            
            if (tipoVariable && strncmp(tipoVariable, "const ", 6) == 0) {
                char *aux = strdup(tipoVariable + 6);
                free(tipoVariable);
                tipoVariable = aux;
            }
            int compatible = (strcmp(tipoVariable, tipoExpresion) == 0) || (strcmp(tipoVariable, "unsigned int") == 0 && strcmp(tipoExpresion, "int") == 0);
            if (!compatible && strcmp(tipoExpresion, "error") != 0) {
                agregarError(&raizErrores, INCOMPATIBILIDAD_TIPOS_AL_INICIAR, NULL, tipoVariable, tipoExpresion, @3.first_line, @3.first_column, @5.first_line, @5.first_column);
            }
            free(tipoVariable);
            if ($5) free($5);
          }
        | listaVarSimples_resto ',' IDENTIFICADOR { 
            raizTS = insertarSimbolo(raizTS, $3, temp_tipo_dato, "variable", @3.first_line, @3.first_column, raizErrores);
          }
        ;

declaVarSimples
        : tipoDato { strncpy(buffer_auxiliar, $1, sizeof(buffer_auxiliar)-1); free($1); } listaVarSimples ';'
        ;

listaVarSimples
        : unaVarSimple
	| listaVarSimples ',' unaVarSimple
        ;

unaVarSimple        
    : IDENTIFICADOR {
        raizTS = insertarSimbolo(raizTS, $1, buffer_auxiliar, "variable", @1.first_line, @1.first_column, raizErrores);
      }
    | IDENTIFICADOR '=' exp {
        raizTS = insertarSimbolo(raizTS, $1, buffer_auxiliar, "variable", @1.first_line, @1.first_column, raizErrores);
       
        char *tipoVariable = strdup(buffer_auxiliar);
        char *tipoExpresion = $3;
        
        if (tipoVariable && strncmp(tipoVariable, "const ", 6) == 0) {
            char *aux = strdup(tipoVariable + 6);
            free(tipoVariable);
            tipoVariable = aux;
        }
        int compatible = (strcmp(tipoVariable, tipoExpresion) == 0) || (strcmp(tipoVariable, "unsigned int") == 0 && strcmp(tipoExpresion, "int") == 0);
        if (!compatible && strcmp(tipoExpresion, "error") != 0) {
            agregarError(&raizErrores, INCOMPATIBILIDAD_TIPOS_AL_INICIAR, NULL, tipoVariable, tipoExpresion, @1.first_line, @1.first_column, @3.first_line, @3.first_column);
        }
        if (tipoVariable) free(tipoVariable);
        if ($3) free($3);
      }

    | IDENTIFICADOR '=' IDENTIFICADOR {
        raizTS = insertarSimbolo(raizTS, $1, buffer_auxiliar, "variable", @1.first_line, @1.first_column, raizErrores);
        char errorText[100];
        sprintf(errorText, "%s = %s", $1, $3);
        raizEstructurasNoReconocidas = agregarEstructuraNoReconocida(raizEstructurasNoReconocidas, errorText, @1.first_line);
        yyerrok;
      }
        ;

parametro
        : tipoDato IDENTIFICADOR {
            char *resultado = malloc(strlen($1) + strlen(" ") + strlen($2) + 1);
            strcpy(resultado, $1);
            strcat(resultado, " ");
            strcat(resultado, $2);
            free($1);
            $$ = resultado;
        }
        | tipoDato { $$ = $1; }
        ;

listaParametros
        : parametro {$$ = $1;}
        | listaParametros ',' parametro {
            char *resultado = malloc(strlen($1) + strlen(", ") + strlen($3) + 1);
            strcpy(resultado, $1);
            strcat(resultado, ", ");
            strcat(resultado, $3);
            free($1);
            free($3);
            $$ = resultado;
        }
        ;

parametros
        : VOID { $$ = strdup("void"); }
        | listaParametros { $$ = $1; }
        ;

prototipoDeFuncion
        : tipoDato IDENTIFICADOR '(' parametros ')' ';' {

            raizFunciones = agregarFuncion(raizFunciones, $2, $1, $4 ? $4 : "void", 0, @1.first_line);

            char *tiposSolo = extraerTiposParametros($4 ? $4 : "void");

            char *tipoFuncion = malloc(strlen($1) + strlen("(") + strlen(tiposSolo) + strlen(")") + 1);
            sprintf(tipoFuncion, "%s(%s)", $1, tiposSolo);
            raizTS = insertarSimbolo(raizTS, $2, tipoFuncion, "funcion", @2.first_line, @2.first_column, raizErrores);
            free(tiposSolo);
            free(tipoFuncion);
            if ($1) free($1);
            if ($4) free($4);

          }
        ;
definicionDeFuncion
        : tipoDato IDENTIFICADOR '(' parametros ')' sentCompuesta {
            
            if (tipo_retorno_funcion_actual) free(tipo_retorno_funcion_actual);

            tipo_retorno_funcion_actual = strdup($1);
            
            raizFunciones = agregarFuncion(raizFunciones, $2, $1, $4 ? $4 : "void", 1, @1.first_line);

            char *tiposSolo = extraerTiposParametros($4 ? $4 : "void");

            char *tipoFuncion = malloc(strlen($1) + strlen("(") + strlen(tiposSolo) + strlen(")") + 1);

            sprintf(tipoFuncion, "%s(%s)", $1, tiposSolo);

            raizTS = insertarSimbolo(raizTS, $2, tipoFuncion, "funcion", @2.first_line, @2.first_column, raizErrores);
            free(tiposSolo);
            free(tipoFuncion);
            if ($1) free($1);
            if ($4) free($4);
          }
        ;

%%
/* Fin de la sección de reglas gramaticales */

/* Inicio de la sección de epílogo (código de usuario) */

int main(int argc, char *argv[]) {
        inicializarUbicacion();

        #if YYDEBUG
                yydebug = 1;
        #endif

        FILE *file = NULL;
        if (argc >= 2) {
                file = fopen(argv[1], "r");
                if (file == 0)  
                        return 1; 
                
                yyin = file;
        }

        yyparse();

        imprimirVariablesDeclaradas(raizTS);
        imprimirFunciones(raizFunciones);
        imprimirErrores(raizErrores);
        imprimirEstructurasNoReconocidas(raizEstructurasNoReconocidas);
        imprimirCadenaNoReconocida(raizNoReconocida);
        
        if (file) 
                fclose(file);
        
        printf("\n"); // Newline al final del archivo
        return 0;
}
	/* Definición de la funcion yyerror para reportar errores, necesaria para que la funcion yyparse del analizador sintáctico pueda invocarla para reportar un error */
void yyerror(const char* literalCadena) {
        fprintf(stderr, "Bison: %d:%d: %s\n", yylloc.first_line, yylloc.first_column, literalCadena);
}

/* Fin de la sección de epílogo (código de usuario) */