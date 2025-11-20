#ifndef GLOBAL_H
#define GLOBAL_H

#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include "structsTP2.h"

extern int sumaDecimales;
extern int acumuladorIdentificadores;
extern int num_linea;
extern char* buffer;

extern nodoIdentificadores *raizIdentificador;
extern nodoLiteralCadena *raizLiterales;
extern nodoDecimal *raizDecimal;
extern nodoHexadecimal *raizHexadecimal;
extern nodoOctal *raizOctal;
extern nodoReservada *raizPalabraReservada;
extern nodoReal *raizReal;
extern nodoCaracter *raizCaracter;
extern nodoPuntuaciones *raizPuntuaciones;
extern nodoCadenasNoReconocidas* raizNoReconocida;

extern int yylval;

extern int linea_actual;
extern int columna_actual;

#endif