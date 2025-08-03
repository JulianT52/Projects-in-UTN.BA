#ifndef CPU_H
#define CPU_H

#include "utilsMemoria.h"

char* get_instruction(int pid, int pc);
void* handle_package_cpu(int *cpu_socket);
int frame_request_to_logical_address(t_buffer_PID_PAGE_ENTRIES * buffer);
char* get_memory_value(u_int32_t address, int pid, int size);
char* read_full_page(u_int32_t address, int pid);
void write_memory_value(u_int32_t address, char* value, int pid);
void write_full_page(u_int32_t address, char* content, int pid);

#endif // CPU_H