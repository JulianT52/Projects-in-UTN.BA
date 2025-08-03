#ifndef GLOBAL_MEMORIA_H
#define GLOBAL_MEMORIA_H

#include <stdio.h>
#include <stdlib.h>
#include <semaphore.h>
#include "structsMemoria.h"

extern sem_t sem_memory_ready;
extern pthread_mutex_t mutex_client_socket;
extern pthread_mutex_t mutex_write_read_memory;
extern t_memory *memory;
extern t_swap *swap;

extern pthread_t handle_package_kernel_thread;
extern pthread_t handle_package_cpu_thread;

extern int kernel_socket;
extern int server_socket;

extern t_log* loggerMemoria;
extern t_log* loggerErrorMemoria;
extern t_config* configMemoria;

extern char* puerto_escucha;
extern char* tam_memoria;
extern char* tam_pagina;
extern char* entradas_por_tabla;
extern char* cantidad_niveles;
extern char* retardo_memoria;
extern char* path_swapfile;
extern char* retardo_swap;
extern char* log_level;
extern char* dump_path;
extern char* path_instrucciones;

#endif // GLOBAL_MEMORIA_H