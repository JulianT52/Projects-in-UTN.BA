#include "utilsServer.h"
#include "globalUtils.h"

t_log * loggerUtils;

int start_server(char *port, t_log *logger) {

    struct addrinfo hints, *server_info;
    memset(&hints, 0, sizeof(hints));
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_flags = AI_PASSIVE;

    getaddrinfo(NULL, port, &hints, &server_info);

    int server_socket = socket(server_info->ai_family, server_info->ai_socktype, server_info->ai_protocol);
    setsockopt(server_socket, SOL_SOCKET, SO_REUSEPORT, &(int){1}, sizeof(int));
    bind(server_socket, server_info->ai_addr, server_info->ai_addrlen);
    listen(server_socket, SOMAXCONN);
    freeaddrinfo(server_info);

    log_debug(logger,"Servidor para Kernel y CPU esperando conexiones en puerto %s...\n", port);

    return server_socket;
}

t_package *receive_package_with_interrupt_reason_safe(int socket)
{ 
    t_package* package = malloc(sizeof(t_package));
    int ret;

    ret = recv(socket, &(package->message_type), sizeof(t_message_type), MSG_WAITALL);
    if (ret <= 0) { free(package); return NULL; }

    
    ret = recv(socket, &(package->op_code), sizeof(t_op_code), MSG_WAITALL);
    if (ret <= 0) { free(package); return NULL; }

   
    ret = recv(socket, &(package->buffer_size), sizeof(int), MSG_WAITALL);
    if (ret <= 0) { free(package); return NULL; }

    
    if(package->buffer_size > 0){
        package->buffer = malloc(package->buffer_size);
        ret = recv(socket, (package->buffer), package->buffer_size, MSG_WAITALL);
        if (ret <= 0) { 
            free(package->buffer); 
            free(package); 
            return NULL; 
        }
    } else {
        package->buffer = NULL;
    }

   
    if(package->message_type == PACKAGE && package->buffer_size <= 0)
    {
        if(package->buffer) free(package->buffer);
        free(package);
        return NULL;
    }
  
    return package;
}


t_package *receive_package(int socket){
   
  t_package* package = malloc(sizeof(t_package));

  recv(socket, &(package->message_type), sizeof(t_message_type), MSG_WAITALL);

  if(package->message_type != PACKAGE && package->message_type != MESSAGE) {
    close(socket);
    printf("Error al recibir el tipo de mensaje\n");
    return NULL;
  }

  recv(socket, &(package->op_code), sizeof(t_op_code), MSG_WAITALL);

  if(package->op_code < 0) {
    close(socket);
    printf("Error al recibir el código de operación\n");
    return NULL;
  }

  recv(socket, &(package->buffer_size), sizeof(int), MSG_WAITALL);

  package->buffer = malloc(package->buffer_size);
  recv(socket, (package->buffer), package->buffer_size, MSG_WAITALL);

  return package;
}
