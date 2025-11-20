#include "structsTP2.h"

nodoIdentificadores * agregarIdentificadores(nodoIdentificadores*raiz , char*elementoParaAgregar);
void imprimirIdentificadores(nodoIdentificadores* raiz);

int obtenerValorDeOctal(int octal);
int obtenerValorDeHexadecimal(char* hex);

nodoLiteralCadena* agregarLiteralesCadena(nodoLiteralCadena *raizLiterales, char *elementoParaAgregar, int longitud);
void imprimirLiteralesCadena(nodoLiteralCadena* raiz);

nodoReservada * agregarReservada(nodoReservada * raizReservada, char *valor, int columna, int linea);
void imprimirAlmacenamiento(nodoReservada *raiz);
void imprimirEspecificadoresTipo(nodoReservada *raiz);
void imprimirCalificadoresTipo(nodoReservada *raiz);
void imprimirCalificadoresUnion(nodoReservada *raiz);
void imprimirEnumeraciones(nodoReservada *raiz);
void imprimirEtiquetas(nodoReservada *raiz);
void imprimirSeleccion(nodoReservada *raiz);
void imprimirIteracion(nodoReservada *raiz);
void imprimirSalto(nodoReservada *raiz);
void imprimirUnario(nodoReservada *raiz);
void imprimirPalabrasReservadas (nodoReservada *raiz);

nodoDecimal* agregarDecimales(nodoDecimal *raiz, int valor);
void imprimirDecimales(nodoDecimal* raiz);

nodoHexadecimal* agregarHexadecimal(nodoHexadecimal *raiz, char* valor);
void imprimirHexadecimales(nodoHexadecimal *raiz);

nodoOctal* agregarOctal(nodoOctal *raiz, char* valor);
void imprimirOctal(nodoOctal *raiz);

nodoReal * agregarReal(nodoReal *raizReal, char *valor);
void imprimirReales(nodoReal *raiz);

nodoCaracter * agregarCaracter(nodoCaracter *raizCaracter, char *valor);
void imprimirCaracteres(nodoCaracter *raiz);

nodoPuntuaciones* agregarPuntuacion (nodoPuntuaciones *raiz, char *caracter);
void imprimirPuntuaciones(nodoPuntuaciones* raiz);

nodoCadenasNoReconocidas* agregarCadenaNoReconocida(nodoCadenasNoReconocidas* raiz, char *valor ,int columna, int linea);
void imprimirCadenaNoReconocida(nodoCadenasNoReconocidas *raiz);




