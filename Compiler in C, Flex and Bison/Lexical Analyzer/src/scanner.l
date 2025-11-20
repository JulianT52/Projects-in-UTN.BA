
/* Inicio de la sección de definiciones. Aquí: */
    /* 1. Cualquier texto sangrado o encerrado entre '%{' y '%}' (estos últimos dos sin sangrar en líneas ocupadas únicamente por ellos) se copia íntegramente al archivo de salida del analizador léxico (scanner) generado (*.lex.yy.c) */
        /* De esas formas podemos poner declaraciones y definiciones de C y directivas del preprocesador */
    /* 2. Los comentarios (sólo hay de múltiples líneas) sin sangría también se copian tal cual al archivo de salida del analizador léxico (scanner) generado (*.lex.yy.c) */

%{

#include "misFunciones.h"
#include "global.h"

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
/* digito [0-9] */
digito [0-9]
digitoNoCero [1-9]
digitoOctal [0-7]
digitoHexa [0-9a-fA-F]
noDigito [_a-zA-Z]
sufijoEntero ([uU][lL]?|[lL][uU]?)
sufijoReal ([fF][lL]?|[lL][fF]?)
escapeSimple [abfnrtv'\"\?\\]
exponente (e[+-]?{digito}*)
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
puntuaciones ("["|"]"|"("|")"|"{"|"}"|"."|"->"|"++"|"--"|"&"|"*"|"+"|"-"|"̃ "|"!"|"/"|"%"|"<<"|">>"|"<"|">"|"<="|">="|"=="|"!="|"^"|"|"|"&&"|"||"|"="|"*="|"/="|"%="|"+="|"-="|"<<="|">>="|"&="|"^="|"|="|"?"|":"|";"|"..."|","|"#"|"##")
noReconocida ([^ \t\n])

/* Fin de la sección de definiciones */

/* Inicio de la sección de reglas. Aquí: */
    /* 1. Cualquier texto sangrado o encerrado entre '%{' y '%}' (estos últimos dos sin sangrar en líneas ocupadas únicamente por ellos) se copia íntegramente al archivo de salida del analizador léxico (scanner) generado (*.lex.yy.c) */
        /* Esto podría utilizarse para declarar variables que son locales a la rutina de análisis léxico y (después de las declaraciones) al código que debe ejecutarse siempre que se entra a la rutina de análisis léxico */
    /* 2. NO pueden hacerse comentarios sin sangría, ya que estos no se copian literalmente al archivo de salida del analizador léxico (scanner) generado (*.lex.yy.c) */
%%

[ ] { columna_actual += 1; }
[\t] { columna_actual += 4; }         
\n { linea_actual += yyleng; columna_actual = 1; }    
        
{almacenamiento}|{especificadoresDeTipo}|{especificadoresDeTipo}|{especificadoresDeTipo}|{calificadoresDeEnum}|{etiquetas}|{seleccion}|{iteracion}|{salto}|{unario}|{calificadoresDeTipo}|{calificadoresDeUnion} { 
    raizPalabraReservada = agregarReservada(raizPalabraReservada, yytext, columna_actual, linea_actual);
    columna_actual += yyleng;
}
    

{digitoNoCero}{digito}*{sufijoEntero}? { 
    raizDecimal = agregarDecimales(raizDecimal,atoi(yytext));
    columna_actual += (yyleng);
}


0{digitoOctal}*{sufijoEntero}? { 
    raizOctal = agregarOctal(raizOctal, yytext);
    columna_actual += yyleng;
}


0[xX]{digitoHexa}+{sufijoEntero}? { 
    raizHexadecimal = agregarHexadecimal(raizHexadecimal, yytext);
    columna_actual += yyleng;
}


{noDigito}({noDigito}|{digito})* {
    raizIdentificador = agregarIdentificadores(raizIdentificador, yytext);
    columna_actual += yyleng;
}


{digito}*((\.{digito}*{exponente}?)|{exponente}){sufijoReal}? { 
    raizReal = agregarReal(raizReal, yytext);
    columna_actual += yyleng;
}


'([^'\\]|\\{escapeSimple}|\\{digitoOctal}+|\\[xX]{digitoHexa}+)' { 
    raizCaracter = agregarCaracter(raizCaracter, yytext);
    columna_actual += yyleng;
}


\"([^\"\\]|\\{escapeSimple}|\\{digitoOctal}+|\\[xX]{digitoHexa}+)*\" { 
    raizLiterales = agregarLiteralesCadena(raizLiterales, yytext, yyleng - 2);
    columna_actual += yyleng;
}

{puntuaciones} {
    raizPuntuaciones = agregarPuntuacion(raizPuntuaciones, yytext);
    columna_actual += yyleng;
}

{noReconocida} { 
    buffer = strdup(yytext);
    columna_actual += yyleng;
    BEGIN(tokenNoReconocido); 
}

<tokenNoReconocido>{
    <<EOF>> {
        fprintf(stderr, "\n");
        BEGIN(INITIAL);
    }

    [ ] {
        columna_actual += 1;
        BEGIN(INITIAL);
    }
    [\t] {
        columna_actual += 4;
        BEGIN(INITIAL);
    }

    \n {
        linea_actual += 1;
        columna_actual = 1;

        BEGIN(INITIAL);
    }

    [^ \t\n]+ {
        int columna_inicio = columna_actual - 1;
        if(buffer == NULL){
            buffer = calloc(yyleng + 1, sizeof(char));
            strncpy(buffer, yytext, yyleng);
        }
        else{
            size_t actual_len = strlen(buffer);
            buffer = realloc(buffer, actual_len + yyleng + 1);
            strncat(buffer, yytext, yyleng);
        }

        raizNoReconocida = agregarCadenaNoReconocida(raizNoReconocida, buffer, columna_inicio, linea_actual);
        columna_actual += yyleng;

        free(buffer);
        buffer = NULL;
        BEGIN(INITIAL);
    }
}


%%

int main(int argc, char *argv[]) {

    yyin = fopen(argv[1],"r");
    yylex();

    imprimirIdentificadores(raizIdentificador);
    imprimirLiteralesCadena(raizLiterales);
    imprimirPalabrasReservadas (raizPalabraReservada);
    imprimirDecimales(raizDecimal);
    imprimirHexadecimales(raizHexadecimal);
    imprimirOctal(raizOctal);
    imprimirReales(raizReal);
    imprimirCaracteres(raizCaracter);
    imprimirPuntuaciones(raizPuntuaciones);
    imprimirCadenaNoReconocida(raizNoReconocida);

    fclose(yyin);

    return 0;
}


/* Fin de la sección de código de usuario */