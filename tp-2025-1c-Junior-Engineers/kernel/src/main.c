#include <utils/semaforos.h>
#include <utilsKernel/planificacion.h>
#include "functionsKernel.h"
#include "global.h"
#include "io.h"

int kernel_dispatch_socket;
int kernel_interrupt_socket;
int memory_socket;
int kernel_socket;
int dispatch_socket;
int interrupt_socket;
int kernel_io_socket;

pthread_t long_term_thread;
pthread_t mid_term_thread;
pthread_t short_term_thread;
pthread_t dispatch_thread;
pthread_t interrupt_thread;
pthread_t syscall_receiver_thread;
pthread_t listen_io_thread;
pthread_t memory_thread;
pthread_t io_thread;

t_op_code connection = HANDSHAKE_OK;

void cleanup_kernel()
{

    destroy_queues();
    destroy_semaphores();
    log_destroy(loggerKernel);
}

int main(int argc, char *argv[])
{

    //--------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------
    //-----------------LECTURA DE CONFIGS,CREACION DE LOGGERS Y COLAS-----------------
    //--------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------

    configKernel = config_create("kernel.config");
    read_configs_kernel(configKernel);

    loggerKernel = log_create("kernel.log", "kernel", 1, LOG_LEVEL_TRACE);
    loggerKernelDebug = log_create("kernelDebug.log", "kernel", 1, LOG_LEVEL_DEBUG);

    char *pseudocode_file = argv[1];
    int process_size = atoi(argv[2]);

    start_queues();
    start_semaphores();
    start_lists();

    //--------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------
    //-------------------------------CONEXIONES---------------------------------------
    //--------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------

    if (argc < 3)
    {
        log_error(loggerKernel, "Uso: %s [archivo_pseudocodigo] [tamanio_proceso]\n", argv[0]);
        return EXIT_FAILURE;
    }

    // Asocio los respectivos argumentos al dispatch
    server_args_t *dispatch_args = malloc(sizeof(server_args_t));
    dispatch_args->port = puerto_escucha_dispatch;

    // Asocio los respectivos argumentos al interrupt
    server_args_t *interrupt_args = malloc(sizeof(server_args_t));
    interrupt_args->port = puerto_escucha_interrupt;

    server_args_t *io_args = malloc(sizeof(server_args_t));
    io_args->port = puerto_escucha_io;

    kernel_io_socket = start_io_server(io_args);
    kernel_interrupt_socket = start_interrupt_server(interrupt_args);
    kernel_dispatch_socket = start_dispatch_server(dispatch_args);

    printf("---------------------------------------------------------------------Servidores Iniciados-----------------------------------------------------------------------\n\n");

    int err_io = pthread_create(&io_thread, NULL, (void *)init_listen_io, kernel_io_socket);
    pthread_detach(io_thread);

    int err_interrupt = pthread_create(&interrupt_thread, NULL, (void *)wait_connections_kernel, kernel_interrupt_socket);
    pthread_detach(interrupt_thread);

    int err_dispatch = pthread_create(&dispatch_thread, NULL, (void *)wait_connections_kernel, kernel_dispatch_socket);
    pthread_detach(dispatch_thread);

    if (err_interrupt != 0)
    {
        log_error(loggerKernel, "Error al crear el hilo de Interrupt");
    }

    if (err_dispatch != 0)
    {
        log_error(loggerKernel, "Error al crear el hilo de Dispatch");
    }

    if (err_io != 0)
    {
        log_error(loggerKernel, "Error al crear el hilo de IOs");
    }

    t_long_term_args *args = malloc(sizeof(t_long_term_args));
    args->size = process_size;
    args->pseudocode_file = strdup(pseudocode_file);

    sem_wait(&connections_ready_semaphore);

    // Creamos el hilo de largo plazo
    int err_long = pthread_create(&long_term_thread, NULL, (void *)long_term_planning, args);
    pthread_detach(long_term_thread);

    if (err_long != 0)
    {
        log_error(loggerKernel, "Error al crear el hilo de largo plazo");
    }

    // Creamos el hilo de mediano plazo
    int err_mid = pthread_create(&mid_term_thread, NULL, (void *)mid_term_planning, NULL);
    pthread_detach(mid_term_thread);

    if (err_mid != 0)
    {
        log_error(loggerKernel, "Error al crear el hilo de mediano plazo");
    }

    // Creamos el hilo de corto plazo
    int err_short = pthread_create(&short_term_thread, NULL, (void *)short_term_planning, NULL);
    pthread_join(short_term_thread, NULL);

    if (err_short != 0)
    {
        log_error(loggerKernel, "Error al crear el hilo de corto plazo");
    }

    free(dispatch_args);
    free(interrupt_args);
    config_destroy(configKernel);
    cleanup_kernel();
}
