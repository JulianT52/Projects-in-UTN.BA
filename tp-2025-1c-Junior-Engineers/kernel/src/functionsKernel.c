#include "functionsKernel.h"
#include "global.h"

t_config *configKernel;

t_list *cpu_list;

sem_t syscall_handler_semaphore;

void read_configs_kernel(t_config *config)
{

    ip_memoria = config_get_string_value(config, "IP_MEMORIA");
    puerto_memoria = config_get_string_value(config, "PUERTO_MEMORIA");
    puerto_escucha_dispatch = config_get_string_value(config, "PUERTO_ESCUCHA_DISPATCH");
    puerto_escucha_interrupt = config_get_string_value(config, "PUERTO_ESCUCHA_INTERRUPT");
    puerto_escucha_io = config_get_string_value(config, "PUERTO_ESCUCHA_IO");
    algoritmo_corto_plazo = config_get_string_value(config, "ALGORITMO_CORTO_PLAZO");
    algoritmo_ingreso_a_ready = config_get_string_value(config, "ALGORITMO_INGRESO_A_READY");
    alfa = config_get_string_value(config, "ALFA");
    estimacion_inicial = config_get_string_value(config, "ESTIMACION_INICIAL");
    tiempo_suspension = config_get_string_value(config, "TIEMPO_SUSPENSION");
    log_level = config_get_string_value(config, "LOG_LEVEL");
}

//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------
//---------------------FUNCIONES KERNEL SERVER ----------------------------------
//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------

void wait_connections_kernel(int server_socket)
{

    read_configs_kernel(configKernel);
    int client_socket;
    cpu_list = list_create();

    while (1)
    {
        client_socket = accept(server_socket, NULL, NULL);

        uint32_t handshake;
        uint32_t resultOk = 0;
        // uint32_t resultError = -1;

        int length;
        recv(client_socket, &handshake, sizeof(uint32_t), MSG_WAITALL);
        recv(client_socket, &length, sizeof(int), MSG_WAITALL);
        char *cpu_name = malloc(length);
        recv(client_socket, cpu_name, length, MSG_WAITALL);

        if (handshake == HANDSHAKE_INTERRUPT)
        {

            log_debug(loggerKernel, "%s conectado a INTERRUPT a traves del puerto %s -- FD: %d", cpu_name, puerto_escucha_interrupt, client_socket);

            pthread_mutex_lock(&mutex_ready_list);
            for (int i = 0; i < list_size(cpu_list); i++)
            {
                t_cpu *cpu45 = list_get(cpu_list, i);
                if (strcmp(cpu45->cpuName, cpu_name) == 0)
                {
                    cpu45->socket_interrupt = client_socket;
                    log_debug(loggerKernel, "CPU %s: socket_interrupt actualizado a %d", cpu_name, client_socket);
                    break;
                }
            }
            pthread_mutex_unlock(&mutex_ready_list);

            // interrupt_socket = client_socket;
        }
        else if (handshake == HANDSHAKE_DISPATCH)
        {

            t_cpu *cpu = malloc(sizeof(t_cpu));

            log_debug(loggerKernel, "%s conectado a DISPATCH a traves del puerto %s -- FD: %d", cpu_name, puerto_escucha_dispatch, client_socket);

            cpu->socket_dispatch = client_socket;
            cpu->socket_interrupt = -1;
            cpu->cpuName = cpu_name;
            cpu->isFree = 1;
            cpu->PID_in_exec = -1;

            pthread_mutex_lock(&mutex_cpu_list);
            list_add(cpu_list, cpu);
            pthread_mutex_unlock(&mutex_cpu_list);

            sem_post(&connections_ready_semaphore);
        }
        else if (handshake == HANDSHAKE_IO)
        {
            log_debug(loggerKernel, "Se conectó un IO!");
            kernel_io_socket = client_socket;
        }
        else
        {
            // log_error(loggerKernel, "Se conectó un cliente desconocido");
        }

        send(client_socket, &resultOk, sizeof(uint32_t), 0);
        // sem_post(&syscall_handler_semaphore);
    }
}

int start_io_server(void *args)
{
    server_args_t *server_args = (server_args_t *)args;
    char *port = server_args->port;

    struct addrinfo hints, *server_info;
    memset(&hints, 0, sizeof(hints));
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_flags = AI_PASSIVE;

    getaddrinfo(NULL, port, &hints, &server_info);

    int server_socket = socket(server_info->ai_family, server_info->ai_socktype, server_info->ai_protocol);
    setsockopt(server_socket, SOL_SOCKET, SO_REUSEPORT, &(int){1}, sizeof(int));
    bind(server_socket, server_info->ai_addr, server_info->ai_addrlen);
    listen(server_socket, SOMAXCONN);
    freeaddrinfo(server_info);

    log_debug(loggerKernelDebug, "Servidor para IO esperando conexiones en puerto %s...", port);

    return server_socket;
}

//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------
//---------------------FUNCIONES PARA ENVIAR A CPU-------------------------------
//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------

int start_dispatch_server(void *args)
{
    server_args_t *server_args = (server_args_t *)args;
    char *port = server_args->port;
    // char* type = server_args->type;

    struct addrinfo hints, *server_info;
    memset(&hints, 0, sizeof(hints));
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_flags = AI_PASSIVE;

    getaddrinfo(NULL, port, &hints, &server_info);

    int server_socket = socket(server_info->ai_family, server_info->ai_socktype, server_info->ai_protocol);
    setsockopt(server_socket, SOL_SOCKET, SO_REUSEPORT, &(int){1}, sizeof(int));
    bind(server_socket, server_info->ai_addr, server_info->ai_addrlen);
    listen(server_socket, SOMAXCONN);
    freeaddrinfo(server_info);

    log_debug(loggerKernelDebug, "Servidor para DISPATCH esperando conexiones en puerto %s...", port);

    return server_socket;
}

int start_interrupt_server(void *args)
{
    server_args_t *server_args = (server_args_t *)args;
    char *port = server_args->port;

    struct addrinfo hints, *server_info;
    memset(&hints, 0, sizeof(hints));
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_flags = AI_PASSIVE;

    getaddrinfo(NULL, port, &hints, &server_info);

    int server_socket = socket(server_info->ai_family, server_info->ai_socktype, server_info->ai_protocol);
    setsockopt(server_socket, SOL_SOCKET, SO_REUSEPORT, &(int){1}, sizeof(int));
    bind(server_socket, server_info->ai_addr, server_info->ai_addrlen);
    listen(server_socket, SOMAXCONN);
    freeaddrinfo(server_info);

    log_debug(loggerKernelDebug, "Servidor para INTERRUPT esperando conexiones en puerto %s...", port);

    return server_socket;
}

t_package *init_package_to_send_CPU(int pid, int pc)
{

    t_package *package = create_package(PACKAGE, EXEC_PROC);

    t_buffer_PID_PC_to_CPU *buffer = malloc(sizeof(t_buffer_PID_PC_to_CPU));
    buffer->PID = pid;
    buffer->PC = pc;

    int buffer_size;
    package->buffer = serialize_buffer_PID_PC_to_CPU(buffer, &buffer_size);
    package->buffer_size = buffer_size;

    free(buffer);
    return package;
}

//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------
//-------------------FUNCIONES DE KERNEL CON MEMORIA-----------------------------
//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------

int connectTwoModules(char *ip, ID module, char *port, char *destiny)
{
    int connection = create_connection(ip, port);

    if (connection < 0)
    {
        // log_error(loggerKernel, "No se pudo conectar a %s!", destiny);
        return;
    }

    uint32_t handshake = module;
    uint32_t result;
    send(connection, &handshake, sizeof(uint32_t), 0);
    recv(connection, &result, sizeof(uint32_t), MSG_WAITALL);

    if (result == -1)
    {
        // log_error(loggerKernel, "No se pudo conectar a %s!", destiny);
        return;
    }
    else
    {
        // log_debug(loggerKernel, "Conectado a %s cuya IP es %s a traves del puerto %s -- FD: %d", destiny, ip, port, connection);
    }

    return connection;
}

t_package *init_package_to_send_MEMORY(int pid, int size, char *path_file)
{
    t_package *package = create_package(PACKAGE, INIT_PROCESS);

    t_buffer_PID_SIZE_to_MEMORY *buffer = malloc(sizeof(t_buffer_PID_SIZE_to_MEMORY));
    buffer->PID = pid;
    buffer->size = size;
    buffer->path_file = strdup(path_file);

    int size_buffer;
    package->buffer = serialize_buffer_PID_SIZE_to_MEMORY(buffer, &size_buffer);
    package->buffer_size = size_buffer;

    free(buffer->path_file);
    free(buffer);
    return package;
}

//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------
//------FUNCIONES PARA METRICAS DEL PCB Y COMPARACIONES DE RAFAGAS---------------
//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------

void change_status(t_PCB *pcb, t_status_process status)
{

    if (pcb->status == EXEC)
    {
        pcb = update_burst_estimate(pcb);
    }

    if (status == EXEC)
    {
        pcb->chronometer_burst = temporal_create();
    }

    // Terminamos el cronometro del estado anterior
    int time_in_status = temporal_gettime(pcb->chronometer);
    pcb->MT[pcb->status] += time_in_status;

    pcb->status = status;
    pcb->ME[status]++;

    temporal_destroy(pcb->chronometer);
    pcb->chronometer = temporal_create();
}

void log_metrics(t_PCB *pcb)
{

    char *log_text = string_from_format("## (%d) - Métricas de estado:\n", pcb->PID);

    for (int i = 0; i < ESTADO_CANTIDAD; i++)
    {
        string_append_with_format(&log_text, "   %s: %d veces, %lu ms\n",
                                  name_status(i), pcb->ME[i], pcb->MT[i]);
    }

    log_info(loggerKernel, "%s", log_text);
    free(log_text);
}

char *name_status(t_status_process status)
{
    switch (status)
    {
    case STOP:
        return "STOP";
    case NEW:
        return "NEW";
    case READY:
        return "READY";
    case BLOCKED:
        return "BLOCKED";
    case EXEC:
        return "EXEC";
    case SUSP_READY:
        return "SUSP_READY";
    case SUSP_BLOCK:
        return "SUSP_BLOCK";
    case EXIT:
        return "EXIT";
    }
    return NULL;
}

bool compare_process_size(void *p1, void *p2)
{
    t_PCB *pcb1 = (t_PCB *)p1;
    t_PCB *pcb2 = (t_PCB *)p2;

    return pcb1->size <= pcb2->size;
}

bool compare_burst_estimate(void *burst1, void *burst2)
{
    t_PCB *pcb1 = (t_PCB *)burst1;
    t_PCB *pcb2 = (t_PCB *)burst2;

    return pcb1->burst_estimate < pcb2->burst_estimate;
}

t_PCB *update_burst_estimate(t_PCB *pcb)
{
    // burst_estimate (Est(n))
    // previous_actual_burst (R(n))

    // Est(n)=Estimado de la ráfaga anterior
    // R(n) = Lo que realmente ejecutó en CPU la ráfaga anterior
    // Est(n+1) =  alfa * R(n) + (1-alfa)* Est(n) ;     [0,1]

    double atoi_alfa = atof(alfa);
    double execute_time = (double)temporal_gettime(pcb->chronometer_burst);

    pcb->burst_estimate = (atoi_alfa * execute_time + (1 - atoi_alfa) * pcb->burst_estimate);

    temporal_destroy(pcb->chronometer_burst);

    return pcb;
}

double calculate_remaining_time(t_PCB *pcb)
{
    double current_time = (double)temporal_gettime(pcb->chronometer_burst);

    double burst_pcb = pcb->burst_estimate;
    double remaining_time = burst_pcb - current_time;

    if (remaining_time > 0)
    {
        return remaining_time;
    }
    else
    {
        return 0;
    }
}

t_package *receive_package_with_interrupt_reason(int socket)
{
    t_package *package = malloc(sizeof(t_package));

    recv(socket, &(package->message_type), sizeof(t_message_type), MSG_WAITALL);

    recv(socket, &(package->op_code), sizeof(t_op_code), MSG_WAITALL);

    recv(socket, &(package->buffer_size), sizeof(int), MSG_WAITALL);

    if (package->buffer_size > 0)
    {
        package->buffer = malloc(package->buffer_size);
        recv(socket, (package->buffer), package->buffer_size, MSG_WAITALL);
    }

    if (package->message_type == PACKAGE && package->buffer_size <= 0)
    {
        return NULL;
    }

    return package;
}

int send_interrupt(t_PCB *pcb)
{

    pthread_mutex_lock(&mutex_exec_list);
    t_cpu *cpu = search_cpu_for_pid(pcb->PID);
    pthread_mutex_unlock(&mutex_exec_list);

    t_package *package = create_package(MESSAGE, INTERRUPT_PROCESS);

    t_package *package_response = receive_package_with_interrupt_reason(cpu->socket_interrupt);

    if (package_response->op_code == INTERRUPT_SRT_IO)
    {
        return 14;
    }

    if (package_response == NULL || package_response->buffer == NULL || (package_response->op_code != INTERRUPT_SRT && package_response->op_code != INTERRUPT_SRT_IO))
    {
        return 0;
    }

    t_buffer_PID_PC_to_CPU *buffer_response = deserialize_buffer_PID_PC_to_CPU(package_response->buffer);

    pthread_mutex_lock(&mutex_exec_list);
    pcb->PID = buffer_response->PID;
    pcb->PC = buffer_response->PC;
    pthread_mutex_unlock(&mutex_exec_list);

    return 13;
}

//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------
//------------FUNCIONES PARA SACAR ELEMENTOS DE LAS LISTAS Y COSAS VARIAS--------
//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------

t_cpu *search_and_remove_cpu_with_socket(int socket)
{

    int size = list_size(cpu_list);
    for (int i = 0; i < size; i++)
    {
        t_cpu *cpu = list_get(cpu_list, i);
        if (cpu->socket_dispatch == socket)
        {
            list_remove(cpu_list, i);
            return cpu;
        }
    }
    return NULL;
}

t_cpu *search_cpu_with_socket(int socket)
{

    int size = list_size(cpu_list);
    for (int i = 0; i < size; i++)
    {

        t_cpu *cpu = list_get(cpu_list, i);
        if (cpu->socket_dispatch == socket)
        {
            return cpu;
        }
    }
    return NULL;
}

t_cpu *search_cpu_with_pid(int pid)
{

    int size = list_size(cpu_list);
    for (int i = 0; i < size; i++)
    {

        t_cpu *cpu = list_get(cpu_list, i);
        if (cpu->PID_in_exec == pid)
        {
            return cpu;
        }
    }
    return NULL;
}

t_PCB *list_remove_by_pid(t_list *list, int pid)
{
    int size = list_size(list);
    for (int i = 0; i < size; i++)
    {
        t_PCB *pcb = list_get(list, i);
        if (pcb->PID == pid)
        {
            list_remove(list, i);
            return pcb;
        }
    }
    return NULL;
}

t_PCB *list_get_by_pid(t_list *list, int pid)
{
    int size = list_size(list);
    for (int i = 0; i < size; i++)
    {
        t_PCB *pcb = list_get(list, i);
        if (pcb->PID == pid)
        {
            return pcb;
        }
    }
    return NULL;
}

t_PCB *search_pcb_from_pid(t_list *list, int pid)
{

    int size = list_size(list);
    for (int i = 0; i < size; i++)
    {
        t_PCB *pcb = list_get(list, i);
        if (pcb->PID == pid)
        {
            return pcb;
        }
    }
    return NULL;
}

t_cpu *search_for_frees_cpu()
{
    t_cpu *cpu;
    int size = list_size(cpu_list);
    for (int i = 0; i < size; i++)
    {
        cpu = list_get(cpu_list, i);
        if (cpu->isFree == 1)
        {
            return cpu;
        }
    }
    return NULL;
}

t_cpu *search_cpu_for_pid(int PID)
{
    for (int i = 0; i < list_size(cpu_list); i++)
    {
        t_cpu *cpu = list_get(cpu_list, i);
        if (cpu->PID_in_exec == PID)
        {
            return cpu;
        }
    }
    return NULL;
}

t_cpu *remove_cpu_from_pid(int PID)
{
    for (int i = 0; i < list_size(cpu_list); i++)
    {
        t_cpu *cpu = list_get(cpu_list, i);
        if (cpu->PID_in_exec == PID)
        {

            list_remove(cpu_list, i);
            return cpu;
        }
    }
    return NULL;
}

void end_process_io_disc(t_io_devices *io_device)
{
    pthread_mutex_lock(&mutex_io);
    for (int i = 0; i < list_size(devices_list); i++)
    {
        t_io_devices *io_to_clean = list_get(devices_list, i);
        if (io_to_clean->io_socket == io_device->io_socket)
        {
            list_remove(devices_list, i);
            break;
        }
    }
    pthread_mutex_unlock(&mutex_io);

    pthread_mutex_lock(&io_blocked_mutex);
    while (list_size(blocked_process_list) != 0)
    {
        t_io_blocked *blocked = list_remove(blocked_process_list, 0);
        int pid = blocked->pid;
        free(blocked);

        pthread_mutex_lock(&mutex_block_list);
        t_PCB *pcb = list_remove_by_pid(block_list, pid);
        pthread_mutex_unlock(&mutex_block_list);

        if (pcb == NULL)
        {
            pthread_mutex_lock(&mutex_susp_block_list);
            pcb = list_remove_by_pid(susp_block_list, pid);
            pthread_mutex_unlock(&mutex_susp_block_list);
        }

        if (pcb != NULL)
        {

            change_status(pcb, EXIT);

            pthread_mutex_lock(&mutex_exit_queue);
            queue_push(exit_queue, pcb);
            pthread_mutex_unlock(&mutex_exit_queue);

            log_info(loggerKernel, "## (%d) Pasa del estado EXEC al estado EXIT", pcb->PID);

            t_package *package = create_package(PACKAGE, FINALIZE_PROCESS);

            t_buffer_PID_to_MEMORY_FINALIZE_PROC *buffer = malloc(sizeof(t_buffer_PID_to_MEMORY_FINALIZE_PROC));
            buffer->PID = pcb->PID;

            int size_buffer;
            package->buffer = serialize_buffer_PID_to_MEMORY_FINALIZE_PROC(buffer, &size_buffer);
            package->buffer_size = size_buffer;

            int socket = connectTwoModules(ip_memoria, HANDSHAKE_KERNEL, puerto_memoria, "memoria");

            send_package(package, socket);

            int response;
            recv(socket, &response, sizeof(response), MSG_WAITALL);

            if (response == 1)
            {
                log_info(loggerKernel, "## (%d) Finaliza el proceso", pcb->PID);
            }
            else
            {
                // log_error(loggerKernel, "## (%d) Error al finalizar proceso en Memoria", pcb->PID);
                close(socket);
                pthread_mutex_unlock(&io_blocked_mutex);
                return;
            }

            log_metrics(pcb);

            // free(pcb);
            close(socket);
        }
        else
        {
            // log_error(loggerKernel, "No se encontró PCB para PID %d al desconectar IO %s", pid, io_device->io_name);
        }
    }
    pthread_mutex_unlock(&io_blocked_mutex);

    pthread_mutex_lock(&mutex_blocked_by_io_list);
    while (list_size(blocked_by_io_list) != 0)
    {
        t_io_blocked *blocked = list_remove(blocked_by_io_list, 0);
        int pid = blocked->pid;
        free(blocked);

        pthread_mutex_lock(&mutex_block_list);
        t_PCB *pcb = list_remove_by_pid(block_list, pid);
        pthread_mutex_unlock(&mutex_block_list);

        if (pcb == NULL)
        {
            pthread_mutex_lock(&mutex_susp_block_list);
            pcb = list_remove_by_pid(susp_block_list, pid);
            pthread_mutex_unlock(&mutex_susp_block_list);
        }

        if (pcb != NULL)
        {

            change_status(pcb, EXIT);

            pthread_mutex_lock(&mutex_exit_queue);
            queue_push(exit_queue, pcb);
            pthread_mutex_unlock(&mutex_exit_queue);

            log_info(loggerKernel, "## (%d) Pasa del estado EXEC al estado EXIT", pcb->PID);

            t_package *package = create_package(PACKAGE, FINALIZE_PROCESS);

            t_buffer_PID_to_MEMORY_FINALIZE_PROC *buffer = malloc(sizeof(t_buffer_PID_to_MEMORY_FINALIZE_PROC));
            buffer->PID = pcb->PID;

            int size_buffer;
            package->buffer = serialize_buffer_PID_to_MEMORY_FINALIZE_PROC(buffer, &size_buffer);
            package->buffer_size = size_buffer;

            int socket = connectTwoModules(ip_memoria, HANDSHAKE_KERNEL, puerto_memoria, "memoria");

            send_package(package, socket);

            int response;
            recv(socket, &response, sizeof(response), MSG_WAITALL);

            if (response == 1)
            {
                log_info(loggerKernel, "## (%d) Finaliza el proceso", pcb->PID);
            }
            else
            {
                // log_error(loggerKernel, "## (%d) Error al finalizar proceso en Memoria", pcb->PID);
                close(socket);
                pthread_mutex_unlock(&mutex_blocked_by_io_list);
                return;
            }

            log_metrics(pcb);

            // free(pcb);
            close(socket);
        }
        else
        {
            // log_error(loggerKernel, "No se encontró PCB para PID %d al desconectar IO %s", pid, io_device->io_name);
        }
    }
    pthread_mutex_unlock(&mutex_blocked_by_io_list);

    //free(io_device->io_name);
    //list_destroy(io_device->blocked_process);
    //free(io_device);
}
