#ifndef STRUCTS_CPU_H
#define STRUCTS_CPU_H

#include <stdio.h>
#include <stdlib.h>

// typedef enum {
//     VERIFY_INTERRUPT,
//     INTERRUPT_RECEIVED,
//     INTERRUPT_RESPONSE,
//     READ_MEMORY,
//     WRITE_MEMORY,
//     START_PROCESS,
//     DUMP_MEMORY,
//     EXIT_PROCESS
// } t_cache_op_code;

typedef struct{

  u_int32_t pagetam;
  u_int32_t pagelevels;
  u_int32_t entries;
  int socket;
  
}handshakeMemory;

typedef struct{
    int pcb;
    int PID;
} t_cpu_pcb;

// Estructura para almacenar una instrucción parseada
typedef struct {
    char* name;
    char*(*parameters);
    int cant_parameters;
} t_instruction; 

//TLB
typedef struct {
    int page_number;
    int frame_number;
    int pid;
    time_t timestamp;
} t_tlb_entry;

//CACHE
typedef struct {
    int pid;
    int page_number;
    int frame_number;    
    void* content;    
    time_t timestamp;
    bool modified;   
    bool referenced; 
} t_cache_entry;

typedef struct {
    bool hit_cache;
    u_int32_t physical_address;
    t_cache_entry* cache_entry;
} t_translate_result;

// Algoritmos de reemplazo
typedef enum {
    FIFO,
    LRU,
    CLOCK,
    CLOCK_M
} t_replacement_algorithm;

// Estructura para manejar la traducción de direcciones multi-nivel
typedef struct {
    int value;
    int page_number;
    int* level_entries;  // Array con las entradas de cada nivel
    int offset;
} t_logical_address;

// Estructura para solicitud de instrucción
typedef struct {
    int pid;
    int pc;
} t_instruction_request;

// Estados del ciclo de instrucción
typedef enum {
    FETCH,
    DECODE,
    EXECUTE,
    CHECK_INTERRUPT,
    INTERRUPTED
} cpu_cycle_state;

// Estructura para el contexto de ejecución
typedef struct {
    int pid;
    int pc;
    t_list* instructions;
    bool interrupted;
    cpu_cycle_state state;
    t_instruction* current_instruction;
} cpu_context_t;

typedef struct{
  char *ip;
  char *port;
  char *identifier;
}t_cpu_kernel_args;

typedef struct{
  char *ip;
  char *port;
}t_cpu_memory_args;

#endif /* STRUCTS_CPU_H */