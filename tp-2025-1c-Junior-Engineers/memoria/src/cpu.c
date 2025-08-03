#include "cpu.h"
#include <utilsMemoria/globalMemoria.h>

sem_t sem1;
pthread_mutex_t mutex_write_read_memory;

void *handle_package_cpu(int *cpu_socket)
{

    while (1)
    {

        t_package *package = receive_package(cpu_socket);

        if (package == NULL)
        {
            log_error(loggerMemoria, "Error al recibir el paquete de CPU, cierro hilo");
            break;
        }

        if (package->buffer == NULL)
        {
            log_error(loggerMemoria, "El paquete recibido de CPU no contiene datos, cierro hilo");
            break;
        }

        switch (package->op_code)
        {
        case REQUEST_INSTRUCTION:
            usleep(atoi(retardo_memoria) * 1000);
            t_buffer_PID_PC_to_CPU *data = deserialize_buffer_PID_PC_to_CPU(package->buffer);
            int pid = data->PID;
            int pc = data->PC;

            char *instruction_received = get_instruction(pid, pc);

            if (instruction_received == NULL)
            {
                log_debug(loggerMemoria, "Fin del archivo");
                t_package *package_end = create_package_to_send_instruction(MESSAGE, END_OF_INSTRUCTIONS);
                send_package_with_instruction(package_end, cpu_socket);
                break;
            }

            t_package *package_response = create_package_to_send_instruction(PACKAGE, RESPONSE_INSTRUCTION);
            t_buffer_INSTRUCTION_to_CPU *buffer_response = malloc(sizeof(t_buffer_INSTRUCTION_to_CPU));
            buffer_response->instruction = strdup(instruction_received);

            int buffer_size;
            package_response->buffer = serialize_buffer_INSTRUCTION_to_CPU(buffer_response, &buffer_size);
            package_response->buffer_size = buffer_size;

            send_package_with_instruction(package_response, cpu_socket);

            break;

        case REQUEST_FRAME:
            usleep(atoi(retardo_memoria) * 1000);
            t_buffer_PID_PAGE_ENTRIES *buffer_request = deserialize_buffer_PID_PAGE_ENTRIES(package->buffer);

            int frame_response = frame_request_to_logical_address(buffer_request);

            send(cpu_socket, &frame_response, sizeof(int), 0);
            break;

        case WRITE_MEMORY:
            usleep(atoi(retardo_memoria) * 1000);
            t_buffer_CONTENT_SIZE_TO_CPU *buffer_write = deserialize_buffer_CONTENT_SIZE_TO_CPU(package->buffer);
            u_int32_t address_write = buffer_write->size;
            log_debug(loggerMemoria, "Dirección de escritura1: %d", address_write);
            log_debug(loggerMemoria, "Dirección de escritura2: %d", buffer_write->size);
            char *content = buffer_write->content;
            int pid_write = buffer_write->pid;

            write_memory_value(address_write, content, pid_write);

            int response = 1;

            send(cpu_socket, &response, sizeof(int), 0);

            log_info(loggerMemoria, "## PID: <%d> - <Escritura> - Dir.Fisica: <%d> - Tamaño: <%d>", pid_write, address_write, 4);

            break;

        case READ_MEMORY:
            usleep(atoi(retardo_memoria) * 1000);
            t_buffer_ADDRESS_SIZE_TO_MEMORY *buffer_read = deserialize_buffer_ADDRESS_SIZE_TO_MEMORY(package->buffer);
            u_int32_t address_read = buffer_read->address;
            int tam_read = buffer_read->size;
            int pid_read = buffer_read->pid;

            log_debug(loggerMemoria, "Dirección de lectura1: %d", address_read);
            log_debug(loggerMemoria, "Dirección de lectura2: %d", buffer_read->address);

            log_debug(loggerMemoria, "tam a leer: %d", tam_read);

            t_package *package_read = create_package_to_send_instruction(PACKAGE, READ_OK);
            t_buffer_CONTENT_SIZE_TO_CPU *buffer_content = malloc(sizeof(t_buffer_CONTENT_SIZE_TO_CPU));
            buffer_content->content = get_memory_value(address_read, pid_read, tam_read);
            buffer_content->size = 0;
            buffer_content->pid = 0;

            int size_buffer_read;
            package_read->buffer = serialize_buffer_CONTENT_SIZE_TO_CPU(buffer_content, &size_buffer_read);
            package_read->buffer_size = size_buffer_read;
            send_package_with_instruction(package_read, cpu_socket);
            break;

        case REQUEST_FULL_PAGE:
            usleep(atoi(retardo_memoria) * 1000);
            t_buffer_ADDRESS_PID_TO_MEMORY *buffer_full_page = deserialize_buffer_ADDRESS_PID_TO_MEMORY(package->buffer);
            u_int32_t address_full_page_read = buffer_full_page->address;
            int pid_full_page_read = buffer_full_page->pid;

            char *content_full_page = read_full_page(address_full_page_read, pid_full_page_read);

            //log_debug(loggerMemoria, "HOOLAA ENVIO PAGINA COMPLETA EL CONTENIDO QUE TIENE ES: %s", content_full_page);

            t_package *package_full_page = create_package_to_send_instruction(PACKAGE, REQUEST_FULL_PAGE);
            t_buffer_PAGE_CONTENT *buffer_page_content = malloc(sizeof(t_buffer_PAGE_CONTENT));
            buffer_page_content->page = content_full_page;

            int size_buffer;
            package_full_page->buffer = serialize_buffer_PAGE_CONTENT(buffer_page_content, &size_buffer);
            package_full_page->buffer_size = size_buffer;
            send_package_with_instruction(package_full_page, cpu_socket);
            break;

        case WRITE_FULL_PAGE:
            usleep(atoi(retardo_memoria) * 1000);
            t_buffer_CONTENT_SIZE_TO_CPU *buffer_full_write = deserialize_buffer_CONTENT_SIZE_TO_CPU(package->buffer);
            u_int32_t address_full_write = buffer_full_write->size;
            char *content_to_replace = buffer_full_write->content;
            int pid_full_write = buffer_full_write->pid;

            log_debug(loggerMemoria, "Dirección de escritura completa1");

            write_full_page(address_full_write, content_to_replace, pid_full_write);

            int response_write = 1;

            send(cpu_socket, &response_write, sizeof(int), 0);
            break;

        default:
            log_error(loggerMemoria, "Operación no reconocida: %d\n", package->op_code);
            free(package->buffer);
            free(package);
            break;
        }
    }
}

int frame_request_to_logical_address(t_buffer_PID_PAGE_ENTRIES *buffer)
{
    t_process *process = process_id_search(buffer->pid);
    if (!process)
        return -1;

    t_page_table *current_table = process->page_table;
    int to_get;

    for (int i = 0; i < buffer->entries_cant; i++)
    {
        to_get = buffer->entries[i];

        log_debug(loggerMemoria, "to_get: %d, list_size: %d", to_get, list_size(current_table->entries));

        if (to_get >= list_size(current_table->entries))
        {
            return -1;
        }

        t_page_entry *entry = list_get(current_table->entries, to_get);

        process->metrics->cant_access_page_table++;

        if (entry->is_final_level)
        {
            t_page *page = (t_page *)entry->next_level;
            return page->frame_assigned;
        }
        else
        {
            current_table = (t_page_table *)entry->next_level;
        }
    }

    return -1;
}

char *get_instruction(int pid, int pc)
{
    t_process *process = process_id_search(pid);

    if (pc < 0 || process == NULL || pc >= process->cant_instructions)
    {
        return NULL;
    }

    log_info(loggerMemoria, "## PID: <%d> - Obtener instrucción: <%d> - Instrucción: <%s>", pid, pc, process->instructions[pc]);
    process->metrics->cant_request_instruction++;
    return process->instructions[pc];
}

char *get_memory_value(u_int32_t address, int pid, int size)
{
    t_process *process = process_id_search(pid);
    if (process == NULL)
    {
        return NULL;
    }

    char *value = malloc(size + 1); // +1 por si es string, para el '\0'
    if (value == NULL)
    {
        return NULL;
    }

    if (memory->space_memory == NULL)
    {
        log_error(loggerMemoria, "Memoria principal no inicializada");
        return NULL;
    }

    if (address + size > memory->cant_frames * atoi(tam_pagina))
    {
        log_error(loggerMemoria, "Dirección de lectura inválida: %u + %d excede memoria", address, size);
        return NULL;
    }

    pthread_mutex_lock(&mutex_write_read_memory);
    memcpy(value, memory->space_memory + address, size);
    pthread_mutex_unlock(&mutex_write_read_memory);

    value[size] = '\0'; // Asegura terminación si es string, no afecta binario

    process->metrics->cant_read_memory++;
    log_info(loggerMemoria, "## PID: <%d> - <Lectura> - Dir. Física: <%u> - Tamaño: <%d>", pid, address, size);

    return value;
}

char *read_full_page(u_int32_t address, int pid)
{
    t_process *process = process_id_search(pid);
    if (process == NULL)
    {
        return NULL;
    }

    char *value = malloc(atoi(tam_pagina) + 1);
    pthread_mutex_lock(&mutex_write_read_memory);
    memcpy(value, memory->space_memory + address, atoi(tam_pagina));
    pthread_mutex_unlock(&mutex_write_read_memory);
    value[atoi(tam_pagina)] = '\0';
    process->metrics->cant_read_memory++;
    return value;
}

void write_memory_value(u_int32_t address, char *value, int pid)
{
    t_process *process = process_id_search(pid);
    if (process == NULL)
    {
        return NULL;
    }
    pthread_mutex_lock(&mutex_write_read_memory);
    memcpy(memory->space_memory + address, value, strlen(value));
    char *to_print = strndup(memory->space_memory + address, strlen(value));
    log_debug(loggerMemoria, "Agrege a SPACE MEMORY %s", to_print);
    pthread_mutex_unlock(&mutex_write_read_memory);
    process->metrics->cant_write_memory++;
    return;
}

void write_full_page(u_int32_t address, char *content, int pid)
{

    t_process *process = process_id_search(pid);
    if (process == NULL)
    {
        return NULL;
    }
    pthread_mutex_lock(&mutex_write_read_memory);
    memset(memory->space_memory + address, 0, atoi(tam_pagina));
    memcpy(memory->space_memory + address, content, strlen(content));
    pthread_mutex_unlock(&mutex_write_read_memory);
    process->metrics->cant_write_memory++;
}
