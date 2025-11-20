
/* Inicio de la sección de definiciones. Aquí: */
    /* 1. Cualquier texto sangrado o encerrado entre '%{' y '%}' (estos últimos dos sin sangrar en líneas ocupadas únicamente por ellos) se copia íntegramente al archivo de salida del analizador léxico (scanner) generado (*.lex.yy.c) */
        /* De esas formas podemos poner declaraciones y definiciones de C y directivas del preprocesador */
    /* 2. Los comentarios (sólo hay de múltiples líneas) sin sangría también se copian tal cual al archivo de salida del analizador léxico (scanner) generado (*.lex.yy.c) */

%{

#include "general.h"

/* Es indispensable que incluyamos el archivo de cabecera con las definiciones de YACC (*.tab.h) que se genera a partir del archivo fuente de YACC (*.y) */
#include "parser.tab.h"

/* Utilidades estándar */
#include <stdlib.h>
#include <string.h>

/* Estado para errores léxicos */
static char *buffer = NULL;
static int error_start_line = 0;
static int error_start_column = 0;

%}

    /* La siguiente línea define explícitamente a yytext como un puntero a un caracter ( char* yytext; ). Ésta es la opción por defecto si no se pone nada. */
%pointer
    /* Con la siguiente opción la función de análisis int yylex(void); se comporta como si en la sección de usuario existiera la función int yywrap(void) return 1; la cual devuelve verdadero (no-cero), haciendo que una vez que la función de análisis int yylex(void) reciba una indicación de EOF desde YY_INPUT, asuma que no hay nada más para analizar de yyin y finalice (haciendo un return 0;) */
%option noyywrap

    /* Condiciones de arranque inclusivas */
/* %s */
    /* Condiciones de arranque exclusivas */
%x tokenNoReconocido

    /* Declaraciones con cada nombre y su definición; se utilizan para simplificar las reglas */
digito [0-9]
digitoNoCero [1-9]
digitoOctal [0-7]
digitoHexa [0-9a-fA-F]
noDigito [_a-zA-Z]
sufijoEntero ([uU][lL]?|[lL][uU]?)
sufijoReal ([fF][lL]?|[lL][fF]?)
escapeSimple [abfnrtv'\"\?\\]
exponente ([eE][+-]?{digito}+)
almacenamiento (auto|register|static|extern|typedef)
especificadoresDeTipo (void|char|short|int|long|float|double|signed|unsigned)
calificadoresDeTipo (const|volatile)
calificadoresDeUnion (struct|union)
calificadoresDeEnum (enum)
etiquetas (case|default)
seleccion (if|else|switch)
iteracion (do|while|for)
salto (goto|continue|break|return)
unario (sizeof)
puntuaciones ("["|"]"|"("|")"|"{"|"}"|"."|"&"|"*"|"+"|"-"|"!"|"/"|"%"|"<"|">"|"^"|"|"|"="|"?"|":"|";"|","|"#")
noReconocida ([^ \t\n])

/* Fin de la sección de definiciones */

/* Inicio de la sección de reglas. Aquí: */
    /* 1. Cualquier texto sangrado o encerrado entre '%{' y '%}' (estos últimos dos sin sangrar en líneas ocupadas únicamente por ellos) se copia íntegramente al archivo de salida del analizador léxico (scanner) generado (*.lex.yy.c) */
        /* Esto podría utilizarse para declarar variables que son locales a la rutina de análisis léxico y (después de las declaraciones) al código que debe ejecutarse siempre que se entra a la rutina de análisis léxico */
    /* 2. NO pueden hacerse comentarios sin sangría, ya que estos no se copian literalmente al archivo de salida del analizador léxico (scanner) generado (*.lex.yy.c) */
%%

"void"      { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return VOID; }
"char"      { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return CHAR; }
"short"     { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return SHORT; }
"int"       { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return INT; }
"long"      { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return LONG; }
"float"     { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return FLOAT; }
"double"    { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return DOUBLE; }
"signed"    { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return SIGNED; }
"unsigned"  { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return UNSIGNED; }
"case"      { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return CASE; }
"default"   { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return DEFAULT; }
"if"        { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return IF; }
"else"      { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return ELSE; }
"switch"    { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return SWITCH; }
"do"        { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return DO; }
"while"     { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return WHILE; }
"for"       { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return FOR; }
"continue"  { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return CONTINUE; }
"break"     { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return BREAK; }
"return"    { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, yylloc.first_column, yylloc.first_line); yylval.string = strdup(yytext); return RETURN; }
    
{digitoNoCero}{digito}*{sufijoEntero}? { 
    raizDecimal = agregarDecimales(raizDecimal,atoi(yytext));
    yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng;
    yylval.numeros = atoi(yytext);
    return DECIMAL;
}


0{digitoOctal}*{sufijoEntero}? { 
    raizOctal = agregarOctal(raizOctal, yytext);
    yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng;
    yylval.numeros = strtol(yytext, NULL, 8);
    return OCTAL;
}


0[xX]{digitoHexa}+{sufijoEntero}? { 
    raizHexadecimal = agregarHexadecimal(raizHexadecimal, yytext);
    yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng;
    yylval.numeros = strtol(yytext, NULL, 16);
    return HEXA;
}


{noDigito}({noDigito}|{digito})* {
    raizIdentificador = agregarIdentificadores(raizIdentificador, yytext);
    yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng;
    yylval.string = strdup(yytext);
    {
        long aux = strlen(buffer_acumulador);
        if (aux + yyleng + 1 < sizeof(buffer_acumulador)) {
            strncat(buffer_acumulador, yytext, yyleng);
        }
    }

    return IDENTIFICADOR;
}

{digito}+\.{digito}+({exponente})?{sufijoReal}? { 
    raizReal = agregarReal(raizReal, yytext);
    yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng;
    yylval.constantes = strtod(yytext, NULL);
    return REAL;
}

{digito}+{exponente}{sufijoReal}? {
    raizReal = agregarReal(raizReal, yytext);
    yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng;
    yylval.constantes = strtod(yytext, NULL);
    return REAL;
}

\.{digito}+({exponente})?{sufijoReal}? {
    raizReal = agregarReal(raizReal, yytext);
    yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng;
    yylval.constantes = strtod(yytext, NULL);
    return REAL;
}

'([^'\\]|\\{escapeSimple}|\\{digitoOctal}+|\\[xX]{digitoHexa}+)' { 
    raizCaracter = agregarCaracter(raizCaracter, yytext);
    yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng;
    yylval.caracter = strdup(yytext);
    return CARACTER;
}

\"([^\"\\]|\\{escapeSimple}|\\{digitoOctal}+|\\[xX]{digitoHexa}+)*\" { 
    raizLiterales = agregarLiteralesCadena(raizLiterales, yytext, yyleng - 2);
    yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng;
    yylval.string = strdup(yytext);
    return LITERAL_CADENA;
}

"++"   { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; return INCREMENTO; }
"--"   { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; return DECREMENTO; }
"+="   { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; return MAS_IGUAL; }
"-="   { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; return MENOS_IGUAL; }
"*="   { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; return MULTIPLICAR_IGUAL; }
"/="   { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; return DIVIDIR_IGUAL; }
"=="   { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; return IGUAL_IGUAL; }
"!="   { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; return NEGADO_IGUAL; }
">="   { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; return MAYOR_IGUAL; }
"<="   { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; return MENOR_IGUAL; }
"&&"   { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; return AND; }
"||"   { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; return OR; }

{puntuaciones} {
    raizPuntuaciones = agregarPuntuacion(raizPuntuaciones, yytext);
    yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng;
    {
        long aux = strlen(buffer_acumulador);
        if (aux + yyleng + 1 < sizeof(buffer_acumulador)) strncat(buffer_acumulador, yytext, yyleng);
    }
    return yytext[0];
}

[ \t]+ { yylloc.first_column = yylloc.last_column; yylloc.last_column += yyleng; { long aux = strlen(buffer_acumulador); if (aux + yyleng + 1 < sizeof(buffer_acumulador)) strncat(buffer_acumulador, yytext, yyleng); } }

\n {
        yylloc.last_line += yyleng;
        yylloc.first_line = yylloc.last_line;
        yylloc.first_column = yylloc.last_column = INICIO_CONTEO_COLUMNA;
        buffer_acumulador[0] = '\0';
    }

[^ \t\n] {
    yylloc.first_column = yylloc.last_column;
    yylloc.last_column += yyleng;
    if (buffer) { 
        free(buffer); 
        buffer = NULL; }
    
    buffer = (char*)malloc(yyleng + 1);
    memcpy(buffer, yytext, yyleng);
    buffer[yyleng] = '\0';
    error_start_line = yylloc.first_line;
    error_start_column = yylloc.first_column;
    BEGIN(tokenNoReconocido);
}

<tokenNoReconocido>{
    <<EOF>> {
        BEGIN(INITIAL);
    }

    [ ]     { BEGIN(INITIAL); }
    [\t]    { BEGIN(INITIAL); }

    \n {
        BEGIN(INITIAL);
    }

    [^ \t\n]+ {
        if(buffer == NULL){
            buffer = (char*)malloc(yyleng + 1);
            memcpy(buffer, yytext, yyleng);
            buffer[yyleng] = '\0';
        }
        else{
            size_t actual_len = strlen(buffer);
            buffer = realloc(buffer, actual_len + yyleng + 1);
            strncat(buffer, yytext, yyleng);
        }

        raizNoReconocida = agregarCadenaNoReconocida(raizNoReconocida, buffer, error_start_column, error_start_line);
        free(buffer); buffer = NULL;
        BEGIN(INITIAL);
    }
}


    /* Reglas por defecto de Flex: */
        /* <*>.|\n { ECHO; } */
            /* (ECHO; escribe yytext en la salida del escáner: FILE* yyout (variable global a la cual por defecto se le asigna stdout)) */
        /* <<EOF>> { yyterminate(); } */
            /* (yyterminate(); hace que la función yylex finalice retornando un 0, indicando un fin-de-entrada (EOF)) */

%%
/* Fin de la sección de reglas */ 

/* Inicio de la sección de código de usuario, la cual: */
	/* 1. Se utiliza para rutinas de complemento que llaman al analizador léxico o son llamadas por este; la presencia de esta sección es opcional */
    /* 2. Toda esta sección simplemente se copia íntegramente al archivo de salida del analizador léxico (scanner) generado (*.lex.yy.c) */

/* Fin de la sección de código de usuario */










