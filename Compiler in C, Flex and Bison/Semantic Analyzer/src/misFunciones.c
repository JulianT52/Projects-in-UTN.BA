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
    printf("* Listado de errores lexicos:\n");
    
    while (aux != NULL) { 
        printf("%s: linea %d, columna %d\n", aux->info.palabra, aux->info.linea, aux->info.columna);
        encontradas = 1;
        aux = aux->sgte;
    }
}

// ------------- Nuevas funciones ------------------
/*
nodoVarDeclarada* agregarVariable(nodoVarDeclarada* raiz, const char* nombre, const char* tipo, int linea) {

    nodoVarDeclarada* aux = raiz;
    nodoVarDeclarada* anterior = NULL;

    while (aux != NULL) {
        if (aux->info.linea == linea && aux->info.nombre && strcmp(aux->info.nombre, nombre) == 0) {
            return raiz;
        }
        anterior = aux;
        aux = aux->sgte;
    }

    nodoVarDeclarada* nuevo = malloc(sizeof(nodoVarDeclarada));

    nuevo->info.nombre = strdup(nombre);
    nuevo->info.tipo = strdup(tipo);
    nuevo->info.linea = linea;
    nuevo->sgte = NULL;

    if (raiz == NULL)
        return nuevo;

    anterior->sgte = nuevo;
    return raiz;
}
*/

nodoVarDeclarada* agregarVariable(errorSemantico* listaDeErrores, nodoVarDeclarada* raiz, char* nombre, char* tipo, char* simbolo, int linea, int columna) {
    nodoVarDeclarada* aux = raiz;
    nodoVarDeclarada* anterior = NULL;

    while (aux != NULL) {
        
        if (aux->info.nombre && strcmp(aux->info.nombre, nombre) == 0) {
            
            if ((strcmp(aux->info.simbolo, "funcion") == 0 && strcmp(tipo, "variable") == 0) ||(strcmp(aux->info.simbolo, "variable") == 0 && strcmp(tipo, "funcion") == 0)) {
                agregarError(&listaDeErrores,ERROR_REDECLARACION_TIPO_DIF_SIMBOLO, nombre, aux->info.tipo, tipo, aux->info.linea, linea, aux->info.columna, columna);
                return raiz;
            }

            if (strcmp(aux->info.tipo, tipo) != 0 && ((strcmp(aux->info.tipo, "variable") == 0 && strcmp(tipo, "variable") == 0) || (strcmp(aux->info.tipo, "funcion") == 0 && strcmp(tipo, "funcion") == 0))) {
                agregarError(&listaDeErrores,ERROR_CONFLICTO_TIPOS_MISMO_SIMBOLO, nombre, aux->info.tipo, tipo, aux->info.linea, linea, aux->info.columna, columna);
                return raiz;
            }

            if (strcmp(aux->info.tipo, tipo) == 0 && strcmp(tipo, "variable") == 0) {
                agregarError(&listaDeErrores,ERROR_REDECLARACION_VARIABLE_IGUAL_TIPO, nombre, aux->info.tipo, tipo,aux->info.linea, linea, aux->info.columna, columna);
                return raiz;
            }

            if (strcmp(aux->info.tipo, tipo) == 0 && strcmp(tipo, "funcion") == 0) {
                agregarError(&listaDeErrores,ERROR_REDEFINICION_FUNCION_IGUAL_TIPO, nombre, aux->info.tipo,tipo, aux->info.linea, linea, aux->info.columna, columna);
                return raiz;
            }
        }

        anterior = aux;
        aux = aux->sgte;
    }

    nodoVarDeclarada* nuevo = malloc(sizeof(nodoVarDeclarada));
    nuevo->info.nombre = strdup(nombre);
    nuevo->info.tipo = strdup(tipo);
    nuevo->info.linea = linea;
    nuevo->sgte = NULL;

    if (raiz == NULL)
        return nuevo;

    anterior->sgte = nuevo;
    return raiz;
}


nodoFuncion* agregarFuncion(nodoFuncion* raiz, char* nombre, char* tipoRetorno, char* parametros, int esDefinicion,int linea) {
    nodoFuncion* nueva = malloc(sizeof(nodoFuncion));
    nueva->info.nombre = strdup(nombre);
    nueva->info.retorna = strdup(tipoRetorno ? tipoRetorno : "void");
    nueva->info.parametros = strdup(parametros ? parametros : "void");
    nueva->info.es_definicion = esDefinicion;
    nueva->info.linea = linea;
    nueva->sgte = NULL;

    if (raiz == NULL)
        return nueva;

    nodoFuncion* aux = raiz;
    while (aux != NULL) {
        if (strcmp(aux->info.nombre, nombre) == 0) {

            if (strcmp(aux->info.retorna, tipoRetorno) != 0) {
                free(nueva->info.nombre);
                free(nueva->info.retorna);
                free(nueva->info.parametros);
                free(nueva);
                return raiz;
            }

            if (strcmp(aux->info.parametros, parametros) == 0) {
                free(nueva->info.nombre);
                free(nueva->info.retorna);
                free(nueva->info.parametros);
                free(nueva);
                return raiz;
            }
        }
        aux = aux->sgte;
    }
    
    aux = raiz;
    while (aux->sgte != NULL)
        aux = aux->sgte;
    aux->sgte = nueva;

    return raiz;
}
nodoSentencia* agregarSentencia(nodoSentencia* raiz, char* tipo, int linea, int columna) {
    
    nodoSentencia* nuevo = malloc(sizeof(nodoSentencia));

    if (!nuevo) 
        return raiz;

    nuevo->info.tipo = strdup(tipo);
    nuevo->info.linea = linea;
    nuevo->info.columna = columna;
    nuevo->sgte = NULL;


    if (!raiz) 
        return nuevo;

    nodoSentencia* actual = raiz;
    nodoSentencia* anterior = NULL;

    while (actual) {
        if (actual->info.linea == linea && actual->info.columna == columna && strcmp(actual->info.tipo, tipo) == 0) {
            free(nuevo->info.tipo);
            free(nuevo);
            return raiz;
        }

        if (linea < actual->info.linea || (linea == actual->info.linea && columna < actual->info.columna)) {
            if (anterior) {
                anterior->sgte = nuevo;
            } else {
                raiz = nuevo;
            }
            nuevo->sgte = actual;
            return raiz;
        }

        anterior = actual;
        actual = actual->sgte;
    }

    anterior->sgte = nuevo;
    return raiz;
}


nodoEstructuraNoReconocida* agregarEstructuraNoReconocida(nodoEstructuraNoReconocida* raiz, char* texto, int linea) {
    
    nodoEstructuraNoReconocida* aux = raiz;
    nodoEstructuraNoReconocida* anterior = NULL;

    nodoEstructuraNoReconocida* nuevo = malloc(sizeof(nodoEstructuraNoReconocida));

    nuevo->info.texto = strdup(texto);
    nuevo->info.linea = linea;
    nuevo->sgte = NULL;

    if (raiz == NULL)
        return nuevo;

    while (aux != NULL) {
        anterior = aux;
        aux = aux->sgte;
    }

    anterior->sgte = nuevo;
    return raiz;
}

void imprimirVariablesDeclaradas(tablaDeSimbolos* raiz) {
    printf("* Listado de variables declaradas (tipo de dato y numero de linea):\n");
    tablaDeSimbolos* aux = raiz;
    if (raiz == NULL) { printf("-\n"); return; }

    while (aux) {
        if(aux->tipoSimbolo && strcmp(aux->tipoSimbolo, "variable") == 0){
        printf("%s: %s, linea %d, columna %d\n", aux->nombre, aux->tipoDato, aux->linea,aux->columna);
        }
        aux = aux->sgte;
    }
    printf("\n");

}

void imprimirFunciones(nodoFuncion* raiz) {
    printf("* Listado de funciones declaradas y definidas:\n");
    nodoFuncion* aux = raiz;
    if (!aux) { printf("-\n"); return; }
    while (aux) {
        printf("%s: %s, input: %s, retorna: %s, linea %d\n",
               aux->info.nombre,
               aux->info.es_definicion ? "definicion" : "declaracion",
               aux->info.parametros ? aux->info.parametros : "",
               aux->info.retorna ? aux->info.retorna : "",
               aux->info.linea);
        aux = aux->sgte;
    }
    printf("\n");
}

void imprimirSentencias(nodoSentencia* raiz) {
    printf("* Listado de sentencias indicando tipo, numero de linea y de columna:\n");
    nodoSentencia* aux = raiz;
    if (!aux) { printf("-\n\n"); return; }
    while (aux) {
        printf("%s: linea %d, columna %d\n", aux->info.tipo, aux->info.linea, aux->info.columna);
        aux = aux->sgte;
    }
    printf("\n");
}

void imprimirEstructurasNoReconocidas(nodoEstructuraNoReconocida* raiz) {
    printf("* Listado de errores sintacticos:\n");
    nodoEstructuraNoReconocida* aux = raiz;
    if (!aux) { printf("-\n\n"); return; }
    while (aux) {
        printf("\"%s\": linea %d\n", aux->info.texto, aux->info.linea);
        aux = aux->sgte;
    }
    printf("\n");
}

tablaDeSimbolos *buscarSimbolo(tablaDeSimbolos *raiz, char *nombre) {
    tablaDeSimbolos *aux = raiz;
    while (aux) {
        if (strcmp(aux->nombre, nombre) == 0)
            return aux;
        aux = aux->sgte;
    }
    return NULL;
}

tablaDeSimbolos *insertarSimbolo(tablaDeSimbolos *raiz, char *nombre, char *tipoDato, char *tipoSimbolo, int linea, int columna, errorSemantico *raizErrores) {
    tablaDeSimbolos *aux = raiz;
    
    while (aux) {
        // Detectar si se está redeclarando con un tipo diferente de símbolo (variable vs función)
        if (strcmp(aux->nombre, nombre) == 0 && strcmp(aux->tipoSimbolo, tipoSimbolo) != 0) {
            agregarError(&raizErrores, ERROR_REDECLARACION_TIPO_DIF_SIMBOLO, nombre, aux->tipoDato, tipoDato, aux->linea, aux->columna, linea, columna);
            // NO agregar el símbolo cuando hay conflicto de tipos
            return raiz;
        }

        if (strcmp(aux->nombre, nombre) == 0 && strcmp(aux->tipoSimbolo, "variable") == 0) {
    
            if (strcmp(aux->tipoDato, tipoDato) != 0) {
                agregarError(&raizErrores, ERROR_CONFLICTO_TIPOS_MISMO_SIMBOLO, nombre, aux->tipoDato, tipoDato, aux->linea, aux->columna, linea, columna);
            } else {
                agregarError(&raizErrores, ERROR_REDECLARACION_VARIABLE_IGUAL_TIPO, nombre, aux->tipoDato, tipoDato, aux->linea, aux->columna, linea, columna);
            }
            // NO retornar: permitir que se agregue
            break;
        }

        if (strcmp(aux->nombre, nombre) == 0 && strcmp(aux->tipoSimbolo, "funcion") == 0) {
            if (strcmp(aux->tipoDato, tipoDato) != 0) {
                agregarError(&raizErrores, ERROR_CONFLICTO_TIPOS_MISMO_SIMBOLO, nombre, aux->tipoDato, tipoDato, aux->linea, aux->columna, linea, columna);
            } else {
                agregarError(&raizErrores, ERROR_REDEFINICION_FUNCION_IGUAL_TIPO, nombre, aux->tipoDato, tipoDato, aux->linea, aux->columna, linea, columna);
            }
            // NO retornar: permitir que se agregue
            break;
        }
        aux = aux->sgte;
    }

    // Verificar si ya existe para evitar duplicados
    aux = raiz;
    int yaExiste = 0;
    while (aux) {
        if (strcmp(aux->nombre, nombre) == 0 && strcmp(aux->tipoSimbolo, tipoSimbolo) == 0) {
            yaExiste = 1;
            break;
        }
        aux = aux->sgte;
    }
    
    if (yaExiste) {
        return raiz;
    }
    
    tablaDeSimbolos *nuevo = malloc(sizeof(tablaDeSimbolos));
    nuevo->nombre = strdup(nombre);
    nuevo->tipoDato = strdup(tipoDato);
    nuevo->tipoSimbolo = strdup(tipoSimbolo);
    nuevo->linea = linea;
    nuevo->columna = columna;
    nuevo->definida = 0;
    nuevo->sgte = NULL;

    if (raiz == NULL)
        return nuevo;

    aux = raiz;
    while (aux->sgte)
        aux = aux->sgte;

    aux->sgte = nuevo;
    return raiz;
}

void agregarError(errorSemantico** raizErrores, CodigoError codigo,char *identificador, char *tipoPrevio, char* tipoActual, int lineaPrevio, int columnaPrevio,int lineaActual, int columnaActual) {
     if (raizErrores == NULL) {
        return;
    }

    if (codigo == ERROR_SIN_DECLARAR || codigo == FUNCION_SIN_DECLARAR) {
        errorSemantico *nodo = *raizErrores;
        while (nodo) {
            if (nodo->codigo == codigo && nodo->identificador && identificador && strcmp(nodo->identificador, identificador) == 0) {
                return;
            }
            nodo = nodo->sgte;
        }
    }

    errorSemantico *nuevo = malloc(sizeof(errorSemantico));
    if (nuevo == NULL) 
      return;
    nuevo->tipoActual = tipoActual ? strdup(tipoActual) : NULL;
    nuevo->codigo = codigo;
    nuevo->identificador = identificador ? strdup(identificador) : NULL;
    nuevo->tipoPrevio = tipoPrevio ? strdup(tipoPrevio) : NULL;
    nuevo->lineaPrevio = lineaPrevio;
    nuevo->columnaPrevio = columnaPrevio;
    nuevo->lineaActual = lineaActual;
    nuevo->columnaActual = columnaActual;
    nuevo->sgte = NULL;

    if (*raizErrores == NULL) {
        *raizErrores = nuevo;
        return;
    }
    errorSemantico *aux = *raizErrores;
    while (aux->sgte){
        aux = aux->sgte;
    }
    aux->sgte = nuevo;
}

char* convertirTipoFuncion(char* tipo) {
    if (!tipo || !strstr(tipo, "(") || strstr(tipo, "(*")) return tipo;
    
    char *paren = strchr(tipo, '(');
    if (paren) {
        char *retorno = malloc(paren - tipo + 1);
        strncpy(retorno, tipo, paren - tipo);
        retorno[paren - tipo] = '\0';
        char *params = malloc(strlen(paren + 1) + 1);
        strcpy(params, paren + 1);
        char *close = strchr(params, ')');
        if (close) *close = '\0';
        char *nuevo = malloc(100);
        sprintf(nuevo, "%s (*)(%s)", retorno, params);
        free(retorno);
        free(params);
        return nuevo;
    }
    return tipo;
}

void imprimirErrores(errorSemantico* raizErrores) {
    printf("* Listado de errores semanticos:\n");
    if (raizErrores == NULL) {
        printf("-\n");
        return;
    }

    errorSemantico* aux = raizErrores;
    while (aux) {
        printf("%d:%d: ", aux->lineaActual, aux->columnaActual);

        switch (aux->codigo) {
            case OPERANDOS_INVALIDOS:
                if(strcmp(aux->tipoActual, "string") == 0){
                    aux->tipoActual = strdup("char *");
                }
                // Convertir tipos de función
                if (aux->tipoPrevio && strstr(aux->tipoPrevio, "(") && !strstr(aux->tipoPrevio, "(*")) {
                    aux->tipoPrevio = convertirTipoFuncion(aux->tipoPrevio);
                }
                if (aux->tipoActual && strstr(aux->tipoActual, "(") && !strstr(aux->tipoActual, "(*")) {
                    aux->tipoActual = convertirTipoFuncion(aux->tipoActual);
                }
                printf("Operandos invalidos del operador binario * (tienen '%s' y '%s')\n", aux->tipoPrevio, aux->tipoActual);
                break;

            case ERROR_SIN_DECLARAR:
                printf("'%s' sin declarar\n", aux->identificador);
                break;

            case ERROR_REDECLARACION_TIPO_DIF_SIMBOLO:
                printf("'%s' redeclarado como un tipo diferente de simbolo\n", aux->identificador ? aux->identificador : "");
                if (aux->tipoPrevio && strstr(aux->tipoPrevio, "void") && strstr(aux->tipoPrevio, "void")) {
                    printf("Nota: la declaracion previa de '%s' es de tipo '%s': %d:%d\n", aux->identificador, "void(void)", aux->lineaPrevio, aux->columnaPrevio);
                } else {
                    printf("Nota: la declaracion previa de '%s' es de tipo '%s': %d:%d\n", aux->identificador, aux->tipoPrevio ? aux->tipoPrevio : "", aux->lineaPrevio, aux->columnaPrevio);
                }
                break;

            case ERROR_CONFLICTO_TIPOS_MISMO_SIMBOLO:
                printf("conflicto de tipos para '%s'; la ultima es de tipo '%s'\n", aux->identificador, aux->tipoActual ? aux->tipoActual : "desconocido");
                printf("Nota: la declaracion previa de '%s' es de tipo '%s': %d:%d\n", aux->identificador, aux->tipoPrevio ? aux->tipoPrevio : "desconocido", aux->lineaPrevio, aux->columnaPrevio);
                break;

            case ERROR_REDECLARACION_VARIABLE_IGUAL_TIPO:
                printf("Redeclaracion de '%s'\n", aux->identificador);
                printf("Nota: la declaracion previa de '%s' es de tipo '%s': %d:%d\n",
                       aux->identificador, aux->tipoPrevio, aux->lineaPrevio, aux->columnaPrevio);
                break;

            case ERROR_REDEFINICION_FUNCION_IGUAL_TIPO:
                printf("Redefinicion de '%s'\n", aux->identificador);
                printf("Nota: la definicion previa de '%s' es de tipo '%s': %d:%d\n",
                       aux->identificador, aux->tipoPrevio, aux->lineaPrevio, aux->columnaPrevio);
                break;

            case FUNCION_SIN_DECLARAR:
                printf("Funcion '%s' sin declarar\n", aux->identificador);
                break;

            case FUNCION_NO_SE_QUE_PONER:
                printf("El objeto invocado '%s' no es una funcion o un puntero a una funcion\n",
                       aux->identificador);
                printf("Nota: declarado aqui: %d:%d\n", aux->lineaPrevio, aux->columnaPrevio);
                break;

            case INSUFICIENTES_PARAMETROS:
                printf("Insuficientes argumentos para la funcion '%s'\n", aux->identificador);
                printf("Nota: declarado aqui: %d:%d\n", aux->lineaPrevio, aux->columnaPrevio);
                break;

            case DEMASIADOS_PARAMETROS:
                printf("Demasiados argumentos para la funcion '%s'\n", aux->identificador);
                printf("Nota: declarado aqui: %d:%d\n", aux->lineaPrevio, aux->columnaPrevio);
                break;

            case INCOMPATIBILIDAD_TIPOS:
                // Convertir tipos de función antes de imprimir
                if (aux->tipoPrevio && strstr(aux->tipoPrevio, "(") && !strstr(aux->tipoPrevio, "(*")) {
                    aux->tipoPrevio = convertirTipoFuncion(aux->tipoPrevio);
                }
                if (aux->tipoActual && strstr(aux->tipoActual, "(") && !strstr(aux->tipoActual, "(*")) {
                    aux->tipoActual = convertirTipoFuncion(aux->tipoActual);
                }
                printf("Incompatibilidad de tipos para el argumento #%d de '%s'\n",
                       aux->numeroArgumento, aux->identificador);
                printf("Nota: se esperaba '%s' pero el argumento es de tipo '%s': %d:%d\n",
                       aux->tipoPrevio, aux->tipoActual, aux->lineaPrevio, aux->columnaPrevio);
                break;

            case RETORNO_VOID:
                printf("No se ignora el valor de retorno void como deberia ser\n");
                break;

            case INCOMPATIBILIDAD_TIPOS_AL_INICIAR:
                // Convertir tipos de función antes de imprimir
                if (aux->tipoPrevio && strstr(aux->tipoPrevio, "(") && !strstr(aux->tipoPrevio, "(*")) {
                    aux->tipoPrevio = convertirTipoFuncion(aux->tipoPrevio);
                }
                if (aux->tipoActual && strstr(aux->tipoActual, "(") && !strstr(aux->tipoActual, "(*")) {
                    aux->tipoActual = convertirTipoFuncion(aux->tipoActual);
                }
                // Normalizar: quitar "const " del tipo y convertir "string" a "char *"
                char *tipoPrevioNorm = aux->tipoPrevio ? aux->tipoPrevio : NULL;
                if (tipoPrevioNorm && strncmp(tipoPrevioNorm, "const ", 6) == 0) {
                    tipoPrevioNorm = tipoPrevioNorm + 6;
                }
                if (tipoPrevioNorm && strcmp(tipoPrevioNorm, "string") == 0) {
                    tipoPrevioNorm = "char *";
                }
                char *tipoActualNorm = aux->tipoActual ? aux->tipoActual : NULL;
                if (tipoActualNorm && strncmp(tipoActualNorm, "const ", 6) == 0) {
                    tipoActualNorm = tipoActualNorm + 6;
                }
                if (tipoActualNorm && strcmp(tipoActualNorm, "string") == 0) {
                    tipoActualNorm = "char *";
                }
                printf("Incompatibilidad de tipos al inicializar el tipo '%s' usando el tipo '%s'\n",
                       tipoPrevioNorm ? tipoPrevioNorm : "desconocido", tipoActualNorm ? tipoActualNorm : "desconocido");
                break;

            case ASIGNAR_EN_UNA_CONSTANTE:
                printf("Asignacion de la variable de solo lectura '%s'\n", aux->identificador);
                break;

            case NO_EXISTE_L_VALOR_MODIFICABLE:
                printf("Se requiere un valor-L modificable como operando izquierdo de la asignacion\n");
                break;

            case NO_RETURN_EN_FUNCION_NO_VOID:
                printf("'return' sin valor en una funcion que no retorna void\n");
                printf("Nota: declarado aqui: %d:%d\n", aux->lineaPrevio, aux->columnaPrevio);
                break;

            case TIPO_DE_DATO_INCOMPATIBLE_RETURN:
                // Convertir tipos de función antes de imprimir
                if (aux->tipoPrevio && strstr(aux->tipoPrevio, "(") && !strstr(aux->tipoPrevio, "(*")) {
                    aux->tipoPrevio = convertirTipoFuncion(aux->tipoPrevio);
                }
                if (aux->tipoActual && strstr(aux->tipoActual, "(") && !strstr(aux->tipoActual, "(*")) {
                    aux->tipoActual = convertirTipoFuncion(aux->tipoActual);
                }
                printf("Incompatibilidad de tipos al retornar el tipo '%s' pero se esperaba '%s'\n",
                       aux->tipoPrevio, aux->tipoActual);
                break;
        }
        aux = aux->sgte;
    }
    printf("\n");
}

int tiposCompatibles(char *t1, char *t2) {
    if (
        (!strcmp(t1, "int") || !strcmp(t1, "float")) &&
        (!strcmp(t2, "int") || !strcmp(t2, "float"))
    ) {
        return 1; 
    }
    return 0; 
}

char* tipoResultadoMultiplicacion(char *t1, char *t2) {
    if (!strcmp(t1, "float") || !strcmp(t2, "float"))
        return "float";
    return "int";

}


char* buscarTipoDato(tablaDeSimbolos *raiz, char *nombre) {
    tablaDeSimbolos *aux = raiz;

    while (aux != NULL) {
        if (strcmp(aux->nombre, nombre) == 0) {
            
            return strdup(aux->tipoDato);
        }
        aux = aux->sgte;
    }
    return strdup("error");
}

int tiposCompatiblesMultiplicacion(char* tipo1, char* tipo2) {
    if (!tipo1 || !tipo2) return 0;

    if (strcmp(tipo1, "error") == 0 || strcmp(tipo2, "error") == 0) return 1;

    if (strstr(tipo1, "char*") || strstr(tipo2, "char*")) return 0;

    char* tiposValidos[] = {"int", "float", "double", "short", "long", "const float", "unsigned int"};
    int esNum1 = 0, esNum2 = 0;

    for (int i = 0; i < 7; i++) {
        if (strcmp(tipo1, tiposValidos[i]) == 0) esNum1 = 1;
        if (strcmp(tipo2, tiposValidos[i]) == 0) esNum2 = 1;
    }

    if (!esNum1 || !esNum2) return 0;

    return 1;
}

char* tipoDominante(char* tipo1, char* tipo2) {
    if (!tipo1 || !tipo2) return strdup("error");

    if (strstr(tipo1, "char*") || strstr(tipo2, "char*"))
        return strdup("error");

    if (strstr(tipo1, "void") || strstr(tipo2, "void"))
        return strdup("error");

    if (strcmp(tipo1, "double") == 0 || strcmp(tipo2, "double") == 0)
        return strdup("double");

    if (strcmp(tipo1, "float") == 0 || strcmp(tipo2, "float") == 0 ||
        strcmp(tipo1, "const float") == 0 || strcmp(tipo2, "const float") == 0)
        return strdup("float");

    if (strcmp(tipo1, "long") == 0 || strcmp(tipo2, "long") == 0)
        return strdup("long");

    if (strcmp(tipo1, "unsigned int") == 0 || strcmp(tipo2, "unsigned int") == 0)
        return strdup("unsigned int");

    return strdup("int");
}

int contarArgumentos(char *argumentos) {
    if (!argumentos == NULL) 
       return 0;
    
    int contador = 1;
    char *punteroAux = argumentos;
    while (punteroAux) {
        if (*punteroAux == ','){
            contador++;
        }
        punteroAux++;
    }
    return contador;
}

int extraerCantidadDeArgumentos(char *argumentos) {
    if (!argumentos) 
        return 0;

    return atoi(argumentos);
}

int contarParametrosEnTipo(char *tipo) {
    if (tipo == NULL) 
       return 0;

    char *posicion = strchr(tipo, '(');
    if (posicion == NULL) 
       return 0;

    posicion++;

    if (strncmp(posicion, "void", 4) == 0 && posicion[4] == ')') 
    return 0;
    
    int contador = 1;
    while (*posicion && *posicion != ')') {
        if (*posicion == ',') contador++;
        posicion++;
    }
    return contador;
}


char* extraerTiposParametros(char *parametros) {

    if (!parametros || strcmp(parametros, "void") == 0)
        return strdup("void");

    char *resultado = calloc(1, 1000);
    if (!resultado) 
      return NULL;

    char buffer[256];
    char *punteroAux = parametros;
    int posicion = 0;
    int primero = 1;

    while (*punteroAux) {

        while (*punteroAux == ' ' || *punteroAux == '\t') punteroAux++;  //Sacamos espacios al principio si es que hay
        if (*punteroAux == '\0') break;

        // Extraemos el parámetro hasta coma o fin
        char *inicio = punteroAux;
        while (*punteroAux && *punteroAux != ',') 
          punteroAux++;
        char *fin = punteroAux;

        // Copiamos el parametro a un buffer temporal
        size_t longitud = fin - inicio;
        if (longitud >= sizeof(buffer)) 
         longitud = sizeof(buffer) - 1;

        strncpy(buffer, inicio, longitud);
        buffer[longitud] = '\0';

        // Eliminamos espacios al final
        for (int i = strlen(buffer) - 1; i >= 0 && isspace((unsigned char)buffer[i]); i--)
            buffer[i] = '\0';

        // Si tiene un identificador al final, eliminarlo
        char *ultimaPalabra = strrchr(buffer, ' ');

        if (ultimaPalabra != NULL) {
            char *palabra = ultimaPalabra+ 1;


            char *tiposConocidos[] = {"short","int","long","char","float","double","void","signed","unsigned",NULL};

            int esTipo = 0;
            for (int i = 0; tiposConocidos[i]; i++) {
                if (strcmp(palabra, tiposConocidos[i]) == 0) {
                    esTipo = 1;
                    break;
                }
            }

            // Si no es un tipo conocido, asumimos que es identificador
            if (!esTipo && islower((unsigned char)palabra[0]))
                *ultimaPalabra = '\0';
        }

        // Agregar coma si no es el primero
        if (!primero) strcat(resultado, ", ");
        primero = 0;

        strcat(resultado, buffer);

        // Avanzar coma
        if (*punteroAux == ',') punteroAux++;
    }

    return resultado;
}