#include "utilsCpu.h"

#ifndef TLB_Y_CACHE_H
#define TLB_Y_CACHE_H

// Funciones TLB
int search_tlb(int PID, int page);
void add_to_tlb(int pid, int page, int frame);
void add_to_cache(t_cache_entry *entry, int whereToWrite, bool wasWrited);
void add_tlb_FIFO(int pid, int page, int frame);
void add_tlb_LRU(int pid, int page, int frame);
void clean_tlb(int pid);

bool compareTimestamp(void* a, void* b);

// Funciones Cache
t_cache_entry *search_cache(int PID, int page);
void clean_cache_with_pid(int pid);
void replace_with_clock(t_cache_entry* to_add);
void replace_with_clock_m(t_cache_entry* to_add);

// Función para traducir dirección virtual a física
t_translate_result translate_logical_to_physical_address_to_write(t_logical_address* logical_adrr, cpu_context_t* context, char* value); 
t_translate_result translate_logical_to_physical_address_to_read(t_logical_address* logical_adrr, cpu_context_t* context, int size);

// Funciones de traducción de direcciones
int search_in_page_table (int pid, t_logical_address *logical_address);
int calculate_page_number(int logical_address);
int calculate_level_entry(int page_number, int level);
int calculate_offset(int logical_address);

char* read_memory(u_int32_t address, int tam,int PID);
char * request_full_page(u_int32_t * physical_address, int PID);
int write_memory(u_int32_t address, char* value, int pid);
int write_full_page_memory(u_int32_t address, char* value, int pid);

#endif // TLB_Y_CACHE_H
