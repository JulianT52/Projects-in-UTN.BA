#ifndef IO_H
#define IO_H

#include <stdio.h>
#include <stdlib.h>
#include <netdb.h>
#include <commons/collections/queue.h>
#include <sys/socket.h>
#include <utils/structsKernel.h>

void start_lists();
void *init_listen_io(int server_socket);
void manage_io_connection(int socket_io, char *io_name);
void *wait_end_of_io(t_io_devices* io_device);

#endif /* IO_H */