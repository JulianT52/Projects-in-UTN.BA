
#include "structsTP2.h"

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

int yylval = 0;

int linea_actual = 1;
int columna_actual = 1;
