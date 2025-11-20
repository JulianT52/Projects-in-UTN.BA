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
char* buffer_auxiliar[128];

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

%token VOID CHAR SHORT INT LONG FLOAT DOUBLE UNSIGNED SIGNED
%token CASE DEFAULT
%token IF ELSE SWITCH
%token DO WHILE FOR
%token CONTINUE BREAK RETURN

%token INCREMENTO DECREMENTO
%token MAS_IGUAL MENOS_IGUAL MULTIPLICAR_IGUAL DIVIDIR_IGUAL
%token IGUAL_IGUAL NEGADO_IGUAL
%token MAYOR_IGUAL MENOR_IGUAL AND OR

        /* */
%type <unsigned_long_type> exp expAsignacion expCondicional expOr expAnd expIgualdad expRelacional expAditiva expMultiplicativa expUnaria expPostfijo expPrimaria listaArgumentos
%type <string> tipoDato parametro listaParametros parametros listaVarSimples unaVarSimple


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
        | expUnaria '=' expAsignacion {$$ = ($1 = $3);}
        | expUnaria MAS_IGUAL expAsignacion {$$ = ($1 += $3);}
        | expUnaria MENOS_IGUAL expAsignacion {$$ = ($1 -= $3);}
        | expUnaria MULTIPLICAR_IGUAL expAsignacion {$$ = ($1 *= $3);}
        | expUnaria DIVIDIR_IGUAL expAsignacion {$$ = ($1 /= $3);}
        ;

expCondicional
        : expOr
        ;

expOr
        : expAnd
        | expOr OR expAnd {$$ = ($1 || $3);}
        ;

expAnd
        : expIgualdad
        | expAnd AND expIgualdad {$$ = $1 && $3;}
        ;

expIgualdad
        : expRelacional
        | expIgualdad IGUAL_IGUAL expRelacional {$$ = $1 == $3;}
        | expIgualdad NEGADO_IGUAL expRelacional {$$ = $1 != $3;}
        ;

expRelacional
        : expAditiva
        | expRelacional MAYOR_IGUAL expAditiva {$$ = $1 >= $3;}
        | expRelacional '>' expAditiva  {$$ = $1 > $3;}
        | expRelacional MENOR_IGUAL expAditiva {$$ = $1 <= $3;}
        | expRelacional '<' expAditiva {$$ = $1 < $3;}
        ;

expAditiva
        : expMultiplicativa
        | expAditiva '+' expMultiplicativa {$$ = $1 + $3;}
        | expAditiva '-' expMultiplicativa {$$ = $1 - $3;}
        ;

expMultiplicativa
        : expUnaria
        | expMultiplicativa '*' expUnaria {$$ = $1 * $3;}
        | expMultiplicativa '/' expUnaria {$$ = $1 / $3;}
        ;

expUnaria
        : expPostfijo
        | INCREMENTO expUnaria {$$ = $2 +1;}
        | DECREMENTO expUnaria {$$ = $2 -1;}
        | expUnaria INCREMENTO {$$ = $1 -1;}
        | expUnaria DECREMENTO {$$ = $1 +1;}     
        | '&'expUnaria {$$ = (unsigned long)& $2;}
        | '*'expUnaria {$$ = (unsigned long)*((unsigned long*)$2);}
        | '-'expUnaria {$$ = - $2;}
        | '!'expUnaria {$$ = ! $2;}
        ;       

expPostfijo
        : expPrimaria
        | expPostfijo '[' exp ']'
        | expPostfijo '('listaArgumentos')'
        ;

listaArgumentos
        : expAsignacion
        | listaArgumentos ',' expAsignacion
        ;
        
expPrimaria
        : IDENTIFICADOR
        | DECIMAL
        | OCTAL
        | HEXA
        | REAL
        | LITERAL_CADENA
        | CARACTER
        | '(' exp ')'
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

        /* Expresión opcional para manejar los casos vacíos dentro del for */
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
        | RETURN exp ';' { raizSentencias = agregarSentencia(raizSentencias, "return", @1.first_line, @1.first_column); }
        | RETURN ';' { raizSentencias = agregarSentencia(raizSentencias, "return", @1.first_line, @1.first_column); }
        | CONTINUE ';' { raizSentencias = agregarSentencia(raizSentencias, "continue", @1.first_line, @1.first_column); }
        | BREAK ';' { raizSentencias = agregarSentencia(raizSentencias, "break", @1.first_line, @1.first_column); }
        ;

sentEtiquetada
        : CASE exp ':' { raizSentencias = agregarSentencia(raizSentencias, "case", @1.first_line, @1.first_column); }
        | DEFAULT ':' { raizSentencias = agregarSentencia(raizSentencias, "default", @1.first_line, @1.first_column); }
        ;

// BNF de las Declaraciones


tipoDato
        : UNSIGNED INT { $$ = strdup("unsigned int"); }
        | SIGNED INT   { $$ = strdup("signed int"); }
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
        : declaVarSimples
        | prototipoDeFuncion
        ;

declaVarSimples
        : tipoDato {  if ($1) { strncpy(buffer_auxiliar, $1, sizeof(buffer_auxiliar)-1); free($1); } } listaVarSimples ';'
        ;

listaVarSimples
        : unaVarSimple
	| listaVarSimples ',' unaVarSimple
        ;

unaVarSimple	
        : IDENTIFICADOR           { raizVariables = agregarVariable(raizVariables, $1, buffer_auxiliar, @1.first_line); }
        | IDENTIFICADOR '=' exp   { raizVariables = agregarVariable(raizVariables, $1, buffer_auxiliar, @1.first_line); }
        ;

inicializacion		
        : '=' '('exp')'
        ;

/* Lista de parámetros de funciones (simple): (tipo nombre) separados por coma, o void */
parametro
        : tipoDato IDENTIFICADOR
        ;

listaParametros
        : parametro { $$ = $1; }
        | listaParametros ',' parametro
        ;

parametros
        : VOID { $$ = strdup("void"); }
        | listaParametros { $$ = $1; }
        ;

prototipoDeFuncion
        : tipoDato IDENTIFICADOR '(' parametros ')' ';' { raizFunciones = agregarFuncion(raizFunciones, $2, $1, $4 ? $4 : "void", 0, @2.first_line); if ($1) free($1); if ($4) free($4); }
        ;
definicionDeFuncion
        : tipoDato IDENTIFICADOR '(' parametros ')' sentCompuesta { raizFunciones = agregarFuncion(raizFunciones, $2, $1, $4 ? $4 : "void", 1, @2.first_line); if ($1) free($1); if ($4) free($4); }
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

        imprimirVariablesDeclaradas(raizVariables);
        imprimirFunciones(raizFunciones);
        imprimirSentencias(raizSentencias);
        imprimirEstructurasNoReconocidas(raizEstructurasNoReconocidas);
        imprimirCadenaNoReconocida(raizNoReconocida);

        if (file) 
                fclose(file);
        
        return 0;
}
	/* Definición de la funcion yyerror para reportar errores, necesaria para que la funcion yyparse del analizador sintáctico pueda invocarla para reportar un error */
void yyerror(const char* literalCadena) {
        fprintf(stderr, "Bison: %d:%d: %s\n", yylloc.first_line, yylloc.first_column, literalCadena);
}

/* Fin de la sección de epílogo (código de usuario) */