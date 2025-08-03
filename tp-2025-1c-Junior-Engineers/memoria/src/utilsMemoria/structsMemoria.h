#ifndef STRUCTS_MEMORIA_H
#define STRUCTS_MEMORIA_H

#include <commons/collections/dictionary.h>
#include <commons/bitarray.h>
#include <stdio.h>
#include <stdlib.h>
#include <utils/structsKernel.h>

//Struct para el listado de metricas 
typedef struct{
    int cant_access_page_table;
    int cant_request_instruction;
    int cant_read_memory;
    int cant_write_memory;
    int cant_drop_swap;
    int cant_upload_memory;
} t_metrics;

typedef struct{
    int entry;
    bool is_final_level; 
    void* next_level;
} t_page_entry; 

typedef struct {
    t_list* entries;
    int level; 
} t_page_table;

typedef struct{
    int page_number;
    int frame_assigned; 
} t_page;

typedef struct{
    int pid; 
    int size; 
    char **instructions;
    int cant_instructions;
    t_metrics *metrics;
    t_page_table *page_table; 
} t_process;

typedef struct{
    t_bitarray* frames;
    int cant_frames;
    t_list* process;
    int cant_process;
    void* space_memory; 
}t_memory;

typedef struct{
    int page; 
    int pos_page;
}t_swap_page;

typedef struct{
    int pid;
    t_list* pages;  
}t_swap_process;

typedef struct{
    FILE* swap_file;
    t_list* page_in_swap;
} t_swap; 


#endif // STRUCTS_MEMORIA_H