#ifndef UTILS_H_
#define UTILS_H_

#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <commons/config.h>
#include <commons/collections/list.h>
#include <commons/collections/dictionary.h>
#include <commons/txt.h>
#include <commons/temporal.h>
#include <commons/string.h>
#include <commons/memory.h>  
#include <commons/log.h>
#include <sys/socket.h>
#include <unistd.h>
#include <semaphore.h>
#include <assert.h>
#include <pthread.h>
#include <netdb.h>
#include <netinet/in.h>
#include "serializacion.h"
#include "structsKernel.h"
#include "structsCpu.h"

int start_server(char *port, t_log *logger);
t_package *receive_package(int socket);
t_package *receive_package_with_interrupt_reason_safe(int socket);


#endif /* UTILS_H_ */
