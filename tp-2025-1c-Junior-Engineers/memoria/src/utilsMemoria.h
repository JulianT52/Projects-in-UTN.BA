#ifndef UTILS_MEMORIA_H
#define UTILS_MEMORIA_H

#include <utilsMemoria/structsMemoria.h>
#include <utils/utilsServer.h>
#include <utils/utilsClient.h>

void init_memory_list();
void init_swap_list();
void start_semaphores_memory();
void wait_request_kernel(t_package *package);
void read_configs_memory(t_config * config);
t_process* process_id_search(int pid);
void create_buffer_to_send_instruction(t_package *package);
t_package *create_package_to_send_instruction(t_message_type type, t_op_code op_code);
void send_package_with_instruction(t_package *package, int client_socket);
void delete_package_with_instruction(t_package *package);
char* get_instruction(int pid, int pc);
t_page_table* create_table(int current_level, int max_levels);
//void handle_package_cpu(void *socket);

#endif // UTILS_MEMORIA_H