#include "globalCpu.h"

void start_semaphores(){

   pthread_mutex_init(&mutex_interrupted_ok, NULL);

}

void read_configs_cpu (t_config * config){

    ip_memoria = config_get_string_value(config, "IP_MEMORIA");
    puerto_memoria = config_get_string_value(config, "PUERTO_MEMORIA");
    ip_kernel = config_get_string_value(config, "IP_KERNEL");
    puerto_kernel_dispatch = config_get_string_value(config, "PUERTO_KERNEL_DISPATCH");
    puerto_kernel_interrupt = config_get_string_value(config, "PUERTO_KERNEL_INTERRUPT");
    entradas_TLB = config_get_string_value(config, "ENTRADAS_TLB");
    reemplazo_TLB = config_get_string_value(config, "REEMPLAZO_TLB");
    entradas_cache = config_get_string_value(config, "ENTRADAS_CACHE");
    reemplazo_cache = config_get_string_value(config, "REEMPLAZO_CACHE");
    retardo_cache = config_get_string_value(config, "RETARDO_CACHE");
    log_level = config_get_string_value(config, "LOG_LEVEL");

}

void send_pic_pc_to_memory(int pid,int pc)
{
    ID handshake = HANDSHAKE_CPU;
    ID response;
    send(memory_cpu_socket, &handshake, sizeof(ID),0);
    recv(memory_cpu_socket, &response, sizeof(ID),0);

    if (response == HANDSHAKE_CPU){
   
    t_buffer_PID_PC_to_CPU * buffer = malloc(sizeof(t_buffer_PID_PC_to_CPU));
    buffer->PID = pid;
    buffer->PC = pc; 

    int bytes;
    void * serialized_buffer = serialize_buffer_PID_PC_to_CPU(buffer, &bytes);
    
    t_package * package = malloc(sizeof(t_package));
    package->message_type = PACKAGE;
    package->op_code = INIT_PROCESS;
    package->buffer_size=bytes;
    package->buffer = serialized_buffer;

    send_package(package, memory_cpu_socket);
    
    free(buffer);
    free(package);
    }
    
    else
        log_error(loggerCPU, "No se pudo identificar el handshake con Memoria");

    return NULL;
}

void * get_process_from_kernel(int socket){
    
    t_package *package = receive_package_CPU(socket);

    t_buffer_PID_PC_to_CPU* data = deserialize_buffer_PID_PC_to_CPU(package->buffer);
    log_debug(loggerCPU,"Recibido proceso - PID: %d, PC: %d\n", data->PID, data->PC);

     if (package == NULL) {
        log_error(loggerCPU, "Error: package es NULL");
        return NULL;
    }

    if (package->buffer == NULL) {
        log_error(loggerCPU, "Error: package->buffer es NULL");
        free(package);
        return NULL;
    }
    
    if(package->op_code == EXEC_PROC)
    {
        int offset = 0;
        int pid = data->PID;
        int pc = data->PC;
        // Llamar a funcion que conecta memoria(le envia pid y pc no la de paginacion)
        send_pic_pc_to_memory(pid,pc);
        // liberar memoria 
        free(package->buffer);
        free(package);
        return;
    }

     // t_buffer_PID_PC_to_CPU* data = deserialize_buffer_PID_PC_to_CPU(package->buffer);
    free(package->buffer);
    free(package);
    free(data);
    close(socket);
}

int connect_cpu_as_client_kernel(char *ip, ID module, char *port, char *destiny, char *identifier) {
    

    log_debug(loggerCPU, "CONNECT & HANDSHAKE EN PUERTO %s", port);
    int connection = create_connection(ip, port);

    if (connection < 0) {
        log_error(loggerCPU, "No se pudo conectar a %s!", destiny);
        return -1;
    }

    int length = strlen(identifier) + 1;

    uint32_t handshake = module;
    uint32_t result;
    send(connection, &handshake, sizeof(uint32_t), 0);
    send(connection, &length, sizeof(int), 0);
    send(connection, identifier, length, 0);
    recv(connection, &result, sizeof(uint32_t), MSG_WAITALL);
    
    if (result == -1) {
        log_error(loggerCPU, "No se pudo conectar a %s!", destiny);
        return -1;
        
    } else {
        log_debug(loggerCPU, "%s conectado a %s cuya IP es %s a traves del puerto %s -- FD: %d", identifier,destiny, ip, port, connection);
    }

    
    return connection;
}

handshakeMemory connect_cpu_as_client_memory(char *ip, ID module, char *port, char *destiny, char *identifier) {
    
    handshakeMemory connection;

    log_debug(loggerCPU, "CONNECT & HANDSHAKE EN PUERTO %s", port);


    connection.socket = create_connection(ip, port);

    if (connection.socket < 0) {
        log_error(loggerCPU, "No se pudo conectar a %s!", destiny);
        return connection;
    }

    int length = strlen(identifier) + 1;
    
    uint32_t handshake = module;
    uint32_t page_size;
    uint32_t entries_per_table;
    uint32_t page_levels;
    
    send(connection.socket, &handshake, sizeof(uint32_t), 0);
    recv(connection.socket, &page_size, sizeof(uint32_t), 0);
    recv(connection.socket, &entries_per_table, sizeof(uint32_t), 0);
    recv(connection.socket, &page_levels, sizeof(uint32_t), 0);
    
    if (page_size == -1 || entries_per_table == -1 || page_levels == -1) {
        log_error(loggerCPU, "No se pudo conectar a %s!", destiny);
        return connection;
        
    } else {
        log_debug(loggerCPU, "%s conectado a %s cuya IP es %s a traves del puerto %s -- FD: %d", identifier,destiny, ip, port, connection.socket);
    }

    connection.entries = entries_per_table;
    connection.pagetam = page_size;
    connection.pagelevels = page_levels;

    return connection;
}

t_package *receive_package_CPU(int socket)
{ 
  t_package* package = malloc(sizeof(t_package));

  recv(socket, &(package->message_type), sizeof(t_message_type), MSG_WAITALL);

  recv(socket, &(package->op_code), sizeof(t_op_code), MSG_WAITALL);

  recv(socket, &(package->buffer_size), sizeof(int), MSG_WAITALL);

  if(package->buffer_size > 0){
    package->buffer = malloc(package->buffer_size);
    recv(socket, (package->buffer), package->buffer_size, MSG_WAITALL);
  }
  
  return package;
}

char* request_instruction(cpu_context_t *context) {
     
    t_package *package = create_package(PACKAGE, REQUEST_INSTRUCTION);
    
    t_buffer_PID_PC_to_CPU * buffer = malloc(sizeof(t_buffer_PID_PC_to_CPU));
    buffer->PID = context->pid;
    buffer->PC = context->pc;

    int size_buffer;
    package->buffer = serialize_buffer_PID_PC_to_CPU(buffer, &size_buffer);
    package->buffer_size = size_buffer;

    send_package(package, memory_cpu_socket);

    t_package* response = receive_package_CPU(memory_cpu_socket);
    
    if (response->op_code == RESPONSE_INSTRUCTION)
    {
        t_buffer_INSTRUCTION_to_CPU *buffer_instruction_to_cpu = deserialize_buffer_INSTRUCTION_to_CPU(response->buffer);
        char* instruction = strdup(buffer_instruction_to_cpu->instruction);
        return instruction;
    }

    if(response->op_code == END_OF_INSTRUCTIONS)
    {   
        return "END_OF_INSTRUCTIONS";
    }

    free(buffer);
    free(package);
}