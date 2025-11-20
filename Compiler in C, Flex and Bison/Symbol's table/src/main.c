#include <stdio.h>
#include <stdlib.h> 
#include <ctype.h>
#include <string.h>
#include <math.h>
#include <errno.h>

#define CANT_ESTADOS 7
#define CANT_COLUMNAS 6
#define ESTADO_INICIAL Q0
#define CENTINELA ','

#define ESTADO_FINAL Q1
#define ESTADO_FINAL2 Q2

typedef enum columna{
    COL_0,
    COL_1_7,
    COL_8_9,
    COL_AF_af,
    COL_xX,
    COL_otro_caracter
} columna;  

typedef enum estado{
    Q0,
    Q1,
    Q2,
    Q3,
    Q4,
    Q5,
    Q6  
}estado;

estado tabla_transiciones[CANT_ESTADOS][CANT_COLUMNAS] = {
      //   0       [1-7]      [8-9]      [a-fA-F]      xX      Otro
/*Q0*/ {   Q1,      Q2,        Q2,         Q6,         Q6,     Q6 },
/*Q1+*/{   Q5,      Q5,        Q6,         Q6,         Q3,     Q6 },
/*Q2+*/{   Q2,      Q2,        Q2,         Q6,         Q6,     Q6 },    
/*Q3*/ {   Q4,      Q4,        Q4,         Q4,         Q6,     Q6 },
/*Q4+*/{   Q4,      Q4,        Q4,         Q4,         Q6,     Q6 },
/*Q5+*/{   Q5,      Q5,        Q6,         Q6,         Q6,     Q6 },
/*Q6*/ {   Q6,      Q6,        Q6,         Q6,         Q6,     Q6 },
};

columna caracter_a_columna(int caracter){
    switch(caracter){

        case '0':
            return COL_0;
        case '1': case '2':  case '3': case '4': case '5': case '6': case '7':
            return COL_1_7;
        case '8': case '9':
            return COL_8_9;  
        case 'a': case 'b': case 'c': case 'd': case 'e': case 'f': case 'A': case 'B': case 'C': case 'D': case 'E': case 'F':
            return COL_AF_af;
        case 'x': case 'X':
            return COL_xX;
        default:
            return COL_otro_caracter;

    } 
}

void fin_de_cadena (estado estado, FILE * salida ){
    
    if (estado == Q2){
        fprintf(salida, "\t\tDECIMAL\n");
    } 
    else if (estado == Q1 || estado == Q5){
        fprintf(salida, "\t\tOCTAL\n");
    } 
    else if (estado == Q4){
        fprintf(salida, "\t\tHEXADECIMAL\n");
    } 
     else {
         fprintf(salida, "\t\tNO RECONOCIDA\n");
     }
}


void scanner (FILE* entrada, FILE *salida){
    int caracter;
    estado estado_actual = ESTADO_INICIAL;
    while((caracter = fgetc(entrada)) != EOF){
        if(caracter != CENTINELA){
            fputc(caracter, salida);
            estado_actual = tabla_transiciones[estado_actual][caracter_a_columna(caracter)];
        }else{
            fin_de_cadena(estado_actual, salida);
            estado_actual=ESTADO_INICIAL;
        }
    }
    fin_de_cadena(estado_actual,salida);
}

int main(int argc, char *argv[]) {
    
    if (argc < 2) {
        printf("Uso: %s <ARCHIVO_ENTRADA> [...]\n", argv[0]);
        return EXIT_FAILURE;
    };
    FILE *entrada = fopen(argv[1], "r");
        if(entrada == NULL) {
            printf("%s: Error al intentar abrir el archivo: %s\n", argv[1], strerror(errno));
            return EXIT_FAILURE;
        }

    scanner(entrada, stdout);
    fclose (entrada);
    return EXIT_SUCCESS;
}


