#include "utilsClient.h"
#include "globalUtils.h"


t_config *iniciar_config(char *path)
{
    t_config *nuevo_config = config_create(path);
    if (nuevo_config == NULL)
    {
        perror("Hubo error a intentar inciar la configuracion");
        exit(EXIT_FAILURE);
    }
    return nuevo_config;
}

//Creo la conexion entre un servidor y un cliente
int create_connection(char* ip, char* port) {
    struct addrinfo hints, *servinfo;

    memset(&hints, 0, sizeof(hints));
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;

    getaddrinfo(ip, port, &hints, &servinfo);

    int socket_cliente = socket(servinfo->ai_family, servinfo->ai_socktype, servinfo->ai_protocol);
    if (socket_cliente == -1) 
		return -1;

    if (connect(socket_cliente, servinfo->ai_addr, servinfo->ai_addrlen) == -1) 
	  return -1;

    freeaddrinfo(servinfo);
    return socket_cliente;
}

//Creamos el buffer y lo inicializamos
void create_buffer(t_package *package)
{
	package->buffer = malloc(sizeof(void*));
	package->buffer_size = 0;
}

//Creamos el paquete y lo inicializamos
t_package *create_package(t_message_type type, t_op_code op_code)
{
	t_package *package = malloc(sizeof(t_package));
	package->message_type = type;
	package->op_code = op_code;

	if(type == PACKAGE)
		create_buffer(package);
	
	else{
		package->buffer = NULL;
		package->buffer_size = 0;
	}
	
	return package;
}

//Enviamos el paquete
void send_package(t_package *package, int client_socket)
{
	void *to_send = serialize_package(package);
	send(client_socket, to_send, package->buffer_size + sizeof(t_message_type) + sizeof(t_op_code) + sizeof(int), 0);
	free(to_send);
	delete_package(package);
}

//Eliminamos el paquete
void delete_package(t_package *package)
{
	if(package->message_type == PACKAGE && package->buffer != NULL)
	{
		free(package->buffer);
	}
	free(package);
	return;
}

//Liberamos la conexion
void free_connection(int client_socket)
{
	close(client_socket);
}
