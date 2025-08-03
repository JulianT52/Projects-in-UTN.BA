#include "utilsCpu.h"

extern pthread_mutex_t mutex_interrupted_ok;

extern bool interrupted_ok;

extern t_list* instructions_from_memory;

extern t_log* loggerCPU;
extern t_log* loggerCPUdebug;

extern char * ip_memoria;
extern char * puerto_memoria;
extern char * ip_kernel;
extern char * puerto_kernel_dispatch;
extern char * puerto_kernel_interrupt;
extern char * entradas_TLB;
extern char * reemplazo_TLB;
extern char * entradas_cache;
extern char * reemplazo_cache;
extern char * retardo_cache;
extern char * log_level;

extern int memory_cpu_socket;
extern int socket_interrupt;
extern int socket_dispatch;

// Variables globales para TLB y cache
extern t_list* tlb;
extern t_list* cache;
extern int PAGE_TAM;
extern int ENTRIES_CANT;
extern int PAGE_LEVELS;
extern int current_pid;
extern int clock_to_cache;

// Variables de paginación
extern int page_size;
extern int entries_per_table;
extern int page_levels;

extern pthread_t cpu_pthread;
extern pthread_t dispatch_thread;
extern pthread_t interrupt_thread;
extern pthread_t memory_thread;