#ifndef PLANIFICACION_H
#define PLANIFICACION_H

#include <ctype.h>
#include <commons/collections/queue.h>
#include <commons/collections/dictionary.h>
#include <commons/collections/list.h>
#include <unistd.h>
#include <utils/log.h>
#include <semaphore.h>
#include <pthread.h>
#include <commons/config.h>
#include <utils/utilsClient.h>
#include "functionsKernel.h"
#include "PCB.h"

t_PCB *createPCB (int pid);
void *create_process(int process_size, int num_pid, char *pseudocode_file);
void* create_init_process(int process_size, int num_pid, char *pseudocode_file);
void start_queues();
void destroy_queues();
void start_semaphores();
void destroy_semaphores();
void wait_enter();
void wait_large_term_init(sem_t *large_term_semaphore);

void* long_term_planning(void *arg);
void *mid_term_planning();
void *short_term_planning();

void* ltp_new_ready_FIFO();
void* ltp_new_ready_PMCP();

void* mtp_susp_ready_ready_FIFO();
void* mtp_susp_ready_ready_PMCP();

void* stp_ready_exec_FIFO();
void* stp_ready_exec_SJF();
void* stp_ready_exec_SRT();

void *syscall_interrupt_handler(void *arg);
void manage_syscall_init_proc(t_buffer_SIZE_PATH_to_KERNEL_INIT_PROC *buffer, t_PCB* pcb);
void manage_syscall_exit(t_PCB* pcb);
char* normalize_string(const char* to_normalize);
void manage_syscall_io(t_buffer_IO_NAME_TIME_MS_SYSCALL_IO *buffer, t_PCB* pcb);
void manage_syscall_dump_memory(t_buffer_PID_to_MEMORY_DUMP_MEMORY *buffer, t_PCB* pcb);

void *suspension_timer_IO(t_susp_timer_thread_args *arg);
void *suspension_timer_dump_memory(t_PCB *pcb_exec);
void *IO_completed_thread(t_io_thread_args * arg);

void *send_CPU_process_dispatch(t_PCB *pcb, t_cpu *cpu); 

#endif /* PLANIFICACION_H */
