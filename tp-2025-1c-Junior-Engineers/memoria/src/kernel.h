#ifndef KERNEL_H
#define KERNEL_H

#include <utils/utilsServer.h>
#include <utils/structsCpu.h>
#include "utilsMemoria.h"

void read_init_package_kernel(t_buffer_PID_SIZE_to_MEMORY *data, int socket);
void *handle_package_kernel(void *arg);
char* jump_line(char* line);
char** read_path(const char* path_file, int* num_lines);
void finalize_process(int pid);
void get_different_values(int* array, int size);
t_page_table* create_page_table(int level, int* remaining_pages);
void read_instruction(char* path, int pid);
void free_page_table(t_page_table* table);
int count_free_frames();
int search_for_free_frame();
void suspend_process(int pid);
void resume_process(int pid);
void write_pages_in_dump(t_page_table* table, FILE* file, int pages_to_write, int * writed_pages);
void write_page_swap(t_page_table *table, int pid, FILE* swapfile, int* pages_swap);
t_swap_process* find_suspended_process(int pid);
void restore_pages_swap(t_page_table* table, t_swap_process* swap_proc, FILE* swapfile, int* pages_read);


#endif // KERNEL_H