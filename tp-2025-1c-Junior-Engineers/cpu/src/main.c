#include "globalCpu.h"
#include <utils/semaforos.h>
#include <utils/utilsServer.h>
#include "cpu_cycle.h"
#include "tlb_y_cache.h"

pthread_t cpu_pthread;
pthread_t dispatch_thread;
pthread_t interrupt_thread;
pthread_t memory_thread;

sem_t connection_semaphore;

char *ip_memoria;
char *puerto_memoria;
char *ip_kernel;
char *puerto_kernel_dispatch;
char *puerto_kernel_interrupt;
char *entradas_TLB;
char *reemplazo_TLB;
char *entradas_cache;
char *reemplazo_cache;
char *retardo_cache;
char *log_level;

// Sockets
handshakeMemory handshakeResult;
int socket_dispatch;
int socket_interrupt;
int memory_cpu_socket;

// TLB
t_list *tlb;
int PAGE_TAM;
int ENTRIES_CANT;
int PAGE_LEVELS;

// Cache
t_list *cache;
int clock_to_cache = 0;
int current_pid;
int page_size;
int entries_per_table;
int page_levels;

// Logger
t_log *loggerCPU;

// Variables usadas en el codigo
t_op_code connection;

int main(int argc, char *argv[])
{

  if (argc != 2)
  {
    fprintf(stderr, "Uso: %s [identificador]\n", argv[0]);
    return EXIT_FAILURE;
  }

  start_semaphores();

  tlb = list_create();
  cache = list_create();

  char *identifier = argv[1];

  t_config *configCPU = config_create("cpu.config");
  read_configs_cpu(configCPU);

  loggerCPU = log_create(string_from_format("%s.log", identifier), "cpu", 1, LOG_LEVEL_TRACE);
  log_debug(loggerCPU, "CPU %s iniciada", identifier);

  handshakeResult = connect_cpu_as_client_memory(ip_memoria, HANDSHAKE_CPU, puerto_memoria, "memoria", identifier);
  socket_dispatch = connect_cpu_as_client_kernel(ip_kernel, HANDSHAKE_DISPATCH, puerto_kernel_dispatch, "kernel", identifier);
  socket_interrupt = connect_cpu_as_client_kernel(ip_kernel, HANDSHAKE_INTERRUPT, puerto_kernel_interrupt, "kernel", identifier);

  memory_cpu_socket = handshakeResult.socket;

  PAGE_TAM = handshakeResult.pagetam;
  PAGE_LEVELS = handshakeResult.pagelevels;
  ENTRIES_CANT = handshakeResult.entries;

  printf("\n----------------------------------------------------------Conexiones Iniciales Hechas--------------------------------------------------------------------------\n\n");

  // PUSE UN HILO QUE SIEMPRE ESTE CHEQUEANDO SI HAY INTERRUPCIONES O NO
  pthread_create(&interrupt_thread, NULL, handle_interrupt, NULL);
  pthread_detach(interrupt_thread);

  while (1)
  {

    t_package *package = receive_package_CPU(socket_dispatch);

    if (package == NULL)
    {
      log_error(loggerCPU, "Error al recibir el paquete de Kernel. \n");
    }

    if (package->op_code != EXEC_PROC)
    {
      log_debug(loggerCPU, "Recibi basura");
      continue;
    }

    t_buffer_PID_PC_to_CPU *buffer_to_use = deserialize_buffer_PID_PC_to_CPU(package->buffer);

    log_debug(loggerCPU, "Recibido PID: %d con PC: %d \n", buffer_to_use->PID, buffer_to_use->PC);

    switch (package->op_code)
    {
    case EXEC_PROC:
      cpu_context_t *context = init_cpu_context(buffer_to_use->PID, buffer_to_use->PC);
      run_cpu_cycle(context);
      break;

    default:
      log_error(loggerCPU, "Operacion desconocida: %d", package->op_code);
      break;
    }
  }

  log_destroy(loggerCPU);
  config_destroy(configCPU);

  return EXIT_SUCCESS;
}
