#ifndef UTILS_H_
#define UTILS_H_

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <stdint.h>
#include <signal.h>
#include <commons/config.h>
#include <commons/collections/list.h>
#include <commons/string.h>    
#include <commons/log.h>
#include <time.h>  
#include <sys/socket.h>
#include <unistd.h>
#include <math.h>
#include <sys/types.h>
#include <semaphore.h>
#include <pthread.h>
#include <limits.h>
#include <netdb.h>
#include "serializacion.h"
#include "structsKernel.h"


t_config *iniciar_config(char *path);
int create_connection(char* ip, char* port);
void create_buffer(t_package* package);
t_package* create_package(t_message_type message_type, t_op_code op_code);
void send_package(t_package* package, int client_socket);
void delete_package(t_package* package);
void free_connection(int client_socket);

#endif /* UTILS_H_ */
