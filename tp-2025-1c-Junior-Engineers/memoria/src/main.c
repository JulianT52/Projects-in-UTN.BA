#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <netinet/in.h>
#include "utilsMemoria.h"
#include "kernel.h"
#include "cpu.h"

pthread_t handle_package_kernel_thread;
pthread_t handle_package_cpu_thread;

t_log *loggerMemoria;
t_config *configMemoria;
t_op_code result;

int kernel_socket;
int server_socket;

char *puerto_escucha;
char *tam_memoria;
char *tam_pagina;
char *entradas_por_tabla;
char *cantidad_niveles;
char *retardo_memoria;
char *path_swapfile;
char *retardo_swap;
char *log_level;
char *dump_path;
char *path_instrucciones;

void read_configs_memory(t_config *config)
{

    puerto_escucha = config_get_string_value(config, "PUERTO_ESCUCHA");
    tam_memoria = config_get_string_value(config, "TAM_MEMORIA");
    tam_pagina = config_get_string_value(config, "TAM_PAGINA");
    entradas_por_tabla = config_get_string_value(config, "ENTRADAS_POR_TABLA");
    cantidad_niveles = config_get_string_value(config, "CANTIDAD_NIVELES");
    retardo_memoria = config_get_string_value(config, "RETARDO_MEMORIA");
    path_swapfile = config_get_string_value(config, "PATH_SWAPFILE");
    retardo_swap = config_get_string_value(config, "RETARDO_SWAP");
    log_level = config_get_string_value(config, "LOG_LEVEL");
    dump_path = config_get_string_value(config, "DUMP_PATH");
    path_instrucciones = config_get_string_value(config, "PATH_INSTRUCCIONES");
}

Handshake wait_connections_memory(int server_socket)
{

    int client_socket = accept(server_socket, NULL, NULL);

    uint32_t handshake;
    uint32_t resultOk = 0;
    uint32_t resultError = -1;
    Handshake clientHandshake;

    u_int32_t TAM_PAGE = atoi(tam_pagina);
    u_int32_t CANT_ENTRIES = atoi(entradas_por_tabla);
    u_int32_t CANT_LEVELS = atoi(cantidad_niveles);

    recv(client_socket, &handshake, sizeof(uint32_t), MSG_WAITALL);

    if (client_socket < 0)
    {
        log_error(loggerMemoria, "Error al aceptar un nuevo cliente \n");
        send(client_socket, &resultError, sizeof(uint32_t), 0);
    }
    else if (handshake == HANDSHAKE_CPU)
    {
        send(client_socket, &TAM_PAGE, sizeof(uint32_t), 0);
        send(client_socket, &CANT_ENTRIES, sizeof(uint32_t), 0);
        send(client_socket, &CANT_LEVELS, sizeof(uint32_t), 0);
    }
    else if (handshake == HANDSHAKE_KERNEL)
    {
        send(client_socket, &resultOk, sizeof(uint32_t), 0);
    }

    clientHandshake.module = handshake;
    clientHandshake.socket = client_socket;

    return clientHandshake;
}

void memory_handler(int socket)
{

    if (socket < 0)
    {
        log_error(loggerMemoria, "Socket de servidor inválido");
        return;
    }

    while (1)
    {

        Handshake result = wait_connections_memory(socket);

        if (result.socket < 0)
        {
            log_error(loggerMemoria, "Error al aceptar conexión del cliente");
            continue;
        }

        int module = result.module;
        int *client = malloc(sizeof(int));
        *client = result.socket;

        switch (module)
        {
        case HANDSHAKE_CPU:
            log_debug(loggerMemoria, "## CPU Conectado - FD del socket: %d", *client);
            pthread_create(&handle_package_cpu_thread, NULL, (void *)handle_package_cpu, *client);
            pthread_detach(handle_package_cpu_thread);
            free(client);
            printf("---------------------------------------------------------------Conexiones Hechas--------------------------------------------------------------------------------\n\n");
            break;
        case HANDSHAKE_KERNEL:
            log_info(loggerMemoria, "## Kernel Conectado - FD del socket: %d", *client);
            pthread_create(&handle_package_kernel_thread, NULL, (void *)handle_package_kernel, client);
            pthread_detach(handle_package_kernel_thread);
            break;

        default:
            log_error(loggerMemoria, "## Conexión desconocida - FD del socket: %d", *client);
            break;
        }
    }
}

int main()
{

    loggerMemoria = log_create("memoria.log", "memoria", 1, LOG_LEVEL_TRACE);
    configMemoria = config_create("memoria.config");

    read_configs_memory(configMemoria);
    init_memory_list();
    init_swap_list();
    start_semaphores_memory();

    server_socket = start_server(puerto_escucha, loggerMemoria);

    memory_handler(server_socket);

    config_destroy(configMemoria);
    log_destroy(loggerMemoria);
}
