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
} CategoriaReservada;

typedef enum {
    ERROR_SIN_DECLARAR = 1,
    ERROR_REDECLARACION_TIPO_DIF_SIMBOLO,
    ERROR_CONFLICTO_TIPOS_MISMO_SIMBOLO,
    ERROR_REDECLARACION_VARIABLE_IGUAL_TIPO,
    ERROR_REDEFINICION_FUNCION_IGUAL_TIPO,
    OPERANDOS_INVALIDOS,
    FUNCION_SIN_DECLARAR,
    FUNCION_NO_SE_QUE_PONER,
    INSUFICIENTES_PARAMETROS,
    DEMASIADOS_PARAMETROS,
    INCOMPATIBILIDAD_TIPOS,
    RETORNO_VOID,
    INCOMPATIBILIDAD_TIPOS_AL_INICIAR,
    ASIGNAR_EN_UNA_CONSTANTE,
    NO_EXISTE_L_VALOR_MODIFICABLE,
    NO_RETURN_EN_FUNCION_NO_VOID,
    TIPO_DE_DATO_INCOMPATIBLE_RETURN
} CodigoError;

typedef struct {
    char *nombreIdentificador;
    char *tipoIdentificador;
    int contador;
} infoNodoIdentificadores;

typedef struct {
    char *nombrePuntuaciones;
    int contador;
} infoNodoPuntuaciones;

typedef struct {
    char *nombreLiteralCadena;
    int longitud;
} infoNodoLiteralCadena;

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
} infoNodoReal;

typedef struct {
    char* caracter;
} infoNodoCaracter;

typedef struct {
    char* palabra;
    int linea;
    int columna;
} infoNodoCadenasNoReconocidas;

typedef struct {
    char* nombre;
    char* tipo;
    char* simbolo;
    int linea;
    int columna;
} infoVarDeclarada;

typedef struct {
    char* nombre;
    char* retorna;
    char* parametros;
    int es_definicion;
    int linea;
    int columna;
} infoFuncion;

typedef struct {
    char* tipo;
    int linea;
    int columna;
} infoSentencia;

typedef struct {
    char* texto;
    int linea;
} infoEstructuraNoReconocida;

typedef struct nodoDecimal {
    int valor;
    struct nodoDecimal* sgte;
} nodoDecimal;

typedef struct nodoHexadecimal {
    infoNodoHexadecimal info;
    struct nodoHexadecimal* sgte;
} nodoHexadecimal;

typedef struct nodoOctal {
    infoNodoOctal info;
    struct nodoOctal* sgte;
} nodoOctal;

typedef struct nodoReal {
    infoNodoReal info;
    struct nodoReal* sgte;
} nodoReal;

typedef struct nodoCaracter {
    infoNodoCaracter info;
    struct nodoCaracter* sgte;
} nodoCaracter;

typedef struct nodoIdentificadores {
    infoNodoIdentificadores info;
    struct nodoIdentificadores* sgte;
} nodoIdentificadores;

typedef struct nodoLiteralCadena {
    infoNodoLiteralCadena info;
    struct nodoLiteralCadena* sgte;
} nodoLiteralCadena;

typedef struct nodoReservada {
    infoNodoPalabrasReservada info;
    struct nodoReservada* sgte;
} nodoReservada;

typedef struct nodoPuntuaciones {
    infoNodoPuntuaciones info;
    struct nodoPuntuaciones* sgte;
} nodoPuntuaciones;

typedef struct nodoCadenasNoReconocidas {
    infoNodoCadenasNoReconocidas info;
    struct nodoCadenasNoReconocidas* sgte;
} nodoCadenasNoReconocidas;

typedef struct nodoVarDeclarada {
    infoVarDeclarada info;
    struct nodoVarDeclarada* sgte;
} nodoVarDeclarada;

typedef struct nodoFuncion {
    infoFuncion info;
    struct nodoFuncion* sgte;
} nodoFuncion;

typedef struct nodoSentencia {
    infoSentencia info;
    struct nodoSentencia* sgte;
} nodoSentencia;

typedef struct nodoEstructuraNoReconocida {
    infoEstructuraNoReconocida info;
    struct nodoEstructuraNoReconocida* sgte;
} nodoEstructuraNoReconocida;

typedef struct errorSemantico {
    CodigoError codigo;
    char *identificador;
    char *tipoPrevio;
    char *tipoActual;
    int lineaPrevio;
    int columnaPrevio;
    int lineaActual;
    int columnaActual;
    int numeroArgumento; // Para errores de argumentos
    struct errorSemantico *sgte;
} errorSemantico;

typedef struct tablaDeSimbolos {
    char *nombre;
    char *tipoDato;
    char *tipoSimbolo;
    int linea;
    int columna;
    int definida;
    struct tablaDeSimbolos* sgte;
} tablaDeSimbolos;

#endif /* TIPOS_H */