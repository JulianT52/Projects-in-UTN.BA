#include "misFunciones.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

// ---------- IDENTIFICADORES ----------


nodoIdentificadores * agregarIdentificadores(nodoIdentificadores*raiz , char*elementoParaAgregar) {
    nodoIdentificadores *aux = raiz;

    while (aux != NULL) {
        if (strcmp(aux->info.nombreIdentificador, elementoParaAgregar) == 0) {
            aux->info.contador += 1;
            return raiz;
        }
        aux = aux->sgte;
    }

    nodoIdentificadores *nuevo = (nodoIdentificadores *)malloc(sizeof(nodoIdentificadores));
    if (!nuevo) return raiz;

    nuevo->info.nombreIdentificador = strdup(elementoParaAgregar);
    if (!nuevo->info.nombreIdentificador) {
        free(nuevo);
        return raiz;
    }

    nuevo->info.contador = 1;
    nuevo->sgte = NULL;

    nodoIdentificadores *punteroAnterior = NULL;
    nodoIdentificadores *punteroActual = raiz;

    while (punteroActual != NULL && strcmp(punteroActual->info.nombreIdentificador, elementoParaAgregar) < 0) {
        punteroAnterior = punteroActual;
        punteroActual = punteroActual->sgte;
    }

    if (punteroAnterior != NULL) {
        punteroAnterior->sgte = nuevo;
    } else {
        raiz = nuevo;
    }

    nuevo->sgte = punteroActual;
    return raiz;
}

void imprimirIdentificadores(nodoIdentificadores* raiz) {
    nodoIdentificadores* aux = raiz;
    int encontradas = 0;
    printf("* Listado de identificadores encontrados: \n");

    while (aux != NULL) {
        if(aux->info.contador > 1){
        printf("%s: aparece %d veces\n", aux->info.nombreIdentificador, aux->info.contador);
        encontradas = 1; 
        aux = aux->sgte;
        }
        else{
        printf("%s: aparece %d vez\n", aux->info.nombreIdentificador, aux->info.contador);
        encontradas = 1; 
        aux = aux->sgte;
        }
    }

    if (encontradas == 0) {
            printf("-\n");
    }
    printf("\n");

}

// ---------- LITERALES CADENA ----------

nodoLiteralCadena* agregarLiteralesCadena(nodoLiteralCadena *raizLiterales, char *elementoParaAgregar, int longitud) {
    nodoLiteralCadena *aux = raizLiterales;
    nodoLiteralCadena *nuevo = (nodoLiteralCadena*)malloc(sizeof(nodoLiteralCadena));
    if (!nuevo) return raizLiterales;

    nuevo->info.nombreLiteralCadena = strdup(elementoParaAgregar);
    if (!nuevo->info.nombreLiteralCadena) {
        free(nuevo);
        return raizLiterales;
    }

    nuevo->info.longitud = longitud;
    nuevo->sgte = NULL;

    nodoLiteralCadena *punteroAnterior = NULL;
    nodoLiteralCadena *punteroActual = raizLiterales;

    while (punteroActual != NULL && punteroActual->info.longitud <= nuevo->info.longitud) {
        punteroAnterior = punteroActual;
        punteroActual = punteroActual->sgte;
    }

    if (punteroAnterior != NULL) {
        punteroAnterior->sgte = nuevo;
    } else {
        raizLiterales = nuevo;
    }

    nuevo->sgte = punteroActual;
    return raizLiterales;
}

void imprimirLiteralesCadena(nodoLiteralCadena* raiz) {
    nodoLiteralCadena* aux = raiz;
    int encontradas = 0;
    printf ("* Listado de literales cadena encontrados: \n");
   
    while (aux != NULL) {
        printf("%s: longitud %d\n", aux->info.nombreLiteralCadena, aux->info.longitud);
        encontradas = 1;
        aux = aux->sgte;
    }
    if (encontradas == 0) {
        printf("-\n");
    }
    printf("\n");

}

// ----------Palabras Reservadas-------

nodoReservada * agregarReservada(nodoReservada * raizReservada, char *valor, int columna, int linea){

    nodoReservada * nuevo = (nodoReservada*)malloc(sizeof(nodoReservada));
    nuevo->info.columna = columna;
    nuevo->info.linea = linea;
    nuevo->info.palabra = strdup(valor);
    nuevo->sgte = NULL;
    
    nodoReservada * aux = raizReservada;

    if(raizReservada == NULL){
      raizReservada = nuevo;  
      return raizReservada;
    }
    else{
        while(aux->sgte != NULL){
            aux = aux->sgte;
        }
        aux->sgte = nuevo;
        return raizReservada;
    }
}

void imprimirAlmacenamiento(nodoReservada *raiz) {

    nodoReservada *aux = raiz;
    int encontradas = 0;

    printf("* Listado de palabras reservadas (clase de almacenamiento):\n");

    while (aux != NULL) {
        if (strcmp(aux->info.palabra, "auto") == 0 || 
            strcmp(aux->info.palabra, "register") == 0 ||
            strcmp(aux->info.palabra, "static") == 0 || 
            strcmp(aux->info.palabra, "extern") == 0 ||
            strcmp(aux->info.palabra, "typedef") == 0) 
        {
            printf("%s: linea %d, columna %d\n", aux->info.palabra,aux->info.linea, aux->info.columna);
            encontradas = 1;
        }
        aux = aux->sgte;
    }

    if (encontradas == 0) {
        printf("-\n");
    }


}

void imprimirEspecificadoresTipo(nodoReservada *raiz) {
    int encontradas = 0;
    nodoReservada *aux = raiz;
    printf("* Listado de palabras reservadas (especificadores de tipo):\n");

    while (aux != NULL) {
        if (strcmp(aux->info.palabra, "void") == 0 ||
            strcmp(aux->info.palabra, "char") == 0 ||
            strcmp(aux->info.palabra, "short") == 0 ||
            strcmp(aux->info.palabra, "int") == 0 ||
            strcmp(aux->info.palabra, "long") == 0 ||
            strcmp(aux->info.palabra, "float") == 0 ||
            strcmp(aux->info.palabra, "double") == 0 ||
            strcmp(aux->info.palabra, "signed") == 0 ||
            strcmp(aux->info.palabra, "unsigned") == 0) 
        {
            printf("%s: linea %d, columna %d\n", aux->info.palabra, aux->info.linea, aux->info.columna);
            encontradas = 1;
        }
        aux = aux->sgte;
    }
    if (encontradas == 0) {
        printf("-\n");
    }


}

void imprimirCalificadoresTipo(nodoReservada *raiz) {
    nodoReservada *aux = raiz;
    int encontradas = 0;
    printf("* Listado de palabras reservadas (calificadores de tipo):\n");
    
    while (aux != NULL) {
        if (strcmp(aux->info.palabra, "const") == 0 ||
            strcmp(aux->info.palabra, "volatile") == 0) {
            printf("%s: linea %d, columna %d\n", aux->info.palabra, aux->info.linea, aux->info.columna);
            encontradas = 1;
        }
        aux = aux->sgte;
    }
    if (encontradas == 0) {
      printf("-\n");
}


}

void imprimirCalificadoresUnion(nodoReservada *raiz) {
    nodoReservada *aux = raiz;
    int encontradas = 0;
    printf("* Listado de palabras reservadas (struct o union):\n");

    while (aux != NULL) {
        if (strcmp(aux->info.palabra, "struct") == 0 ||
            strcmp(aux->info.palabra, "union") == 0) {
            printf("%s: linea %d, columna %d\n", aux->info.palabra, aux->info.linea, aux->info.columna);
            encontradas = 1;
        }
        aux = aux->sgte;
    }

    if (encontradas == 0) {
        printf("-\n");
    }


}


void imprimirEnumeraciones(nodoReservada *raiz) {
    nodoReservada *aux = raiz;
    int encontradas = 0;
    printf("* Listado de palabras reservadas (enumeracion):\n");
 
    while (aux != NULL) {
        if (strcmp(aux->info.palabra, "enum") == 0) {
            printf("%s: linea %d, columna %d\n", aux->info.palabra, aux->info.linea, aux->info.columna);
            encontradas = 1;
        }
        aux = aux->sgte;
    }

    if (encontradas == 0) {
        printf("-\n");
    }


}


void imprimirEtiquetas(nodoReservada *raiz){
    nodoReservada *aux = raiz;
    int encontradas = 0;
    printf("* Listado de palabras reservadas (etiqueta):\n");

    while (aux != NULL) {
        if (strcmp(aux->info.palabra, "case") == 0 ||
            strcmp(aux->info.palabra, "default") == 0) {
            printf("%s: linea %d, columna %d\n", aux->info.palabra, aux->info.linea, aux->info.columna);
            encontradas = 1;
        }
        aux = aux->sgte;
    }

    if (encontradas == 0) {
        printf("-\n");
    }    


}

void imprimirSeleccion(nodoReservada *raiz) {
    nodoReservada *aux = raiz;
    int encontradas = 0;
    printf("* Listado de palabras reservadas (seleccion):\n");

    while (aux != NULL) {
        if (strcmp(aux->info.palabra, "if") == 0 ||
            strcmp(aux->info.palabra, "else") == 0 ||
            strcmp(aux->info.palabra, "switch") == 0) {
            printf("%s: linea %d, columna %d\n", aux->info.palabra, aux->info.linea, aux->info.columna);
            encontradas = 1;
        }
        aux = aux->sgte;
    }

    if (encontradas == 0) {
        printf("-\n");
    }

}


void imprimirIteracion(nodoReservada *raiz) {
    nodoReservada *aux = raiz;
    int encontradas = 0;
    printf("* Listado de palabras reservadas (iteracion):\n");

    while (aux != NULL) {
        if (strcmp(aux->info.palabra, "for") == 0 ||
            strcmp(aux->info.palabra, "while") == 0 ||
            strcmp(aux->info.palabra, "do") == 0) {
            printf("%s: linea %d, columna %d\n", aux->info.palabra, aux->info.linea, aux->info.columna);
            encontradas = 1;
        }
        aux = aux->sgte;
    }
    if (encontradas == 0) {
      printf("-\n");
}


}


void imprimirSalto(nodoReservada *raiz) {
    nodoReservada *aux = raiz;
    int encontradas = 0;
    printf("* Listado de palabras reservadas (salto):\n");

    while (aux != NULL) {
        if (strcmp(aux->info.palabra, "goto") == 0 ||
            strcmp(aux->info.palabra, "continue") == 0 ||
            strcmp(aux->info.palabra, "break") == 0 ||
            strcmp(aux->info.palabra, "return") == 0) {
            printf("%s: linea %d, columna %d\n", aux->info.palabra, aux->info.linea, aux->info.columna);
        }
        encontradas = 1;
        aux = aux->sgte;
    }
    if (encontradas == 0) {
      printf("-\n");
    }


}

void imprimirUnario(nodoReservada *raiz) {
    nodoReservada *aux = raiz;
    int encontradas = 0;
    printf("* Listado de palabras reservadas (unario):\n");

    while (aux != NULL) {
        if (strcmp(aux->info.palabra, "sizeof") == 0) {
            printf("%s: linea %d, columna %d\n", aux->info.palabra, aux->info.linea, aux->info.columna);
            encontradas = 1;
        }
        aux = aux->sgte;
    }
    
    if (encontradas == 0) {
        printf("-\n");
    }


}


void imprimirPalabrasReservadas (nodoReservada *raiz){
    
    imprimirAlmacenamiento(raiz);
    printf("\n");
    imprimirEspecificadoresTipo(raiz);
    printf("\n");
    imprimirCalificadoresTipo(raiz);
    printf("\n");
    imprimirCalificadoresUnion(raiz);
    printf("\n");
    imprimirEnumeraciones(raiz);
    printf("\n");
    imprimirEtiquetas(raiz);
    printf("\n");
    imprimirSeleccion(raiz);
    printf("\n");
    imprimirIteracion(raiz);
    printf("\n");
    imprimirSalto(raiz);
    printf("\n");
    imprimirUnario(raiz);
    printf("\n");

}

// ---------- DECIMALES ----------
nodoDecimal* agregarDecimales(nodoDecimal *raiz, int valor) {
    nodoDecimal *nuevo = (nodoDecimal *)malloc(sizeof(nodoDecimal));
    nuevo->valor = valor;
    nuevo->sgte = NULL;
    if (raiz == NULL) {
        return nuevo;
    }
    nodoDecimal *aux = raiz;
    while (aux->sgte != NULL) {
        aux = aux->sgte;
    }
    aux->sgte = nuevo;
    return raiz;
}

void imprimirDecimales(nodoDecimal *raiz){
    
    nodoDecimal *aux = raiz;
    int suma = 0;
    int encontradas = 0;
    printf("* Listado de constantes enteras decimales: \n");
    
    while(aux != NULL){

        printf("%d: valor %d\n", aux->valor, aux->valor);
        suma += aux->valor;
        encontradas = 1;
        aux = aux->sgte;
    }
    if(suma > 0){
        printf("Total acumulado de sumar todas las constantes decimales: %d\n", suma);
        }
    if (encontradas == 0) {
        printf("-\n");
    }
    printf("\n");

}



// ---------- Hexadecimal -----------
nodoHexadecimal* agregarHexadecimal(nodoHexadecimal *raiz, char* valor){

    nodoHexadecimal *nuevo = (nodoHexadecimal *)malloc(sizeof(nodoHexadecimal));
    nuevo->info.hexadecimal = strdup(valor);
    nuevo->info.decimal = strtol(valor, NULL, 16);
    nuevo->sgte = NULL;
    if (raiz == NULL) {
        return nuevo;
    }
    nodoHexadecimal *aux = raiz;
    while (aux->sgte != NULL) {
        aux = aux->sgte;
    }
    aux->sgte = nuevo;
    return raiz;
}

void imprimirHexadecimales(nodoHexadecimal *raiz){
    
    nodoHexadecimal *aux = raiz;
    int encontradas = 0;
    printf("* Listado de constantes enteras hexadecimales: \n");
    
    while(aux != NULL){
        printf("%s: valor entero decimal %d\n", aux->info.hexadecimal, aux->info.decimal);
        encontradas = 1;
    aux = aux->sgte;
}
if (encontradas == 0) {
    printf("-\n");
    }
printf("\n");

}


// ----------- Octales ---------
nodoOctal* agregarOctal(nodoOctal *raiz, char* valor){

    nodoOctal *nuevo = (nodoOctal *)malloc(sizeof(nodoOctal));
    nuevo->info.octal = strdup(valor);
    nuevo->info.decimal = (int)strtol(valor, NULL, 8);
    nuevo->sgte = NULL;
    if (raiz == NULL) {
        return nuevo;
    }
    nodoOctal *aux = raiz;
    while (aux->sgte != NULL) {
        aux = aux->sgte;
    }
    aux->sgte = nuevo;
    return raiz;
}

void imprimirOctal(nodoOctal *raiz){
    
    nodoOctal *aux = raiz;
    int encontradas = 0;
    printf("* Listado de constantes enteras octales: \n");
    
    while(aux != NULL){
        printf("%s: valor entero decimal %d\n", aux->info.octal, aux->info.decimal);
        encontradas = 1;
    aux = aux->sgte;
}
if (encontradas == 0) {
    printf("-\n");
    }
printf("\n");

}


// ----------- Reales ---------
nodoReal * agregarReal(nodoReal *raizReal, char* valor){
    nodoReal * aux = raizReal;
    nodoReal * nuevo = (nodoReal*)malloc(sizeof(nodoReal));
    float valorDecimal = atof(valor);

    nuevo->info.valor = strdup(valor);
    nuevo->info.parteEntera = floor(valorDecimal);
    nuevo->info.mantisa = (float)(valorDecimal - floor(valorDecimal));
    nuevo->sgte = NULL;
    
    if(raizReal == NULL){
        raizReal = nuevo;
        return nuevo;
    }
    else{

        while(aux->sgte != NULL){
            aux=aux->sgte;
        }
    }
    aux->sgte = nuevo;
    return raizReal;
}

void imprimirReales(nodoReal * raizReal){

    nodoReal * aux = raizReal;
    int encontradas = 0;
    printf("* Listado de constantes reales: \n");
    
    while( aux !=NULL){
        printf("%s: parte entera %f, mantisa %f\n", aux->info.valor, aux->info.parteEntera, aux->info.mantisa );
        encontradas = 1;
        aux=aux->sgte;
    }
    if (encontradas == 0) {
    printf("-\n");
    }
printf("\n");

}

// ------ Caracteres --------
nodoCaracter * agregarCaracter (nodoCaracter *raizCaracter, char* valor){
    nodoCaracter * aux = raizCaracter;
    nodoCaracter *nuevo = (nodoCaracter*)malloc(sizeof(nodoCaracter));
    nuevo->info.caracter = strdup(valor);
    nuevo->sgte = NULL;

    if (raizCaracter == NULL) {
        raizCaracter = nuevo;
        return nuevo;     
    } else {
        while (aux->sgte != NULL) {
            aux = aux->sgte;
    }
    }
    aux->sgte = nuevo;
    return raizCaracter;
}

void imprimirCaracteres (nodoCaracter *raizCaracter) {
    nodoCaracter *aux = raizCaracter;
    int contador = 0;
    int encontradas = 0;
    printf("* Listado de constantes caracter enumerados: \n");
   
    while( aux !=NULL){
    contador+=1;
    printf("%d) %s\n", contador,aux->info.caracter);
    encontradas = 1;
    aux=aux->sgte;
    }
    if (encontradas == 0) {
        printf("-\n");
    }
printf("\n");

}

// ------------- Puntuacion -------------
nodoPuntuaciones* agregarPuntuacion(nodoPuntuaciones *raiz, char *caracter) {
    nodoPuntuaciones *aux = raiz;

    while (aux != NULL) {
        if (strcmp(aux->info.nombrePuntuaciones, caracter) == 0) {
            aux->info.contador += 1;
            return raiz;
        }
        aux = aux->sgte;
    }

    nodoPuntuaciones *nuevo = (nodoPuntuaciones*)malloc(sizeof(nodoPuntuaciones));
    nuevo->info.nombrePuntuaciones = strdup(caracter);
    nuevo->info.contador = 1;
    nuevo->sgte = NULL;

    if (raiz == NULL) 
        return nuevo;
      else {
        aux = raiz;
        while (aux->sgte != NULL) {
            aux = aux->sgte;
        }
        aux->sgte = nuevo;
        return raiz;
    }
}

void imprimirPuntuaciones(nodoPuntuaciones* raiz) {
    nodoPuntuaciones* aux = raiz;
    int encontradas = 0;
    printf("* Listado de operadores/caracteres de puntuacion: \n");
   
    while (aux != NULL) {

        if(aux->info.contador > 1){
        printf("%s: aparece %d veces\n", aux->info.nombrePuntuaciones, aux->info.contador);
        encontradas = 1; 
        aux = aux->sgte;
        }
        else{
        printf("%s: aparece %d vez\n", aux->info.nombrePuntuaciones, aux->info.contador);
        encontradas = 1; 
        aux = aux->sgte;
        }
        
    }
    if (encontradas == 0) {
    printf("-\n");
    }
    printf("\n");
}

// ------------ Cadenas no reconocidas ------------
nodoCadenasNoReconocidas* agregarCadenaNoReconocida(nodoCadenasNoReconocidas* raiz, char *valor ,int columna, int linea){

    nodoCadenasNoReconocidas * nuevo = (nodoCadenasNoReconocidas*)malloc(sizeof(nodoCadenasNoReconocidas));
    nuevo->info.columna = columna;
    nuevo->info.linea = linea;
    nuevo->info.palabra = strdup(valor);
    nuevo->sgte = NULL;
    
    nodoCadenasNoReconocidas * aux = raiz;

    if(raiz == NULL){
      raiz = nuevo;  
      return raiz;
    }
    else{
        while(aux->sgte != NULL){
            aux = aux->sgte;
        }
        aux->sgte = nuevo;
        return raiz;
    }
}

void imprimirCadenaNoReconocida(nodoCadenasNoReconocidas *raiz) {
    nodoCadenasNoReconocidas *aux = raiz;
    int encontradas = 0;
    printf("* Listado de errores lexicos: \n");
    
    while (aux != NULL) { 
        printf("%s: linea %d, columna %d\n", aux->info.palabra, aux->info.linea, aux->info.columna);
        encontradas = 1;
        aux = aux->sgte;
    }

    if (encontradas == 0) {
        printf("-\n");
    }
}


// ---------- LIBERACIÓN DE MEMORIA ----------
void liberarIdentificadores(nodoIdentificadores* raiz) {
    nodoIdentificadores* aux;
    while (raiz != NULL) {
        aux = raiz;
        raiz = raiz->sgte;
        free(aux->info.nombreIdentificador);
        free(aux);
    }
}

void liberarLiteralesCadena(nodoLiteralCadena* raiz) {
    nodoLiteralCadena* aux;
    while (raiz != NULL) {
        aux = raiz;
        raiz = raiz->sgte;
        free(aux->info.nombreLiteralCadena);
        free(aux);
    }
}
