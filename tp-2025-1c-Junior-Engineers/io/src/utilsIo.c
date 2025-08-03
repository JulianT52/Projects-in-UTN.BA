#include "utilsIo.h"
#include "globalIO.h"

char* ip_kernel;
char* puerto_kernel;
char* log_level;
char* interface_name;

void read_configs_io (t_config *config){

    ip_kernel = config_get_string_value (config,"IP_KERNEL");
    puerto_kernel = config_get_string_value (config,"PUERTO_KERNEL");
    log_level = config_get_string_value (config,"LOG_LEVEL");

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

int connect_io_kernel(char * ip, char *port, char* interface_name){
    
    log_debug(loggerIO, "IO %s CONNECT & HANDSHAKE EN PUERTO %s", interface_name, port);
    int connection = create_connection(ip, port);

    if (connection < 0) {
        log_error(loggerIO, "No se pudo conectar a kernel!");
        return -1;
    }
    
    uint32_t handshake = HANDSHAKE_IO;
    uint32_t result;
    
    send(connection, &handshake, sizeof(uint32_t), 0);

    t_package *package = create_package(PACKAGE, HANDSHAKE_IO);
    t_buffer_DEVICE_TIME_kernel * buffer = malloc(sizeof(t_buffer_DEVICE_TIME_kernel));

    int length = strlen(interface_name) + 1;
    buffer->time_ms = length;
    buffer->io_name = strdup(interface_name);

    int size_buffer;
    package->buffer = serialize_buffer_DEVICE_TIME_kernel(buffer, &size_buffer);
    package->buffer_size = size_buffer;

    send_package(package, connection);

    log_debug(loggerIO, "IO %s conectado a kernel cuya IP es %s a traves del puerto %s -- FD: %d", interface_name, ip, port, connection);
    
    return connection;

}
