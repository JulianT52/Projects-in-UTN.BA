#ifndef GLOBAL_H
#define GLOBAL_H

#include <commons/log.h>
#include <commons/collections/queue.h>
#include <pthread.h>
#include <commons/config.h>
#include <commons/collections/dictionary.h>
#include <semaphore.h>
#include <utilsKernel/PCB.h>
#include <commons/collections/list.h>

// Variables Globales
extern int global_pid;
extern t_config *configKernel;

// Logger de Kernel
extern t_log *loggerKernel;
extern t_log *loggerKernelDebug;

// Hilos de Kernel
extern pthread_t long_term_thread;
extern pthread_t mid_term_thread;
extern pthread_t short_term_thread;
extern pthread_t dispatch_thread;
extern pthread_t interrupt_thread;
extern pthread_t syscall_receiver_thread;
extern pthread_t listen_io_thread;
extern pthread_t memory_thread;
extern pthread_t io_thread;
extern pthread_t pthread_io_blocked;
extern pthread_t wait_end_of_io_thread;

// Handshakes
extern int kernel_dispatch_socket;
extern int kernel_interrupt_socket;
extern int memory_socket;
extern int dispatch_socket;
extern int interrupt_socket;
extern int kernel_io_socket;

// Configs de Kernel
extern char *ip_memoria;
extern char *puerto_memoria;
extern char *puerto_escucha_dispatch;
extern char *puerto_escucha_interrupt;
extern char *puerto_escucha_io;
extern char *algoritmo_corto_plazo;
extern char *algoritmo_ingreso_a_ready;
extern char *alfa;
extern char *estimacion_inicial;
extern char *tiempo_suspension;
extern char *log_level;

// Semaforos de Kernel
extern sem_t large_term_semaphore;
extern sem_t connection_semaphore;
extern sem_t connections_ready_semaphore;
extern sem_t syscall_handler_semaphore;
extern sem_t sem_new_list;
extern sem_t sem_exec_list;
extern sem_t sem_block_list;
extern sem_t sem_ready_list;
extern sem_t sem_susp_ready_list;
extern sem_t send_package_dispatch_semaphore;
extern sem_t sem_cpu_free;
extern sem_t sem_io_free;
extern sem_t wait_SRT_IO;

// Mutex de Kernel
extern pthread_mutex_t mutex_new_list;
extern pthread_mutex_t mutex_ready_list;
extern pthread_mutex_t mutex_exec_list;
extern pthread_mutex_t mutex_pcb_exec;
extern pthread_mutex_t mutex_exit_queue;
extern pthread_mutex_t mutex_susp_ready_list;
extern pthread_mutex_t mutex_susp_block_list;
extern pthread_mutex_t mutex_block_list;
extern pthread_mutex_t io_blocked_mutex;
extern pthread_mutex_t mutex_io;
extern pthread_mutex_t send_package_dispatch_mutex;
extern pthread_mutex_t mutex_cpu_list;
extern pthread_mutex_t mutex_blocked_by_io_list;

// Listas y Colas de Kernel
extern t_list *new_list;
// extern t_list *blocked_io_devices;
extern t_list *ready_list;
extern t_list *exec_list;
extern t_list *block_list;
extern t_list *susp_block_list;
extern t_list *susp_ready_list;
extern t_queue *exit_queue;
extern t_list *devices_list;
extern t_list *cpu_list;
extern t_list *blocked_by_io_list;
extern t_list *blocked_process_list;

#endif /* GLOBAL_H */
