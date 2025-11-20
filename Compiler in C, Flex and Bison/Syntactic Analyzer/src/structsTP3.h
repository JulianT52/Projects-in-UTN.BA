#ifndef TIPOS_H
#define TIPOS_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <errno.h>
#include <limits.h>

typedef enum {
    clase_almacenamiento,
    especificador_tipo,
    clasificador_tipo,
    struct_union,
    enumeracion,
    etiqueta,
    seleccion,
    iteracion,
    salto,
    unario
}CategoriaReservada;

typedef struct{
    char *nombreIdentificador;
    int contador;
}infoNodoIdentificadores;
typedef struct{
    char *nombrePuntuaciones;
    int contador;
}infoNodoPuntuaciones;

typedef struct{
    char *nombreLiteralCadena;
    int longitud; 
}infoNodoLiteralCadena;

typedef struct {
    char* hexadecimal;
    int decimal;
} infoNodoHexadecimal;

typedef struct {
    char* octal;
    int decimal;
} infoNodoOctal;
typedef struct {
    char* palabra;
    int linea;
    int columna;
    CategoriaReservada categoria;
} infoNodoPalabrasReservada;

typedef struct {
    char* valor;
    float parteEntera;
    float mantisa;
}infoNodoReal;

typedef struct {
    char* caracter;
    struct nodoCaracter *sgte;
}infoNodoCaracter;


typedef struct{
    int valor;
    struct nodoDecimal *sgte;
}nodoDecimal;

typedef struct {
    char* palabra;
    int linea;
    int columna;
} infoNodoCadenasNoReconocidas;

typedef struct {
    infoNodoHexadecimal info;
    struct nodoHexadecimal *sgte;
}nodoHexadecimal;

typedef struct {
    infoNodoOctal info;
    struct nodoOctal *sgte;
}nodoOctal;


typedef struct{
    infoNodoReal info;
    struct nodoReal *sgte;
}nodoReal;

typedef struct{
    infoNodoCaracter info;
    struct nodoCaracter *sgte;
}nodoCaracter;

typedef struct{
    infoNodoIdentificadores info;
    struct nodoIdentificadores *sgte;
}nodoIdentificadores;

typedef struct{
    infoNodoLiteralCadena info;
    struct nodoLiteralCadena *sgte;
}nodoLiteralCadena;
typedef struct{
    infoNodoPalabrasReservada info;
    struct nodoReservada* sgte;
} nodoReservada;

typedef struct{
    infoNodoPuntuaciones info;
   struct nodoPuntuaciones * sgte;
} nodoPuntuaciones;

typedef struct{
    infoNodoCadenasNoReconocidas info;
   struct nodoCadenasNoReconocidas * sgte;
} nodoCadenasNoReconocidas;
typedef struct {
    char* nombre;
    char* tipo;
    int linea;
} infoVarDeclarada;

typedef struct nodoVarDeclarada {
    infoVarDeclarada info;
    struct nodoVarDeclarada* sgte;
} nodoVarDeclarada;

typedef struct {
    char* nombre;
    char* retorna;
    char* parametros;
    int es_definicion;
    int linea;
} infoFuncion;

typedef struct nodoFuncion {
    infoFuncion info;
    struct nodoFuncion* sgte;
} nodoFuncion;

typedef struct {
    char* tipo;
    int linea;
    int columna;
} infoSentencia;

typedef struct nodoSentencia {
    infoSentencia info;
    struct nodoSentencia* sgte;
} nodoSentencia;

typedef struct {
    char* texto;
    int linea;
} infoEstructuraNoReconocida;

typedef struct nodoEstructuraNoReconocida {
    infoEstructuraNoReconocida info;
    struct nodoEstructuraNoReconocida* sgte;
} nodoEstructuraNoReconocida;

#endif /* TIPOS_H */