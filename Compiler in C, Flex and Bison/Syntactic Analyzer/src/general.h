#ifndef GENERAL_H
#define GENERAL_H

#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include "structsTP3.h"
#include "misFunciones.h"

/* En los archivos de cabecera (header files) (*.h) poner DECLARACIONES (evitar DEFINICIONES) de C, así como directivas de preprocesador */
/* Recordar solamente indicar archivos *.h en las directivas de preprocesador #include, nunca archivos *.c */

#define YYLTYPE YYLTYPE

extern int sumaDecimales;
extern int acumuladorIdentificadores;
extern int num_linea;

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

extern int linea_actual;
extern int columna_actual;


extern char buffer_acumulador[512];

typedef struct YYLTYPE
{
  int first_line;
  int first_column;
  int last_line;
  int last_column;
} YYLTYPE;

#define INICIO_CONTEO_LINEA 1
#define INICIO_CONTEO_COLUMNA 1

void inicializarUbicacion(void);

#endif