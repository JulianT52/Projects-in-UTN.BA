#include "utilsMemoria.h"
#include <utils/globalUtils.h>
#include <utilsMemoria/globalMemoria.h>

sem_t sem_memory_ready;
pthread_mutex_t mutex_client_socket;
t_memory *memory;
t_swap *swap;

void start_semaphores_memory(){

   sem_init(&sem_memory_ready,0,0);
   pthread_mutex_init(&mutex_write_read_memory, NULL);
   pthread_mutex_init(&mutex_client_socket, NULL);
   return;
}

void init_memory_list(){
    memory = malloc(sizeof(t_memory));
    memory->process = list_create();    
    memory->cant_process = 0;         
    // memory->space_memory = malloc(atoi(tam_memoria));  
    memory->space_memory = calloc(1, atoi(tam_memoria));
    memory->cant_frames = atoi(tam_memoria) / atoi(tam_pagina);
    memory->frames = bitarray_create_with_mode(calloc(memory->cant_frames/8, sizeof(char)), memory->cant_frames/8, LSB_FIRST);
    return;
}

void init_swap_list(){
    swap = malloc(sizeof(t_swap));
    swap->swap_file = strdup(path_swapfile);
    swap->page_in_swap = list_create();
}

// creo de forma recursiva para que vaya generando la entradas y los niveles
//t_page_table* create_talbe(){}

//asignar marco libre a un proceso
// int free_frame(){
//     for (int i = 0; i < memory->cant_frames; i++){
//         if(!bitarray_test_bit(memory->frames, i)){
//             return i;
//         }
//     }
//     return -1; // No hay marcos libres
// }

/*
// inicio swap
t_swap* swap_init(char* path_swapfile){
    t_swap* swap = malloc(sizeof(t_swap));
    swap->archivo = fopen(path_swapfile, "w+b");
    swap->page_in_swap = list_create();
    swap->total_pages = 0; 
    return swap;
}
*/


// ------------------------------------------------------------------
// ------------------------------------------------------------------
// ------------------------PARTES CPU--------------------------------
// ------------------------------------------------------------------
// ------------------------------------------------------------------

t_process* process_id_search(int pid) {
    for (int i = 0; i < memory->cant_process; i++) {
        t_process* process = list_get(memory->process, i);
        if (process->pid == pid) {
            return process;
        }
    }
    
    // log_error(loggerMemoria, "El proceso con el PID %d no se encontro en memoria \n", pid);
    return NULL;
}

 void create_buffer_to_send_instruction(t_package *package)
 {
 	package->buffer = malloc(sizeof(void*));
	package->buffer_size = 0;
 }


t_package *create_package_to_send_instruction(t_message_type type, t_op_code op_code)
{
	t_package *package = malloc(sizeof(t_package));
	package->message_type = type;
	package->op_code = op_code;

	if(type == PACKAGE)
		create_buffer_to_send_instruction(package);
	else
		package->buffer = NULL;
        package->buffer_size = 0;
	
	return package;
}

void send_package_with_instruction(t_package *package, int client_socket)
{
	void *to_send = serialize_package(package);
	send(client_socket, to_send, package->buffer_size + sizeof(t_message_type) + sizeof(t_op_code) + sizeof(int), 0);
	free(to_send);
	delete_package_with_instruction(package);
}

void delete_package_with_instruction(t_package *package)
{
	if(package->message_type == PACKAGE && package->buffer != NULL)
	{
		free(package->buffer);
        package->buffer = NULL;
	}
	free(package);
	return;
}

