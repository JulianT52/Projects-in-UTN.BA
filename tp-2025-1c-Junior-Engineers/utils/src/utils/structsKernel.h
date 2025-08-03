#ifndef STRUCTS_KERNEL_H
#define STRUCTS_KERNEL_H
#include <stdlib.h>
#include <stdio.h>
#include <commons/collections/queue.h>
#include <semaphore.h>

typedef enum
{
    HANDSHAKE_IO,
    HANDSHAKE_CPU,
    HANDSHAKE_KERNEL,
    HANDSHAKE_MEMORIA,
    HANDSHAKE_INTERRUPT,
    HANDSHAKE_DISPATCH
} ID;
typedef struct
{
    int socket_interrupt;
    int socket_dispatch;
    bool isFree;
    char *cpuName;
    int PID_in_exec;
} t_cpu;
typedef struct
{
    ID module;
    int socket;
} Handshake;
typedef struct
{
    char *port;
    char *type; // "DISPATCH" o "INTERRUPT"
} server_args_t;
typedef struct
{
    char *ip;
    char *port;
} t_memory_args;
typedef struct
{
    int size;
    char *pseudocode_file;
} t_long_term_args;
typedef struct
{
    char *io_name;
    int io_socket;
    // t_list *blocked_process;
    sem_t sem_from_io;
    pthread_mutex_t mutex_from_io;
    bool free;
    bool disconnected;
} t_io_devices;

typedef struct
{
    int time_ms;
    int PID;
    t_io_devices *device;
} t_io_thread_args;

typedef struct
{
    int pid;
    int time;
    char *io_name;
} t_io_blocked;

#endif // STRUCTS_KERNEL_H