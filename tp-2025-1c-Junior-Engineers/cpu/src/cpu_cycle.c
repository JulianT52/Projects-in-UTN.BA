#include "cpu_cycle.h"
#include "globalCpu.h"

bool interrupted_ok;
bool finish_proc = 0;

pthread_mutex_t mutex_interrupted_ok;

cpu_context_t *init_cpu_context(int pid, int pc)
{
    cpu_context_t *context = malloc(sizeof(cpu_context_t));
    context->pid = pid;
    context->pc = pc;
    context->instructions = list_create();
    context->current_instruction = NULL;
    context->interrupted = 0;
    context->state = FETCH;
    return context;
}

char *fetch_instruction(cpu_context_t *context)
{

    log_info(loggerCPU, "## PID: %d - FETCH - Program Counter: %d \n", context->pid, context->pc);

    char *instruction_str = request_instruction(context);

    context->state = DECODE;
    return instruction_str;
}

void decode_instruction(cpu_context_t *context, char *instruction)
{

    context->current_instruction = parse_instruction(instruction);
    list_add(context->instructions, context->current_instruction);

    if (context->interrupted)
    {
        context->state = INTERRUPTED;
        return;
    }

    if (strcmp(context->current_instruction->name, "END_OF_INSTRUCTIONS") == 0)
        return;

    if (strcmp(context->current_instruction->name, "NOOP") != 0 &&
        strcmp(context->current_instruction->name, "INIT_PROC") != 0 &&
        strcmp(context->current_instruction->name, "IO") != 0 &&
        strcmp(context->current_instruction->name, "EXIT") != 0 &&
        strcmp(context->current_instruction->name, "GOTO") != 0 &&
        strcmp(context->current_instruction->name, "WRITE") != 0 &&
        strcmp(context->current_instruction->name, "READ") != 0 &&
        strcmp(context->current_instruction->name, "DUMP_MEMORY") != 0)
    {

        log_error(loggerCPU, " La Instruccion no es correcta: %s", context->current_instruction->name);
        context->state = INTERRUPTED;
        return;
    }

    context->state = EXECUTE;
    return;
}

void execute_instruction(cpu_context_t *context)
{

    char *value;
    int size;
    char *instruction_name = context->current_instruction->name;

    log_info(loggerCPU, "## PID: %d - Ejecutando: %s \n", context->pid, instruction_name);

    if (strcmp(instruction_name, "NOOP") == 0)
    {
        return;
    }

    else if (strcmp(instruction_name, "WRITE") == 0)
    {

        int logical_address = atoi(context->current_instruction->parameters[0]);
        value = strdup(context->current_instruction->parameters[1]);

        t_logical_address *address = malloc(sizeof(t_logical_address));

        address->value = logical_address;

        int offset = logical_address % PAGE_TAM;

        t_translate_result translate_result = translate_logical_to_physical_address_to_write(address, context, value);

        if (translate_result.hit_cache == 1)
        {

            memcpy(translate_result.cache_entry->content + offset, value, strlen(value));
            add_to_cache(translate_result.cache_entry, 0, 1);
            log_info(loggerCPU, "PID: %d - Acción: ESCRIBIR en Cache - Valor: %s", context->pid, value);
            free(value);
            free(address);
            return;
        }
        else
        {
            int correct_write = write_memory(translate_result.physical_address, value, context->pid);

            if (correct_write == -1)
                log_error(loggerCPU, "PID: %d - Error al escribir en memoria", context->pid);
            else
                log_info(loggerCPU, "PID: %d - Acción: ESCRIBIR - Dirección Física: %d - Valor: %s", context->pid, translate_result.physical_address, value);

            free(value);
            free(address);
            return;
        }
    }

    else if (strcmp(instruction_name, "READ") == 0)
    {
        int logical_address = atoi(context->current_instruction->parameters[0]);
        value = strdup(context->current_instruction->parameters[1]);
        int size = atoi(value);
        char *to_read;

        t_logical_address *address = malloc(sizeof(t_logical_address));

        address->value = logical_address;

        t_translate_result translate_result = translate_logical_to_physical_address_to_read(address, context, size);

        int offset = logical_address % PAGE_TAM;

        if (translate_result.hit_cache == 1)
        {

            if (translate_result.cache_entry->content != NULL && value > 0)
            {
                to_read = strndup(translate_result.cache_entry->content + offset, size);
                log_info(loggerCPU, "PID: %d - Acción: LEER - Dirección Física: %d - Valor: %s", context->pid, translate_result.physical_address, to_read);
                free(value);
                free(address);
                free(to_read);
                return;
            }
            else
            {
                log_error(loggerCPU, "Cache entry content es NULL o tamaño inválidos\n");
                free(value);
                free(address);
                free(to_read);
                return;
            }
        }
        to_read = read_memory(translate_result.physical_address, size, context->pid);
        free(value);
        free(address);
        free(to_read);
        return;
    }

    else if (strcmp(instruction_name, "GOTO") == 0)
    {

        int target = atoi(context->current_instruction->parameters[0]);
        if (target < 0 || target >= list_size(context->instructions))
        {
            log_error(loggerCPU, "GOTO: dirección inválida %d", target);
        }
        else
        {
            context->pc = target;
        }
    }

    else if (strcmp(instruction_name, "IO") == 0)
    {

        char *device = context->current_instruction->parameters[0];
        int time = atoi(context->current_instruction->parameters[1]);

        log_debug(loggerCPU, "Ejecutando IO en dispositivo %s por %d ms", device, time);

        t_package *package = create_package(PACKAGE, SYSCALL_IO);
        t_buffer_IO_NAME_TIME_MS_SYSCALL_IO *buffer = malloc(sizeof(t_buffer_IO_NAME_TIME_MS_SYSCALL_IO));

        buffer->pid = context->pid;
        buffer->pc = context->pc + 1;
        buffer->time_ms = time;
        buffer->io_name = strdup(device);

        int size_buffer;
        package->buffer = serialize_buffer_IO_NAME_TIME_MS_SYSCALL_IO(buffer, &size_buffer);
        package->buffer_size = size_buffer;

        free(buffer->io_name);
        free(buffer);

        send_package(package, socket_dispatch);

        t_package *package_response = receive_package_CPU(socket_dispatch);

        if (package_response->op_code == STOP_EXEC)
        {
            pthread_mutex_lock(&mutex_interrupted_ok);
            interrupted_ok = 1;
            pthread_mutex_unlock(&mutex_interrupted_ok);
            log_debug(loggerCPU, "Se frena la ejecucion");
        }

        return;
    }

    else if (strcmp(instruction_name, "INIT_PROC") == 0)
    {

        char *file = context->current_instruction->parameters[0];
        int size = atoi(context->current_instruction->parameters[1]);

        log_debug(loggerCPU, "Ejecutando INIT_PROC con el archivo %s de %d bytes", file, size);

        t_package *package = create_package(PACKAGE, SYSCALL_INIT_PROC);
        t_buffer_SIZE_PATH_to_KERNEL_INIT_PROC *buffer = malloc(sizeof(t_buffer_SIZE_PATH_to_KERNEL_INIT_PROC));

        buffer->size = size;
        buffer->pc = context->pc;
        buffer->path_file = strdup(file);

        int size_buffer;
        package->buffer = serialize_buffer_SIZE_PATH_to_KERNEL_INIT_PROC(buffer, &size_buffer);
        package->buffer_size = size_buffer;

        free(buffer->path_file);
        free(buffer);

        send_package(package, socket_dispatch);

        t_package *package_response = receive_package_CPU(socket_dispatch);

        if (package_response->op_code == STOP_EXEC)
        {
            pthread_mutex_lock(&mutex_interrupted_ok);
            interrupted_ok = 1;
            pthread_mutex_unlock(&mutex_interrupted_ok);
            log_debug(loggerCPU, "Se frena la ejecucion");
        }

        return;
    }
    else if (strcmp(instruction_name, "DUMP_MEMORY") == 0)
    {

        log_debug(loggerCPU, "Ejecutando DUMP MEMORY");

        int pid = context->pid;
        t_package *package = create_package(PACKAGE, SYSCALL_DUMP_MEMORY);
        t_buffer_PID_to_MEMORY_DUMP_MEMORY *buffer = malloc(sizeof(t_buffer_PID_to_MEMORY_DUMP_MEMORY));
        buffer->PID = pid;
        buffer->PC = context->pc + 1;

        int size_buffer;
        package->buffer = serialize_buffer_PID_to_MEMORY_DUMP_MEMORY(buffer, &size_buffer);
        package->buffer_size = size_buffer;

        free(buffer);

        send_package(package, socket_dispatch);

        t_package *package_response = receive_package_CPU(socket_dispatch);

        if (package_response->op_code == STOP_EXEC)
        {
            pthread_mutex_lock(&mutex_interrupted_ok);
            interrupted_ok = 1;
            pthread_mutex_unlock(&mutex_interrupted_ok);
            log_debug(loggerCPU, "Se frena la ejecucion");
        }

        return;
    }

    else if (strcmp(instruction_name, "EXIT") == 0)
    {

        t_package *package = create_package(MESSAGE, SYSCALL_EXIT);
        send_package(package, socket_dispatch);

        t_package *package_response = receive_package_CPU(socket_dispatch);

        if (package_response->op_code == STOP_EXEC)
        {
            pthread_mutex_lock(&mutex_interrupted_ok);
            interrupted_ok = 1;
            pthread_mutex_unlock(&mutex_interrupted_ok);
            log_debug(loggerCPU, "Se frena la ejecucion");
        }

        clean_tlb(context->pid);
        clean_cache_with_pid(context->pid);
        return;
    }

    free_instruction(context->current_instruction);
    return;
}

void handle_interrupt()
{

    while (1)
    {
        t_package *package_interrupt = receive_package_CPU(socket_interrupt);

        if (package_interrupt == NULL)
        {
            log_error(loggerCPU, "Error al recibir el paquete de KERNEL INTERRUPT. \n");
        }

        switch (package_interrupt->op_code)
        {
        case INTERRUPT_PROCESS:
         log_info(loggerCPU, "Llega interrupción al puerto Interrupt");
            pthread_mutex_lock(&mutex_interrupted_ok);
            interrupted_ok = true;
            pthread_mutex_unlock(&mutex_interrupted_ok);
            break;

        default:
            log_error(loggerCPU, "Operacion desconocida interrupt. \n");
            break;
        }
    }
}

void run_cpu_cycle(cpu_context_t *context)
{

    char *fetch_result;
    pthread_mutex_lock(&mutex_interrupted_ok);
    interrupted_ok = 0;
    pthread_mutex_unlock(&mutex_interrupted_ok);

    while (context->state != INTERRUPTED)
    {
        if (finish_proc != 1)
        {

            switch (context->state)
            {
            case FETCH:

                fetch_result = fetch_instruction(context);

                if (fetch_result == NULL)
                {
                    // log_debug(loggerCPU, "Proceso termino ejecucion: PID %d \n", context->pid);
                    finish_proc = 1;
                    return;
                }

                if (strcmp(fetch_result, "END_OF_INSTRUCTIONS") == 0)
                {
                    // log_debug(loggerCPU, "Proceso termino ejecucion: PID %d \n", context->pid);
                    finish_proc = 1;
                    return;
                }

                break;

            case DECODE:

                decode_instruction(context, fetch_result);

                break;

            case EXECUTE:

                execute_instruction(context);

                if (strcmp(fetch_result, "EXIT") == 0)
                {
                    finish_proc == 1;
                    return;
                }

                context->state = CHECK_INTERRUPT;

                break;

            case CHECK_INTERRUPT:
                pthread_mutex_lock(&mutex_interrupted_ok);
                if (interrupted_ok == true)
                {
                    pthread_mutex_unlock(&mutex_interrupted_ok);
                    context->state = INTERRUPTED;
                    context->pc = context->pc + 1;
                    break;
                }

                else
                {
                    pthread_mutex_unlock(&mutex_interrupted_ok);
                    context->state = FETCH;
                    context->pc = context->pc + 1;
                    break;
                }
            }
        }
        else
        {
            return;
        }
    }

    if (context->state == INTERRUPTED)
    {
        clean_tlb(context->pid);
        clean_cache_with_pid(context->pid);

        if (strncmp(fetch_result, "IO", 2) == 0)
        {
            t_package *return_pid_pc_package = create_package(MESSAGE, INTERRUPT_SRT_IO);
            send_package(return_pid_pc_package, socket_interrupt);
            return;
        }

        t_package *return_pid_pc_package = create_package(PACKAGE, INTERRUPT_SRT);
        t_buffer_PID_PC_to_CPU *buffer = malloc(sizeof(t_buffer_PID_PC_to_CPU));

        buffer->PID = context->pid;
        buffer->PC = context->pc;

        int size_buffer;
        return_pid_pc_package->buffer = serialize_buffer_PID_PC_to_CPU(buffer, &size_buffer);
        return_pid_pc_package->buffer_size = size_buffer;
        send_package(return_pid_pc_package, socket_interrupt);

        return;
    }

    return;
}
