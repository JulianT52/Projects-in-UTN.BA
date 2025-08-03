#ifndef PCB_H
#define PCB_H
#define ESTADO_CANTIDAD 8

#include <stdlib.h>
#include <stdio.h>
#include <stdint.h>
#include <commons/temporal.h>
#include <commons/collections/list.h>

// Definicion de los estados de los procesos
typedef enum
{
    STOP,
    NEW,
    READY,
    BLOCKED,
    EXEC,
    SUSP_READY,
    SUSP_BLOCK,
    EXIT
} t_status_process;

// Definicion de la estructura PCB
typedef struct
{
    int PID;
    uint32_t PC;
    int size;
    t_status_process status;
    char *pseudocode_file;
    int ME[ESTADO_CANTIDAD];
    uint64_t MT[ESTADO_CANTIDAD];
    t_temporal *chronometer;
    t_temporal *chronometer_burst;
    double burst_estimate;
    int suspension_count;
} t_PCB;

typedef struct
{
    t_PCB *pcb;
    int socket;
    int suspension_count;
} t_susp_timer_thread_args;

#endif /* PCB_H */
