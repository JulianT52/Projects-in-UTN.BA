#include "planificacion.h"
#include "global.h"
#include <utils/semaforos.h>

//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//----------------INICIO DE SEMAFOROS, VARIABLES, COLAS Y LISTAS------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

int global_pid = 0;

t_list *io_devices;

pthread_t pthread_io_blocked;
pthread_t pthread_dump_memory;

// Semaforos
sem_t large_term_semaphore;

sem_t connection_semaphore;
sem_t connections_ready_semaphore;
sem_t sem_new_list;

sem_t sem_exec_list;
sem_t sem_block_list;
sem_t sem_ready_list;
sem_t sem_susp_ready_list;
sem_t send_package_dispatch_semaphore;
sem_t sem_cpu_free;
sem_t sem_io_free;
pthread_mutex_t mutex_new_list;
pthread_mutex_t mutex_ready_list;
pthread_mutex_t mutex_exec_list;
pthread_mutex_t mutex_pcb_exec;
pthread_mutex_t mutex_exit_queue;
pthread_mutex_t mutex_susp_ready_list;
pthread_mutex_t mutex_susp_block_list;
pthread_mutex_t mutex_block_list;
pthread_mutex_t io_blocked_mutex;
pthread_mutex_t send_package_dispatch_mutex;
pthread_mutex_t mutex_cpu_list;
pthread_mutex_t mutex_io;
pthread_mutex_t mutex_blocked_by_io_list;

char *ip_memoria;
char *puerto_memoria;
char *puerto_escucha_dispatch;
char *puerto_escucha_interrupt;
char *puerto_escucha_io;
char *algoritmo_ingreso_a_ready;
char *algoritmo_corto_plazo;
char *alfa;
char *estimacion_inicial;
char *tiempo_suspension;
char *log_level;

t_list *new_list;
// t_list *blocked_io_devices;
t_list *blocked_process_list;
t_list *ready_list;
t_list *exec_list;
t_list *block_list;
t_list *susp_block_list;
t_list *susp_ready_list;
t_queue *exit_queue;

t_log *loggerKernel;
t_log *loggerKernelDebug;

// Inciamos las colas
void start_queues()
{
    new_list = list_create();
    ready_list = list_create();
    exec_list = list_create();
    block_list = list_create();
    susp_block_list = list_create();
    susp_ready_list = list_create();
    exit_queue = queue_create();

    blocked_process_list = list_create();
}

// Destruimos las colas
void destroy_queues()
{
    list_destroy_and_destroy_elements(new_list, free);
    list_destroy_and_destroy_elements(ready_list, free);
    list_destroy_and_destroy_elements(exec_list, free);
    list_destroy_and_destroy_elements(block_list, free);
    list_destroy_and_destroy_elements(susp_block_list, free);
    list_destroy_and_destroy_elements(susp_ready_list, free);
    queue_destroy_and_destroy_elements(exit_queue, free);
}

// inicializamos los semaforos
void start_semaphores()
{

    sem_init(&large_term_semaphore, 0, 0);
    sem_init(&connection_semaphore, 0, 0);
    sem_init(&sem_new_list, 0, 0);
    sem_init(&sem_ready_list, 0, 0);
    sem_init(&sem_susp_ready_list, 0, 0);
    sem_init(&connections_ready_semaphore, 0, 0);
    sem_init(&syscall_handler_semaphore, 0, 0);
    sem_init(&send_package_dispatch_semaphore, 0, 0);
    sem_init(&sem_cpu_free, 0, 0);
    pthread_mutex_init(&mutex_new_list, NULL);
    pthread_mutex_init(&mutex_ready_list, NULL);
    pthread_mutex_init(&mutex_exec_list, NULL);
    pthread_mutex_init(&mutex_exit_queue, NULL);
    pthread_mutex_init(&mutex_susp_ready_list, NULL);
    pthread_mutex_init(&mutex_susp_block_list, NULL);
    pthread_mutex_init(&mutex_block_list, NULL);
    pthread_mutex_init(&mutex_io, NULL);
    pthread_mutex_init(&io_blocked_mutex, NULL);
    pthread_mutex_init(&send_package_dispatch_mutex, NULL);
    pthread_mutex_init(&mutex_cpu_list, NULL);
    pthread_mutex_init(&mutex_blocked_by_io_list, NULL);
}

// Destruimos los semaforos
void destroy_semaphores()
{

    sem_destroy(&large_term_semaphore);
    sem_destroy(&connection_semaphore);
    sem_destroy(&sem_new_list);
    sem_destroy(&sem_exec_list);
    sem_destroy(&sem_block_list);
    sem_destroy(&sem_ready_list);
    sem_destroy(&sem_susp_ready_list);
    sem_destroy(&connections_ready_semaphore);
    sem_destroy(&syscall_handler_semaphore);
    sem_destroy(&send_package_dispatch_semaphore);
    pthread_mutex_destroy(&mutex_new_list);
    pthread_mutex_destroy(&mutex_ready_list);
    pthread_mutex_destroy(&mutex_exec_list);
    pthread_mutex_destroy(&mutex_pcb_exec);
    pthread_mutex_destroy(&mutex_exit_queue);
    pthread_mutex_destroy(&mutex_susp_ready_list);
    pthread_mutex_destroy(&mutex_susp_block_list);
    pthread_mutex_destroy(&mutex_block_list);
    pthread_mutex_destroy(&io_blocked_mutex);
    pthread_mutex_destroy(&send_package_dispatch_mutex);
    pthread_mutex_destroy(&mutex_cpu_list);
    pthread_mutex_destroy(&mutex_io);
    pthread_mutex_destroy(&mutex_blocked_by_io_list);
}

//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//-------------------------CREACIONES DE PROCESOS---------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

// Creamos el PCB
t_PCB *createPCB(int pid)
{

    t_config *config = config_create("kernel.config");
    read_configs_kernel(config);

    t_PCB *newPCB = malloc(sizeof(t_PCB));
    newPCB->PID = pid;
    newPCB->PC = 0;
    newPCB->status = STOP;
    newPCB->pseudocode_file = NULL;
    newPCB->suspension_count = 0;

    // Inicializar las metricas de estado y tiempos
    for (int i = 0; i < ESTADO_CANTIDAD; i++)
    {
        newPCB->ME[i] = 0;
        newPCB->MT[i] = 0;
    }

    newPCB->ME[STOP]++;
    newPCB->chronometer = temporal_create();

    newPCB->burst_estimate = atoi(estimacion_inicial);

    return newPCB;
}

// Creacion de un proceso
void *create_process(int process_size, int num_pid, char *pseudocode_file)
{
    t_config *config = config_create("kernel.config");
    read_configs_kernel(config);
    log_info(loggerKernel, "## (%d) Se crea el proceso - Estado: NEW", num_pid);
    t_PCB *newPCB = createPCB(num_pid);
    newPCB->size = process_size;
    newPCB->pseudocode_file = strdup(pseudocode_file);
    change_status(newPCB, NEW);
    pthread_mutex_lock(&mutex_new_list);
    list_add(new_list, newPCB);
    pthread_mutex_unlock(&mutex_new_list);
    global_pid++;
    sem_post(&sem_new_list);
}

void *create_init_process(int process_size, int num_pid, char *pseudocode_file)
{
    t_config *config = config_create("kernel.config");
    read_configs_kernel(config);
    // log_debug(loggerKernel, "## (%d) Se crea el proceso inicial - Estado: STOP \n", num_pid);    printf("-----------------------------------------------------------------------Conexiones Hechas------------------------------------------------------------------------\n\n");
    t_PCB *newPCB = createPCB(num_pid);
    newPCB->size = process_size;
    newPCB->pseudocode_file = strdup(pseudocode_file);
    newPCB->status = STOP;
    wait_large_term_init(&large_term_semaphore);
    change_status(newPCB, NEW);
    pthread_mutex_lock(&mutex_new_list);
    list_add(new_list, newPCB);
    pthread_mutex_unlock(&mutex_new_list);
    sem_post(&sem_new_list); // Semaforo para que el largo plazo sepa que hay procesos en la cola de NEW
    log_info(loggerKernel, "## (%d) Se crea el proceso - Estado: NEW", num_pid);
    global_pid++;
}

//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//-----------------------------PLANIFICACION--------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

// Espera del ENTER
void wait_enter()
{

    char line[100];

    while (1)
    {
        log_debug(loggerKernelDebug, "Presione ENTER para continuar...\n");
        if (fgets(line, sizeof(line), stdin))
        {

            if (strcmp(line, "\n") == 0)
            {
                log_debug(loggerKernelDebug, "¡Se presionó ENTER!\n");
                printf("---------------------------------------------------------------Se inicia planificacion a Largo Plazo------------------------------------------------------------\n\n");
                sem_post(&large_term_semaphore);
                return;
            }
            else
            {
                // log_error(loggerKernel, "No se presionó ENTER. Inténtelo nuevamente.\n");
            }
        }
    }
}

// Esperamos el enter y comenzamos con la planificacion
void wait_large_term_init(sem_t *large_term_semaphore)
{

    pthread_t large_term_wait_thread;
    pthread_create(&large_term_wait_thread, NULL, wait_enter, NULL);
    pthread_join(large_term_wait_thread, NULL);
    sem_wait(&large_term_semaphore);
}

// PLANIFICACION A LARGO PLAZO
void *long_term_planning(void *arg)
{

    t_config *config = config_create("kernel.config");
    read_configs_kernel(config);

    while (1)
    {

        if (global_pid == 0)
        {

            t_long_term_args *args = (t_long_term_args *)arg;

            create_init_process(args->size, global_pid, args->pseudocode_file);

            if (strcmp(algoritmo_ingreso_a_ready, "FIFO") == 0)
                ltp_new_ready_FIFO();

            else if (strcmp(algoritmo_ingreso_a_ready, "PMCP") == 0)
                ltp_new_ready_PMCP();

            free(args->pseudocode_file);
            free(args);
        }

        else
        {
            // Planificación de medio plazo: SUSP_READY -> READY
            // pthread_mutex_lock(&mutex_susp_ready_list);
            // if (list_size(susp_ready_list) != 0)
            // {
            //     pthread_mutex_unlock(&mutex_susp_ready_list);

            //     if (strcmp(algoritmo_ingreso_a_ready, "FIFO") == 0)
            //         mtp_susp_ready_ready_FIFO();

            //     else if (strcmp(algoritmo_ingreso_a_ready, "PMCP") == 0)
            //         mtp_susp_ready_ready_PMCP();
            // }
            // else
            // {
            //     pthread_mutex_unlock(&mutex_susp_ready_list);
            // }

            // Planificación de largo plazo: NEW -> READY
            pthread_mutex_lock(&mutex_new_list);
            if (list_size(new_list) == 0)
            {
                pthread_mutex_unlock(&mutex_new_list);
                log_debug(loggerKernelDebug, "No hay procesos en la cola de NEW\n");
                continue;
            }
            pthread_mutex_unlock(&mutex_new_list);

            if (strcmp(algoritmo_ingreso_a_ready, "FIFO") == 0)
                ltp_new_ready_FIFO();

            else if (strcmp(algoritmo_ingreso_a_ready, "PMCP") == 0)
                ltp_new_ready_PMCP();
        }
    }

    return NULL;
}

// PLANIFICACION A MEDIANO PLAZO
void *mid_term_planning()
{

    if (strcmp(algoritmo_ingreso_a_ready, "FIFO") == 0)
        mtp_susp_ready_ready_FIFO();

    else if (strcmp(algoritmo_ingreso_a_ready, "PMCP") == 0)
        mtp_susp_ready_ready_PMCP();

    return NULL;
}

// PLANIFICACION A CORTO PLAZO
void *short_term_planning()
{

    if (strcmp(algoritmo_corto_plazo, "FIFO") == 0)
        stp_ready_exec_FIFO();

    else if (strcmp(algoritmo_corto_plazo, "SJF") == 0)
        stp_ready_exec_SJF();

    else if (strcmp(algoritmo_corto_plazo, "SRT") == 0)
        stp_ready_exec_SRT();

    return NULL;
}

//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//-----------------ALGORITMOS DE PLANIFICACION DE LARGO PLAZO---------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

// ALGORITMOS DE LA COLA DE NEW ---> READY
void *ltp_new_ready_FIFO()
{
    while (1)
    {
        sem_wait(&sem_new_list);

        if (list_size(new_list) != 0)
        {

            pthread_mutex_lock(&mutex_new_list);
            t_PCB *pcb = list_get(new_list, 0);
            pthread_mutex_unlock(&mutex_new_list);

            int socket = connectTwoModules(ip_memoria, HANDSHAKE_KERNEL, puerto_memoria, "memoria");

            t_package *package = init_package_to_send_MEMORY(pcb->PID, pcb->size, pcb->pseudocode_file);
            send_package(package, socket);

            char response[5];
            recv(socket, &response, sizeof(response), 0);

            if (strcmp(response, "OK") == 0)
            {

                pthread_mutex_lock(&mutex_new_list);
                pcb = list_remove(new_list, 0);
                pthread_mutex_unlock(&mutex_new_list);

                change_status(pcb, READY);

                pthread_mutex_lock(&mutex_ready_list);
                list_add(ready_list, pcb);
                pthread_mutex_unlock(&mutex_ready_list);

                log_info(loggerKernel, "## (%d) Pasa del estado NEW al estado READY", pcb->PID);

                sem_post(&sem_ready_list);
            }

            else
            {
                sem_post(&sem_new_list);
            }

            close(socket);
        }
    }
    return NULL;
}

void *ltp_new_ready_PMCP()
{

    while (1)
    {

        sem_wait(&sem_new_list);

        if (list_size(new_list) != 0)
        {

            pthread_mutex_lock(&mutex_new_list);
            list_sort(new_list, compare_process_size);
            t_PCB *pcb = list_get(new_list, 0);
            pthread_mutex_unlock(&mutex_new_list);

            int socket = connectTwoModules(ip_memoria, HANDSHAKE_KERNEL, puerto_memoria, "memoria");

            t_package *package = init_package_to_send_MEMORY(pcb->PID, pcb->size, pcb->pseudocode_file);
            send_package(package, socket);

            char response[5];
            recv(socket, &response, sizeof(response), 0);

            if (strcmp(response, "OK") == 0)
            {

                pthread_mutex_lock(&mutex_new_list);
                pcb = list_remove(new_list, 0);
                pthread_mutex_unlock(&mutex_new_list);

                change_status(pcb, READY);

                pthread_mutex_lock(&mutex_ready_list);
                list_add(ready_list, pcb);
                pthread_mutex_unlock(&mutex_ready_list);

                log_info(loggerKernel, "## (%d) Pasa del estado NEW al estado READY", pcb->PID);

                sem_post(&sem_ready_list);
            }

            else
            {
                sem_post(&sem_new_list);
            }

            close(socket);
        }
    }
    return NULL;
}
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//---------------ALGORITMOS DE PLANIFICACION DE MEDIANO PLAZO---------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

// ALGORITMOS DE LA COLA DE SUSP.READY ---> READY
void *mtp_susp_ready_ready_FIFO()
{
    while (1)
    {
        sem_wait(&sem_susp_ready_list);

        pthread_mutex_lock(&mutex_susp_ready_list);

        if (list_size(susp_ready_list) != 0)
        {
            t_PCB *pcb = list_get(susp_ready_list, 0);
            pthread_mutex_unlock(&mutex_susp_ready_list);

            int socket = connectTwoModules(ip_memoria, HANDSHAKE_KERNEL, puerto_memoria, "memoria");

            t_package *package = create_package(PACKAGE, RESUME_PROCESS);
            t_buffer_PID_to_MEMORY_FINALIZE_PROC *buffer = malloc(sizeof(t_buffer_PID_to_MEMORY_FINALIZE_PROC));
            buffer->PID = pcb->PID;

            int size_buffer;
            package->buffer = serialize_buffer_PID_to_MEMORY_FINALIZE_PROC(buffer, &size_buffer);
            package->buffer_size = size_buffer;

            send_package(package, socket);

            int response = 0;
            recv(socket, &response, sizeof(int), MSG_WAITALL);

            close(socket);

            if (response == 1)
            {
                pthread_mutex_lock(&mutex_susp_ready_list);
                pcb = list_remove(susp_ready_list, 0);
                pthread_mutex_unlock(&mutex_susp_ready_list);

                change_status(pcb, READY);

                pthread_mutex_lock(&mutex_ready_list);
                list_add(ready_list, pcb);
                pthread_mutex_unlock(&mutex_ready_list);

                sem_post(&sem_ready_list);

                log_info(loggerKernel, "## (%d) Pasa del estado SUSP_READY al estado READY", pcb->PID);
            }
            else
            {
                sem_post(&sem_susp_ready_list);
            }
        }
        else
        {
            pthread_mutex_unlock(&mutex_susp_ready_list);
            sem_post(&sem_susp_ready_list);
        }
    }

    return NULL;
}

void *mtp_susp_ready_ready_PMCP()
{

    while (1)
    {

        sem_wait(&sem_susp_ready_list);

        pthread_mutex_lock(&mutex_susp_ready_list);

        if (list_size(susp_ready_list) != 0)
        {
            list_sort(susp_ready_list, compare_process_size);

            t_PCB *pcb = list_get(susp_ready_list, 0);
            pthread_mutex_unlock(&mutex_susp_ready_list);

            int socket = connectTwoModules(ip_memoria, HANDSHAKE_KERNEL, puerto_memoria, "memoria");

            t_package *package = create_package(PACKAGE, RESUME_PROCESS);
            t_buffer_PID_to_MEMORY_FINALIZE_PROC *buffer = malloc(sizeof(t_buffer_PID_to_MEMORY_FINALIZE_PROC));
            buffer->PID = pcb->PID;

            int size_buffer;
            package->buffer = serialize_buffer_PID_to_MEMORY_FINALIZE_PROC(buffer, &size_buffer);
            package->buffer_size = size_buffer;

            send_package(package, socket);

            int response = 0;
            recv(socket, &response, sizeof(int), MSG_WAITALL);

            close(socket);

            if (response == 1)
            {
                pthread_mutex_lock(&mutex_susp_ready_list);
                pcb = list_remove(susp_ready_list, 0);
                pthread_mutex_unlock(&mutex_susp_ready_list);

                change_status(pcb, READY);

                pthread_mutex_lock(&mutex_ready_list);
                list_add(ready_list, pcb);
                pthread_mutex_unlock(&mutex_ready_list);

                sem_post(&sem_ready_list);

                log_info(loggerKernel, "## (%d) Pasa del estado SUSP_READY al estado READY", pcb->PID);
            }
            else
            {
                sem_post(&sem_susp_ready_list);
            }
        }
        else
        {
            pthread_mutex_unlock(&mutex_susp_ready_list);
            sem_post(&sem_susp_ready_list);
        }
    }

    return NULL;
}

//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//-----------------ALGORITMOS DE PLANIFICACION DE CORTO PLAZO---------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

// ALGORITMOS DE LA COLA DE READY ---> EXEC
void *stp_ready_exec_FIFO()
{
    t_cpu *free_cpu;
    while (1)
    {
        sem_wait(&sem_ready_list);

        pthread_mutex_lock(&mutex_ready_list);
        if (list_is_empty(ready_list))
        {
            pthread_mutex_unlock(&mutex_ready_list);
            // log_debug(loggerKernel, "No hay procesos en la cola de READY");
            continue;
        }

        t_PCB *pcb = list_remove(ready_list, 0);
        pthread_mutex_unlock(&mutex_ready_list);

        pthread_mutex_lock(&mutex_cpu_list);
        free_cpu = search_for_frees_cpu();
        pthread_mutex_unlock(&mutex_cpu_list);

        if (free_cpu == NULL)
        {
            sem_wait(&sem_cpu_free);
            while (free_cpu == NULL)
            {
                pthread_mutex_lock(&mutex_cpu_list);
                free_cpu = search_for_frees_cpu();
                pthread_mutex_unlock(&mutex_cpu_list);
            }
        }

        if (free_cpu->isFree == 1)
        {

            change_status(pcb, EXEC);

            pthread_mutex_lock(&mutex_exec_list);
            list_add(exec_list, pcb);
            pthread_mutex_unlock(&mutex_exec_list);

            log_info(loggerKernel, "## (%d) Pasa del estado READY al estado EXEC", pcb->PID);

            send_CPU_process_dispatch(pcb, free_cpu);
        }
    }
    return NULL;
}

void *stp_ready_exec_SJF()
{
    t_cpu *free_cpu;
    while (1)
    {

        sem_wait(&sem_ready_list);

        pthread_mutex_lock(&mutex_ready_list);
        if (list_is_empty(ready_list))
        {
            pthread_mutex_unlock(&mutex_ready_list);
            // log_debug(loggerKernel, "No hay procesos en la cola de READY");
            continue;
        }

        list_sort(ready_list, compare_burst_estimate);

        t_PCB *pcb = list_remove(ready_list, 0);
        pthread_mutex_unlock(&mutex_ready_list);

        pthread_mutex_lock(&mutex_cpu_list);
        free_cpu = search_for_frees_cpu();
        pthread_mutex_unlock(&mutex_cpu_list);

        if (free_cpu == NULL)
        {
            sem_wait(&sem_cpu_free);
            while (free_cpu == NULL)
            {
                pthread_mutex_lock(&mutex_cpu_list);
                free_cpu = search_for_frees_cpu();
                pthread_mutex_unlock(&mutex_cpu_list);
            }
        }

        change_status(pcb, EXEC);

        pthread_mutex_lock(&mutex_exec_list);
        list_add(exec_list, pcb);
        pthread_mutex_unlock(&mutex_exec_list);

        log_info(loggerKernel, "## (%d) Pasa del estado READY al estado EXEC", pcb->PID);

        send_CPU_process_dispatch(pcb, free_cpu);
    }
    return NULL;
}

void *stp_ready_exec_SRT()
{
    t_cpu *free_cpu;
    while (1)
    {
        sem_wait(&sem_ready_list);

        pthread_mutex_lock(&mutex_ready_list);
        if (list_size(ready_list) == 0)
        {
            pthread_mutex_unlock(&mutex_ready_list);
            // log_debug(loggerKernel, "No hay procesos en la cola de READY");
            continue;
        }

        list_sort(ready_list, compare_burst_estimate);
        t_PCB *pcb_candidate = list_get(ready_list, 0);
        pthread_mutex_unlock(&mutex_ready_list);

        pthread_mutex_lock(&mutex_cpu_list);
        free_cpu = search_for_frees_cpu();
        pthread_mutex_unlock(&mutex_cpu_list);

        // if (free_cpu == NULL)
        // {
        //     sem_wait(&sem_cpu_free);
        //     while (free_cpu == NULL)
        //     {
        //         pthread_mutex_lock(&mutex_cpu_list);
        //         free_cpu = search_for_frees_cpu();
        //         pthread_mutex_unlock(&mutex_cpu_list);
        //     }
        // }

        if (free_cpu != NULL)
        {
            pthread_mutex_lock(&mutex_ready_list);
            t_PCB *pcb = list_remove(ready_list, 0);
            pthread_mutex_unlock(&mutex_ready_list);

            change_status(pcb, EXEC);

            pthread_mutex_lock(&mutex_exec_list);
            list_add(exec_list, pcb);
            pthread_mutex_unlock(&mutex_exec_list);

            log_info(loggerKernel, "## (%d) - Pasa del estado READY al estado EXEC", pcb->PID);

            send_CPU_process_dispatch(pcb, free_cpu);
        }

        else
        {

            for (int i = 0; i < list_size(cpu_list); i++)
            {

                t_cpu *cpu = list_get(cpu_list, i);

                if (cpu->isFree == 0)
                {

                    pthread_mutex_lock(&mutex_exec_list);
                    t_PCB *pcb_exec = search_pcb_from_pid(exec_list, cpu->PID_in_exec);
                    pthread_mutex_unlock(&mutex_exec_list);

                    if (pcb_exec != NULL)
                    {

                        double remaining_time = calculate_remaining_time(pcb_exec);

                        log_debug(loggerKernel, "el candidato es %f", pcb_candidate->burst_estimate);
                        log_debug(loggerKernel, "el real es %f ", remaining_time);
                        if (pcb_candidate->burst_estimate < remaining_time)
                        {
                            int response = send_interrupt(pcb_exec);

                            if (response == 13)
                            {
                                pthread_mutex_lock(&mutex_exec_list);
                                pcb_exec = list_remove_by_pid(exec_list, pcb_exec->PID);
                                pthread_mutex_unlock(&mutex_exec_list);

                                pthread_mutex_lock(&mutex_ready_list);
                                list_add(ready_list, pcb_exec);
                                pthread_mutex_unlock(&mutex_ready_list);

                                pthread_mutex_lock(&mutex_ready_list);
                                pcb_candidate = list_remove(ready_list, 0);
                                pthread_mutex_unlock(&mutex_ready_list);

                                change_status(pcb_candidate, EXEC);

                                pthread_mutex_lock(&mutex_exec_list);
                                list_add(exec_list, pcb_candidate);
                                pthread_mutex_unlock(&mutex_exec_list);

                                log_info(loggerKernel, "## (%d) - Pasa del estado READY al estado EXEC", pcb_candidate->PID);

                                send_CPU_process_dispatch(pcb_candidate, free_cpu);
                                sem_post(&sem_ready_list);
                            }

                            if (response == 13 || response == 14)
                            {
                                log_info(loggerKernel, "## (%d) - Desalojado por algoritmo SJF/SRT", pcb_exec->PID);
                            }
                        }
                    }
                }
            }
        }
    }
    return NULL;
}

//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------
//----------------------FUNCIONES PARA LAS SYSCALLS------------------------------
//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------

void *syscall_interrupt_handler(void *arg)
{
    int socket = *((int *)arg);
    free(arg);

    pthread_mutex_lock(&mutex_cpu_list);
    t_cpu *cpu = search_cpu_with_socket(socket);
    pthread_mutex_unlock(&mutex_cpu_list);

    if (cpu == NULL)
    {
        // log_error(loggerKernel, "No se encontró la CPU para el SOCKET");
        return NULL;
    }

    pthread_mutex_lock(&mutex_cpu_list);
    int pid_actual = cpu->PID_in_exec;
    pthread_mutex_unlock(&mutex_cpu_list);

    // buscar el pcb segun el pid
    pthread_mutex_lock(&mutex_cpu_list);
    pthread_mutex_lock(&mutex_exec_list);
    t_PCB *pcb = search_pcb_from_pid(exec_list, cpu->PID_in_exec);
    pthread_mutex_unlock(&mutex_exec_list);
    pthread_mutex_unlock(&mutex_cpu_list);

    if (pcb == NULL)
    {
        // log_error(loggerKernel, "No se encontró el PCB para el PID %d", cpu->PID_in_exec);
        return NULL;
    }

    while (1)
    {
        t_package *package = receive_package_with_interrupt_reason(socket);

        if (package == NULL)
        {
            // log_error(loggerKernel, "Error al recibir paquete de CPU ");
            break;
        }

        switch (package->op_code)
        {
        case SYSCALL_IO:
            log_info(loggerKernel, "## <%d> - Solicitó syscall: <SYSCALL_IO>", pcb->PID);
            t_buffer_IO_NAME_TIME_MS_SYSCALL_IO *bufferIO = deserialize_buffer_IO_NAME_TIME_MS_SYSCALL_IO(package->buffer);

            pthread_mutex_lock(&mutex_exec_list);
            pcb = list_remove_by_pid(exec_list, cpu->PID_in_exec);
            pthread_mutex_unlock(&mutex_exec_list);

            // if (strcmp(algoritmo_ingreso_a_ready, "FIFO") != 0)
            //     pcb = update_burst_estimate(pcb);

            pcb->PC = bufferIO->pc;

            pthread_mutex_lock(&mutex_exec_list);
            list_add(exec_list, pcb);
            pthread_mutex_unlock(&mutex_exec_list);

            manage_syscall_io(bufferIO, pcb);

            return NULL;
            break;
        case SYSCALL_INIT_PROC:
            log_info(loggerKernel, "## <%d> - Solicitó syscall: <SYSCALL_INIT_PROC>", pcb->PID);

            t_buffer_SIZE_PATH_to_KERNEL_INIT_PROC *bufferINITPROC = deserialize_buffer_SIZE_PATH_to_KERNEL_INIT_PROC(package->buffer);
            pthread_mutex_lock(&mutex_exec_list);
            pcb = list_remove_by_pid(exec_list, cpu->PID_in_exec);
            pthread_mutex_unlock(&mutex_exec_list);

            // if (strcmp(algoritmo_ingreso_a_ready, "FIFO") != 0)
            //     pcb = update_burst_estimate(pcb);

            pcb->PC = bufferINITPROC->pc;

            pthread_mutex_lock(&mutex_exec_list);
            list_add(exec_list, pcb);
            pthread_mutex_unlock(&mutex_exec_list);

            manage_syscall_init_proc(bufferINITPROC, pcb);
            // free(package->buffer);
            break;
        case SYSCALL_EXIT:

            log_info(loggerKernel, "## <%d> - Solicitó syscall: <SYSCALL_EXIT>”", pcb->PID);

            pthread_mutex_lock(&mutex_exec_list);
            pcb = list_get_by_pid(exec_list, cpu->PID_in_exec);
            pthread_mutex_unlock(&mutex_exec_list);

            // if (strcmp(algoritmo_ingreso_a_ready, "FIFO") != 0)
            //     pcb = update_burst_estimate(pcb);

            manage_syscall_exit(pcb);
            // free(package->buffer);
            return;
            break;
        case SYSCALL_DUMP_MEMORY:

            log_info(loggerKernel, "## <%d> - Solicitó syscall: <SYSCALL_DUMP_MEMORY>", pcb->PID);

            t_buffer_PID_to_MEMORY_DUMP_MEMORY *bufferDUMPMEMORY = deserialize_buffer_PID_to_MEMORY_DUMP_MEMORY(package->buffer);

            pthread_mutex_lock(&mutex_exec_list);
            pcb = list_remove_by_pid(exec_list, cpu->PID_in_exec);
            pthread_mutex_unlock(&mutex_exec_list);

            // if (strcmp(algoritmo_ingreso_a_ready, "FIFO") != 0)
            //     pcb = update_burst_estimate(pcb);

            pcb->PID = bufferDUMPMEMORY->PID;
            pcb->PC = bufferDUMPMEMORY->PC;

            pthread_mutex_lock(&mutex_exec_list);
            list_add(exec_list, pcb);
            pthread_mutex_unlock(&mutex_exec_list);

            manage_syscall_dump_memory(bufferDUMPMEMORY, pcb);
            break;

        default:
            // log_error(loggerKernel, "Operación desconocida recibida de CPU: %d", package->op_code);
            return NULL;
            // break;
        }

        free(package);
    }
    return NULL;
}

// SYSCALL_EXIT
void manage_syscall_exit(t_PCB *pcb_exec)
{

    if (pcb_exec == NULL)
    {
        // log_error(loggerKernel, "Error: Syscall EXIT recibida pero no hay procesos en ejecucion");
        return;
    }

    t_package *response_package = create_package(MESSAGE, STOP_EXEC);

    pthread_mutex_lock(&mutex_cpu_list);
    t_cpu *cpu_in_use = search_cpu_for_pid(pcb_exec->PID);
    // pthread_mutex_unlock(&mutex_cpu_list);

    // send_package(response_package, cpu_in_use->socket_dispatch);

    // pthread_mutex_lock(&mutex_cpu_list);
    if (cpu_in_use == NULL)
        log_error(loggerKernel, "No se encontro CPU");

    send_package(response_package, cpu_in_use->socket_dispatch);

    cpu_in_use->isFree = 1;
    cpu_in_use->PID_in_exec = -1;
    pthread_mutex_unlock(&mutex_cpu_list);

    sem_post(&sem_cpu_free);

    pthread_mutex_lock(&mutex_exec_list);
    pcb_exec = list_remove_by_pid(exec_list, pcb_exec->PID);
    pthread_mutex_unlock(&mutex_exec_list);

    pthread_mutex_lock(&mutex_exit_queue);
    queue_push(exit_queue, pcb_exec);
    pthread_mutex_unlock(&mutex_exit_queue);

    change_status(pcb_exec, EXIT);

    log_info(loggerKernel, "## (%d) Pasa del estado EXEC al estado EXIT", pcb_exec->PID);

    t_package *package = create_package(PACKAGE, FINALIZE_PROCESS);

    t_buffer_PID_to_MEMORY_FINALIZE_PROC *buffer = malloc(sizeof(t_buffer_PID_to_MEMORY_FINALIZE_PROC));
    buffer->PID = pcb_exec->PID;

    int size_buffer;
    package->buffer = serialize_buffer_PID_to_MEMORY_FINALIZE_PROC(buffer, &size_buffer);
    package->buffer_size = size_buffer;

    int socket = connectTwoModules(ip_memoria, HANDSHAKE_KERNEL, puerto_memoria, "memoria");

    send_package(package, socket);

    int response;
    recv(socket, &response, sizeof(response), MSG_WAITALL);

    if (response == 1)
    {
        log_info(loggerKernel, "## (%d) - Finaliza el proceso", pcb_exec->PID);
    }
    else
    {
        // log_error(loggerKernel, "## (%d) Error al finalizar proceso en Memoria", pcb_exec->PID);
    }

    log_metrics(pcb_exec);
    // free(pcb_exec);
    close(socket);

    sem_post(&sem_ready_list);
    sem_post(&sem_new_list);
    return;
}

// SYSCALL_INIT_PROC
void manage_syscall_init_proc(t_buffer_SIZE_PATH_to_KERNEL_INIT_PROC *buffer, t_PCB *pcb_exec)
{

    if (buffer == NULL)
    {
        // log_error(loggerKernel, "Buffer recibido en INIT_PROC es NULL");
        return;
    }

    int process_size = buffer->size;
    char *pseudocode_file = strdup(buffer->path_file);

    create_process(process_size, global_pid, pseudocode_file);

    t_package *response_package = create_package(MESSAGE, CONTINUE_EXEC);

    pthread_mutex_lock(&mutex_cpu_list);
    t_cpu *cpu_in_use = search_cpu_for_pid(pcb_exec->PID);
    pthread_mutex_unlock(&mutex_cpu_list);

    send_package(response_package, cpu_in_use->socket_dispatch);

    return;
}

// SYSCALL_IO
void manage_syscall_io(t_buffer_IO_NAME_TIME_MS_SYSCALL_IO *buffer, t_PCB *pcb_exec)
{
    char *normalized_buffer_io_name = normalize_string(buffer->io_name);
    t_io_devices *io_device_free = NULL;
    t_io_devices *any_device = NULL;
    t_io_devices *io_device = NULL;

    pthread_mutex_lock(&mutex_io);
    for (int i = 0; i < list_size(devices_list); i++)
    {
        t_io_devices *device = list_get(devices_list, i);
        char *normalized_io_name = normalize_string(device->io_name);
        if (strcmp(normalized_io_name, normalized_buffer_io_name) == 0)
        {
            if (any_device == NULL)
                any_device = device;
            if (device->free == 1)
            {
                io_device_free = device;
                free(normalized_io_name);
                break;
            }
        }
        free(normalized_io_name);
    }
    pthread_mutex_unlock(&mutex_io);
    // free(normalized_buffer_io_name);

    if (io_device_free != NULL)
    {
        io_device = io_device_free;
    }
    else if (any_device != NULL)
    {
        io_device = any_device;
    }
    else
    {
        io_device = NULL;
    }

    if (io_device == NULL)
    {

        log_debug(loggerKernel, "No se encontró el dispositivo %s", buffer->io_name);

        t_package *response_package = create_package(MESSAGE, STOP_EXEC);

        pthread_mutex_lock(&mutex_cpu_list);
        t_cpu *cpu = search_cpu_for_pid(pcb_exec->PID);
        if (cpu != NULL)
        {
            send_package(response_package, cpu->socket_dispatch);
            cpu->isFree = 1;
            cpu->PID_in_exec = -1;
            sem_post(&sem_cpu_free);
        }
        pthread_mutex_unlock(&mutex_cpu_list);

        change_status(pcb_exec, EXIT);

        pthread_mutex_lock(&mutex_exit_queue);
        queue_push(exit_queue, pcb_exec);
        pthread_mutex_unlock(&mutex_exit_queue);

        t_package *package = create_package(PACKAGE, FINALIZE_PROCESS);

        t_buffer_PID_to_MEMORY_FINALIZE_PROC *buffer_mem = malloc(sizeof(t_buffer_PID_to_MEMORY_FINALIZE_PROC));
        buffer_mem->PID = pcb_exec->PID;

        int size_buffer;
        package->buffer = serialize_buffer_PID_to_MEMORY_FINALIZE_PROC(buffer_mem, &size_buffer);
        package->buffer_size = size_buffer;

        int socket = connectTwoModules(ip_memoria, HANDSHAKE_KERNEL, puerto_memoria, "memoria");

        send_package(package, socket);

        int response;
        recv(socket, &response, sizeof(response), MSG_WAITALL);

        if (response == 1)
        {
            log_info(loggerKernel, "## (%d) - Finaliza el proceso", pcb_exec->PID);
        }
        else
        {
            // log_error(loggerKernel, "## (%d) Error al finalizar proceso en Memoria", pcb_exec->PID);
        }

        log_metrics(pcb_exec);
        close(socket);

        sem_post(&sem_ready_list);
        sem_post(&sem_new_list);

        free(buffer);
        return;
    }

    pthread_mutex_lock(&mutex_exec_list);
    pcb_exec = list_remove_by_pid(exec_list, pcb_exec->PID);
    pthread_mutex_unlock(&mutex_exec_list);

    t_package *response_package = create_package(MESSAGE, STOP_EXEC);

    pthread_mutex_lock(&mutex_cpu_list);
    t_cpu *cpu_in_use = search_cpu_for_pid(pcb_exec->PID);
    pthread_mutex_unlock(&mutex_cpu_list);

    if (cpu_in_use != NULL)
    {
        send_package(response_package, cpu_in_use->socket_dispatch);
    }
    else
    {
        // log_error(loggerKernel, "No se encontró CPU para el PID %d", pcb_exec->PID);
        free(buffer);
        return;
    }

    pthread_mutex_lock(&mutex_cpu_list);
    t_cpu *cpu_free = remove_cpu_from_pid(pcb_exec->PID);
    pthread_mutex_unlock(&mutex_cpu_list);
    if (cpu_free != NULL)
    {
        cpu_free->isFree = 1;
        cpu_free->PID_in_exec = -1;
        pthread_mutex_lock(&mutex_cpu_list);
        list_add(cpu_list, cpu_free);
        pthread_mutex_unlock(&mutex_cpu_list);
        sem_post(&sem_cpu_free);
        sem_post(&sem_ready_list);
    }

    change_status(pcb_exec, BLOCKED);

    pthread_mutex_lock(&mutex_block_list);
    list_add(block_list, pcb_exec);
    pthread_mutex_unlock(&mutex_block_list);

    pcb_exec->suspension_count++;

    t_susp_timer_thread_args *args_susp = malloc(sizeof(t_susp_timer_thread_args));
    args_susp->pcb = pcb_exec;
    args_susp->socket = io_device->io_socket;
    args_susp->suspension_count = pcb_exec->suspension_count;

    int err_time = pthread_create(&pthread_io_blocked, NULL, (void *)suspension_timer_IO, args_susp);
    pthread_detach(&pthread_io_blocked);

    t_io_blocked *blocked_io = malloc(sizeof(t_io_blocked));
    blocked_io->time = buffer->time_ms;
    blocked_io->pid = pcb_exec->PID;
    blocked_io->io_name = buffer->io_name;

    pthread_mutex_lock(&io_blocked_mutex);
    list_add(blocked_process_list, blocked_io);
    pthread_mutex_unlock(&io_blocked_mutex);

    pthread_mutex_lock(&io_blocked_mutex);
    if (io_device->free == 1 && list_size(blocked_process_list) != 0)
    {
        io_device->free = 0;

        t_io_blocked *next = list_remove(blocked_process_list, 0);
        pthread_mutex_unlock(&io_blocked_mutex);

        pthread_mutex_lock(&mutex_block_list);
        t_PCB *pcb = list_get_by_pid(block_list, next->pid);
        pthread_mutex_unlock(&mutex_block_list);

        if (pcb == NULL)
        {
            pthread_mutex_lock(&mutex_susp_block_list);
            pcb = list_get_by_pid(susp_block_list, next->pid);
            pthread_mutex_unlock(&mutex_susp_block_list);
        }

        t_package *package_to_send_io = create_package(PACKAGE, SYSCALL_IO);

        if (pcb != NULL)
        {
            t_buffer_IO_NAME_TIME_MS_SYSCALL_IO *buffer_to_send = malloc(sizeof(t_buffer_IO_NAME_TIME_MS_SYSCALL_IO));
            buffer_to_send->pid = pcb->PID;
            buffer_to_send->pc = pcb->PC;
            buffer_to_send->time_ms = next->time;
            buffer_to_send->io_name = strdup(io_device->io_name);

            int size_buffer;
            package_to_send_io->buffer = serialize_buffer_IO_NAME_TIME_MS_SYSCALL_IO(buffer_to_send, &size_buffer);
            package_to_send_io->buffer_size = size_buffer;
        }

        pthread_mutex_lock(&mutex_io);
        if (list_size(devices_list) == 0)
        {
            pthread_mutex_unlock(&mutex_io);

            change_status(pcb_exec, EXIT);

            pthread_mutex_lock(&mutex_exit_queue);
            queue_push(exit_queue, pcb_exec);
            pthread_mutex_unlock(&mutex_exit_queue);

            t_package *package = create_package(PACKAGE, FINALIZE_PROCESS);

            t_buffer_PID_to_MEMORY_FINALIZE_PROC *buffer_mem = malloc(sizeof(t_buffer_PID_to_MEMORY_FINALIZE_PROC));
            buffer_mem->PID = pcb_exec->PID;

            int size_buffer;
            package->buffer = serialize_buffer_PID_to_MEMORY_FINALIZE_PROC(buffer_mem, &size_buffer);
            package->buffer_size = size_buffer;

            int socket = connectTwoModules(ip_memoria, HANDSHAKE_KERNEL, puerto_memoria, "memoria");

            send_package(package, socket);

            // log_debug(loggerKernel, "tam de la lista de blocked_by_io_list EN PLANI %d", list_size(blocked_by_io_list));

            int response;
            recv(socket, &response, sizeof(response), MSG_WAITALL);

            if (response == 1)
            {
                log_info(loggerKernel, "## (%d) - Finaliza el proceso", pcb_exec->PID);
            }
            else
            {
                // log_error(loggerKernel, "## (%d) Error al finalizar proceso en Memoria", pcb_exec->PID);
            }

            log_metrics(pcb_exec);
            close(socket);

            // sem_post(&sem_ready_list);
            sem_post(&sem_new_list);

            return;
        }
        pthread_mutex_unlock(&mutex_io);

        log_info(loggerKernel, "## (%d) - Bloqueado por IO: <%s>", pcb_exec->PID, io_device->io_name);

        int ret = send_package_safe(package_to_send_io, io_device->io_socket);

        pthread_mutex_lock(&mutex_blocked_by_io_list);
        list_add(blocked_by_io_list, next);
        pthread_mutex_unlock(&mutex_blocked_by_io_list);

        if (ret == -1)
        {
            // log_error(loggerKernel, "IO %s desconectada durante envío, proceso %d a EXIT", io_device->io_name, pcb->PID);
            end_process_io_disc(io_device);
            return;
        }

        // free(next);
    }
    else
    {
        pthread_mutex_unlock(&io_blocked_mutex);
    }
    return;
}

// SYSCALL_DUMP_MEMORY
void manage_syscall_dump_memory(t_buffer_PID_to_MEMORY_DUMP_MEMORY *bufferFromCPU, t_PCB *pcb_exec)
{

    int pid = bufferFromCPU->PID;
    t_package *package = create_package(PACKAGE, DUMP_MEMORY);

    t_buffer_PID_to_MEMORY_DUMP_MEMORY *buffer = malloc(sizeof(t_buffer_PID_to_MEMORY_DUMP_MEMORY));
    buffer->PID = pid;

    int size_buffer;
    package->buffer = serialize_buffer_PID_to_MEMORY_DUMP_MEMORY(buffer, &size_buffer);
    package->buffer_size = size_buffer;

    int socket = connectTwoModules(ip_memoria, HANDSHAKE_KERNEL, puerto_memoria, "memoria");

    send_package(package, socket);

    // DESDE ACA
    pthread_mutex_lock(&mutex_exec_list);
    pcb_exec = list_remove_by_pid(exec_list, pid);
    pthread_mutex_unlock(&mutex_exec_list);

    t_package *response_package = create_package(MESSAGE, STOP_EXEC);

    pthread_mutex_lock(&mutex_cpu_list);
    t_cpu *cpu_in_use = search_cpu_for_pid(pcb_exec->PID);
    pthread_mutex_unlock(&mutex_cpu_list);

    send_package(response_package, cpu_in_use->socket_dispatch);

    pthread_mutex_lock(&mutex_cpu_list);
    t_cpu *cpu_free = remove_cpu_from_pid(pcb_exec->PID);
    pthread_mutex_unlock(&mutex_cpu_list);

    cpu_free->isFree = 1;
    cpu_free->PID_in_exec = NULL;

    pthread_mutex_lock(&mutex_cpu_list);
    list_add(cpu_list, cpu_free);
    pthread_mutex_unlock(&mutex_cpu_list);

    sem_post(&sem_cpu_free);
    // HASTA ACA
    change_status(pcb_exec, BLOCKED);

    pthread_mutex_lock(&mutex_block_list);
    list_add(block_list, pcb_exec);
    pthread_mutex_unlock(&mutex_block_list);

    // int err_time = pthread_create(&pthread_io_blocked, NULL, (void*)suspension_timer_dump_memory, pcb_exec);
    // pthread_detach(&pthread_io_blocked);

    int response = 0;
    recv(socket, &response, sizeof(response), MSG_WAITALL);

    if (response == 1)
    {

        pthread_mutex_lock(&mutex_block_list);
        pcb_exec = list_remove_by_pid(block_list, pcb_exec->PID);
        pthread_mutex_unlock(&mutex_block_list);

        if (pcb_exec != NULL)
        {
            change_status(pcb_exec, READY);

            pthread_mutex_lock(&mutex_ready_list);
            list_add(ready_list, pcb_exec);
            pthread_mutex_unlock(&mutex_ready_list);

            sem_post(&sem_ready_list); // Semaforo para que el corto plazo sepa que hay procesos en la cola de READY

            log_info(loggerKernel, "## (%d) DUMP_MEMORY exitoso, vuelve a READY", pcb_exec->PID);
        }
        else
        {
            log_info(loggerKernel, "## (%d) DUMP_MEMORY exitoso, va a SUSP READY", pcb_exec->PID);

            pthread_mutex_lock(&mutex_block_list);
            pcb_exec = list_remove_by_pid(susp_block_list, pcb_exec->PID);
            pthread_mutex_unlock(&mutex_block_list);

            t_package *package_to_resume = create_package(PACKAGE, RESUME_PROCESS);
            t_buffer_PID_to_MEMORY_FINALIZE_PROC *buffer = malloc(sizeof(t_buffer_PID_to_MEMORY_FINALIZE_PROC));
            buffer->PID = pcb_exec->PID;

            int size_buffer;
            package->buffer = serialize_buffer_PID_to_MEMORY_FINALIZE_PROC(buffer, &size_buffer);
            package->buffer_size = size_buffer;

            send_package(package, memory_socket);

            change_status(pcb_exec, SUSP_READY);

            pthread_mutex_lock(&mutex_susp_ready_list);
            list_add(susp_ready_list, pcb_exec);
            pthread_mutex_unlock(&mutex_susp_ready_list);

            // Activar la planificación de medio plazo
            sem_post(&sem_susp_ready_list);
        }
    }

    else
    {
        log_info(loggerKernel, "## (%d) DUMP_MEMORY fallido, va a EXIT", pcb_exec->PID);
        t_package *response_package = create_package(MESSAGE, STOP_EXEC);

        pthread_mutex_lock(&mutex_cpu_list);
        t_cpu *cpu_in_use = search_cpu_for_pid(pcb_exec->PID);
        pthread_mutex_unlock(&mutex_cpu_list);

        send_package(response_package, cpu_in_use->socket_dispatch);
        manage_syscall_exit(pcb_exec); // no hace falta poner la cpu como libre ya que se hace en la syscall exit
    }
    close(socket);
}

//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------
//----------------------FUNCIONES AUXILIARES-------------------------------------
//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------

// FUNCIONES PARA SUSPENSION DE PROCESOS
void *suspension_timer_IO(t_susp_timer_thread_args *arg)
{

    t_susp_timer_thread_args *args = (t_susp_timer_thread_args *)arg;

    t_PCB *pcb = args->pcb;
    // int socket = args->socket;
    int cont = args->suspension_count;

    usleep(atoi(tiempo_suspension) * 1000);

    if (pcb->suspension_count != cont)
    {
        free(args);
        return NULL;
    }

    pthread_mutex_lock(&mutex_block_list);
    pcb = list_remove_by_pid(block_list, pcb->PID);
    pthread_mutex_unlock(&mutex_block_list);

    if (pcb != NULL)
    {

        log_info(loggerKernel, "## (%d) Pasa del estado EXEC al estado SUSP BLOCKED", pcb->PID);

        change_status(pcb, SUSP_BLOCK);

        pthread_mutex_lock(&mutex_susp_block_list);
        list_add(susp_block_list, pcb);
        pthread_mutex_unlock(&mutex_susp_block_list);

        t_package *package = create_package(PACKAGE, SUSPEND_PROCESS);
        t_buffer_PID_to_MEMORY_FINALIZE_PROC *buffer = malloc(sizeof(t_buffer_PID_to_MEMORY_FINALIZE_PROC));
        buffer->PID = pcb->PID;

        int size_buffer;
        package->buffer = serialize_buffer_PID_to_MEMORY_FINALIZE_PROC(buffer, &size_buffer);
        package->buffer_size = size_buffer;

        int socket_kernel = connectTwoModules(ip_memoria, HANDSHAKE_KERNEL, puerto_memoria, "memoria");

        send_package(package, socket_kernel);

        sem_post(&sem_new_list);
        // sem_post(&sem_ready_list);
        close(socket_kernel);
    }
    return NULL;
}

void *suspension_timer_dump_memory(t_PCB *pcb)
{
    usleep(atoi(tiempo_suspension) * 1000);

    pthread_mutex_lock(&mutex_block_list);
    pcb = list_remove_by_pid(block_list, pcb->PID);
    pthread_mutex_unlock(&mutex_block_list);

    pthread_mutex_lock(&mutex_block_list);
    list_add(block_list, pcb);
    pthread_mutex_unlock(&mutex_block_list);

    if (pcb != NULL)
    {

        pthread_mutex_lock(&mutex_block_list);
        pcb = list_remove_by_pid(block_list, pcb->PID);
        pthread_mutex_unlock(&mutex_block_list);

        log_debug(loggerKernel, "## (%d) Pasa del estado EXEC al estado SUSP BLOCKED", pcb->PID);

        change_status(pcb, SUSP_BLOCK);

        pthread_mutex_lock(&mutex_susp_block_list);
        list_add(susp_block_list, pcb);
        pthread_mutex_unlock(&mutex_susp_block_list);

        t_package *package = create_package(PACKAGE, SUSPEND_PROCESS);
        t_buffer_PID_to_MEMORY_FINALIZE_PROC *buffer = malloc(sizeof(t_buffer_PID_to_MEMORY_FINALIZE_PROC));
        buffer->PID = pcb->PID;

        int size_buffer;
        package->buffer = serialize_buffer_PID_to_MEMORY_FINALIZE_PROC(buffer, &size_buffer);
        package->buffer_size = size_buffer;

        int socket = connectTwoModules(ip_memoria, HANDSHAKE_KERNEL, puerto_memoria, "memoria");

        send_package(package, socket);
        close(socket);
        sem_post(&sem_new_list);
    }
    return;
}

void *send_CPU_process_dispatch(t_PCB *pcb, t_cpu *cpu)
{

    // t_cpu *cpu_to_use = malloc(sizeof(t_cpu));

    // pthread_mutex_lock(&mutex_cpu_list);
    // cpu_to_use = search_and_remove_cpu_with_socket(cpu->socket_dispatch);
    // pthread_mutex_unlock(&mutex_cpu_list);

    // cpu_to_use->PID_in_exec = pcb->PID;
    // cpu_to_use->isFree = 0;
    // cpu_to_use->socket_dispatch = cpu->socket_dispatch;
    // cpu_to_use->socket_interrupt = cpu->socket_interrupt;

    cpu->PID_in_exec = pcb->PID;
    cpu->isFree = 0;

    // pthread_mutex_lock(&mutex_cpu_list);
    // list_add(cpu_list, cpu_to_use);
    // pthread_mutex_unlock(&mutex_cpu_list);

    t_package *package = init_package_to_send_CPU(pcb->PID, pcb->PC);
    // send_package(package, cpu_to_use->socket_dispatch);
    send_package(package, cpu->socket_dispatch);

    int *socket_ptr = malloc(sizeof(int));
    *socket_ptr = cpu->socket_dispatch;

    int err_syscall = pthread_create(&syscall_receiver_thread, NULL, (void *)syscall_interrupt_handler, socket_ptr);
    pthread_detach(syscall_receiver_thread);

    if (err_syscall != 0)
    {
        // log_error(loggerKernel, "Error al crear el hilo de Syscalls");
    }
    return;
}

char *normalize_string(const char *to_normalize)
{
    char *normalized = malloc(strlen(to_normalize) + 1);

    if (normalized == NULL)
        return NULL;

    for (int i = 0; to_normalize[i] != '\0'; i++)
    {
        normalized[i] = tolower(to_normalize[i]);
    }
    normalized[strlen(to_normalize)] = '\0';
    return normalized;
}

int send_package_safe(t_package *package, int client_socket)
{
    void *to_send = serialize_package(package);
    if (client_socket < 0)
    {
        return -1;
    }
    int bytes_sent = send(client_socket, to_send, package->buffer_size + sizeof(t_message_type) + sizeof(t_op_code) + sizeof(int), 0);
    free(to_send);
    delete_package(package);

    if (bytes_sent == -1)
    {
        return -1;
    }
    return 0;
}
