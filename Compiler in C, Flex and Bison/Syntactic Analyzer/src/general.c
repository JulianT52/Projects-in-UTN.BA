/* En los archivos (*.c) se pueden poner tanto DECLARACIONES como DEFINICIONES de C, así como directivas de preprocesador */
/* Recordar solamente indicar archivos *.h en las directivas de preprocesador #include, nunca archivos *.c */

#include <stdio.h>
#include "general.h"
#include "structsTP3.h"

extern YYLTYPE yylloc;

int sumaDecimales = 0;
int acumuladorIdentificadores = 0;
int num_linea = 1;
char* buffer = NULL;

nodoIdentificadores *raizIdentificador = NULL;
nodoLiteralCadena *raizLiterales = NULL;
nodoDecimal *raizDecimal = NULL;
nodoHexadecimal *raizHexadecimal = NULL;
nodoOctal *raizOctal = NULL;
nodoReservada *raizPalabraReservada = NULL;
nodoReal *raizReal = NULL;
nodoCaracter *raizCaracter = NULL;
nodoPuntuaciones *raizPuntuaciones = NULL;
nodoCadenasNoReconocidas* raizNoReconocida = NULL;

nodoVarDeclarada* raizVariables = NULL;
nodoFuncion* raizFunciones = NULL;
nodoSentencia* raizSentencias = NULL;
nodoEstructuraNoReconocida* raizEstructurasNoReconocidas = NULL;

int linea_actual = 1;
int columna_actual = 1;

char buffer_acumulador[512];

void inicializarUbicacion(void)
{
    yylloc.first_line = yylloc.last_line = INICIO_CONTEO_LINEA;
    yylloc.first_column = yylloc.last_column = INICIO_CONTEO_COLUMNA;
}

