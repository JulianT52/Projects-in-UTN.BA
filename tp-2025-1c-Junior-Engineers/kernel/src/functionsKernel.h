#ifndef FUNCTIONS_KERNEL_H
#define FUNCTIONS_KERNEL_H

#include <utilsKernel/PCB.h>
#include <utils/utilsClient.h>
#include <utils/utilsServer.h>

void read_configs_kernel(t_config *config);
int start_io_server(void *args);
int start_dispatch_server(void *args);
int start_interrupt_server(void *args);
void wait_connections_kernel(int server_socket);
int connectTwoModules(char *ip, ID module, char *port, char *destiny);
t_package *init_package_to_send_CPU(int pid, int pc);
t_cpu *search_for_frees_cpu();

t_package *init_package_to_send_MEMORY(int pid, int size, char *path_file);

void change_status(t_PCB *pcb, t_status_process status);
void log_metrics(t_PCB *pcb);
char *name_status(t_status_process status);

bool compare_process_size(void *p1, void *p2);
bool compare_burst_estimate(void *burst1, void *burst2);
t_PCB *update_burst_estimate(t_PCB *pcb);
double calculate_remaining_time(t_PCB *pcb);

t_package *receive_package_with_interrupt_reason(int socket);
int send_interrupt(t_PCB *pcb);

t_cpu *search_cpu_with_socket(int socket);
t_cpu *search_and_remove_cpu_with_socket(int socket);
t_cpu *search_cpu_for_pid(int PID);
t_cpu *remove_cpu_from_pid(int PID);

t_PCB *list_remove_by_pid(t_list *list, int pid);
t_PCB *list_get_by_pid(t_list *list, int pid);
t_PCB *search_pcb_from_pid(t_list *list, int pid);

void end_process_io_disc(t_io_devices *io_device);

#endif /* FUNCTIONS_KERNEL_H */