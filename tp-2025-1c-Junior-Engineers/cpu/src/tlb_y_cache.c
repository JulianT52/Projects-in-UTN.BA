#include "tlb_y_cache.h"
#include <commons/temporal.h>
#include "globalCpu.h"

//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------TLB------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------

int search_tlb(int PID, int page)
{

    for (int i = 0; i < list_size(tlb); i++)
    {

        t_tlb_entry *data = list_get(tlb, i);

        if (data->pid == PID && data->page_number == page)
        {
            //temporal_destroy(data->timestamp);
            data->timestamp = temporal_create();
            log_info(loggerCPU, "PID: %d - TLB HIT - Página: %d\n", data->pid, data->page_number);
            return data->frame_number;
        }
    }
    log_info(loggerCPU, "PID: %d - TLB MISS - Página: %d\n", PID, page);
    return -1;
}

void add_tlb_FIFO(int pid, int page, int frame)
{
    t_tlb_entry *entry_to_add = malloc(sizeof(t_tlb_entry));
    entry_to_add->pid = pid;
    entry_to_add->page_number = page;
    entry_to_add->frame_number = frame;

    if (list_size(tlb) > 0)
    {
        list_remove(tlb, 0);
    }
    log_info(loggerCPU, "PID: <%d> - Memory Update - Página: <%d> - Frame: <%d>", entry_to_add->pid, entry_to_add->page_number, entry_to_add->frame_number);
    list_add(tlb, entry_to_add);
}

void add_tlb_LRU(int pid, int page, int frame)
{
    t_tlb_entry *entry_to_add = malloc(sizeof(t_tlb_entry));
    entry_to_add->pid = pid;
    entry_to_add->page_number = page;
    entry_to_add->frame_number = frame;
    entry_to_add->timestamp = temporal_create();

    if (list_size(tlb) > 0)
    {
        list_sort(tlb, compareTimestamp);
        list_remove(tlb, 0);
        log_info(loggerCPU, "PID: <%d> - Memory Update - Página: <%d> - Frame: <%d>", entry_to_add->pid, entry_to_add->page_number, entry_to_add->frame_number);
    }
    list_add(tlb, entry_to_add);
}

bool compareTimestamp(void *a, void *b)
{
    int64_t time1 = temporal_gettime(((t_tlb_entry *)a)->timestamp);
    int64_t time2 = temporal_gettime(((t_tlb_entry *)b)->timestamp);
    return time1 > time2;
}

void add_to_tlb(int pid, int page, int frame)
{

    if (list_size(tlb) > atoi(entradas_TLB))
    {
        log_error(loggerCPU, "La cantidad de entradas de la TLB supero la cantidad maxima\n");
        return;
    }

    if (list_size(tlb) == atoi(entradas_TLB))
    {

        if (strcmp(reemplazo_TLB, "FIFO") == 0)
        {
            add_tlb_FIFO(pid, page, frame);
        }
        else if (strcmp(reemplazo_TLB, "LRU") == 0)
        {
            add_tlb_LRU(pid, page, frame);
        }
        else
        {
            return;
        }
    }
    else
    {
        t_tlb_entry *entry_to_add = malloc(sizeof(t_tlb_entry));
        entry_to_add->pid = pid;
        entry_to_add->page_number = page;
        entry_to_add->frame_number = frame;
        entry_to_add->timestamp = temporal_create();
        list_add(tlb, entry_to_add);
    }
}

void clean_tlb(int pid)
{
    for (int i = 0; i < list_size(tlb); i++)
    {
        t_tlb_entry *to_clean = list_get(tlb, i);
        if (to_clean->pid == pid)
        {
            list_remove_and_destroy_element(tlb, i, free);
        }
    }
}

//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------CACHE------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------

t_cache_entry *search_cache(int PID, int page)
{

    t_cache_entry *data;

    for (int i = 0; i < list_size(cache); i++)
    {

        data = list_get(cache, i);

        if (data->page_number == page && data->pid == PID)
        {
            data->referenced = true;
            log_info(loggerCPU, "PID: %d - CACHE HIT - Página: %d \n", PID, data->page_number);
            return data;
        }
    }

    log_info(loggerCPU, "PID: %d - CACHE MISS - Página: %d\n", PID, page);

    t_cache_entry *new_entry = malloc(sizeof(t_cache_entry));
    new_entry->pid = PID;
    new_entry->page_number = page;
    new_entry->frame_number = -1;
    new_entry->referenced = false;
    new_entry->modified = false;
    new_entry->content = NULL;
    return new_entry;
}

void clean_cache_with_pid(int pid)
{

    for (int i = 0; i < list_size(cache); i++)
    {

        t_cache_entry *to_add = list_get(cache, i);

        if (to_add->pid == pid)
        {
            if (to_add->modified == 1)
            {
                u_int32_t to_write = (to_add->frame_number * PAGE_TAM);
                write_full_page_memory(to_write, to_add->content, pid);
            }
            list_remove_and_destroy_element(cache, i, free);
        }
        else
            i++;
    }
}

int calculate_level_entry(int page_number, int level)
{
    int divisor = (int)pow(ENTRIES_CANT, (PAGE_LEVELS - level - 1));
    return (page_number / divisor) % ENTRIES_CANT;
}

char *read_memory(u_int32_t address, int tam, int PID)
{

    t_package *package = create_package(PACKAGE, READ_MEMORY);

    t_buffer_ADDRESS_SIZE_TO_MEMORY *buffer = malloc(sizeof(t_buffer_ADDRESS_SIZE_TO_MEMORY));

    buffer->pid = PID;
    buffer->address = address;
    buffer->size = tam;

    int size_buffer;
    package->buffer = serialize_buffer_ADDRESS_SIZE_TO_MEMORY(buffer, &size_buffer);
    package->buffer_size = size_buffer;

    send_package(package, memory_cpu_socket);

    free(buffer);

    t_package *package_result = receive_package_CPU(memory_cpu_socket);

    t_buffer_CONTENT_SIZE_TO_CPU *buffer_response = malloc(sizeof(t_buffer_CONTENT_SIZE_TO_CPU));

    buffer_response = deserialize_buffer_CONTENT_SIZE_TO_CPU(package_result->buffer);

    log_info(loggerCPU, " PID: %d - Acción: LEER - Dirección Física: %u - Valor: %s\n", PID, address, buffer_response->content);

    return buffer_response->content;
}

int write_memory(u_int32_t address, char *value, int pid)
{

    t_package *package = create_package(PACKAGE, WRITE_MEMORY);

    t_buffer_CONTENT_SIZE_TO_CPU *buffer = malloc(sizeof(t_buffer_CONTENT_SIZE_TO_CPU));

    buffer->pid = pid;
    buffer->size = address;
    buffer->content = value;

    if (buffer->content == NULL)
        return 0;

    int size_buffer;
    package->buffer = serialize_buffer_CONTENT_SIZE_TO_CPU(buffer, &size_buffer);
    package->buffer_size = size_buffer;

    send_package(package, memory_cpu_socket);

    free(buffer);

    int response;

    recv(memory_cpu_socket, &response, sizeof(int), MSG_WAITALL);

    if (response == 1)
        return 0;
    else
        return -1;
}

int write_full_page_memory(u_int32_t address, char *value, int pid)
{

    t_package *package = create_package(PACKAGE, WRITE_FULL_PAGE);

    t_buffer_CONTENT_SIZE_TO_CPU *buffer = malloc(sizeof(t_buffer_CONTENT_SIZE_TO_CPU));

    buffer->pid = pid;
    buffer->size = address;
    buffer->content = value;

    if (buffer->content == NULL)
        return 0;

    int size_buffer;
    package->buffer = serialize_buffer_CONTENT_SIZE_TO_CPU(buffer, &size_buffer);
    package->buffer_size = size_buffer;

    send_package(package, memory_cpu_socket);

    free(buffer);

    int response;

    recv(memory_cpu_socket, &response, sizeof(int), MSG_WAITALL);

    if (response == 1)
        return 0;
    else
        return -1;
}

void add_to_cache(t_cache_entry *entry, int whereToWrite, bool wasWritten)
{

    for (int i = 0; i < list_size(cache); i++)
    {
        t_cache_entry *to_actualize = list_get(cache, i);
        if (to_actualize->pid == entry->pid && to_actualize->page_number == entry->page_number)
        {
            memcpy(to_actualize->content + whereToWrite, entry->content, strlen(entry->content));
            to_actualize->referenced = 1;
            to_actualize->modified = wasWritten;
            return;
        }
    }

    t_cache_entry *to_add = malloc(sizeof(t_cache_entry));
    to_add->content = malloc(PAGE_TAM);
    to_add->pid = entry->pid;
    to_add->page_number = entry->page_number;
    to_add->frame_number = entry->frame_number;
    memset(to_add->content, 0, PAGE_TAM);
    memcpy(to_add->content, entry->content, PAGE_TAM);
    to_add->referenced = 1;
    to_add->modified = wasWritten;

    if (list_size(cache) > atoi(entradas_cache))
    {
        log_error(loggerCPU, "La cantidad de entradas cache supero la cantidad maxima");
        return;
    }

    if (list_size(cache) < atoi(entradas_cache))
    {
        list_add(cache, to_add);
        log_info(loggerCPU, "PID: %d - Cache Add - Pagina: %d\n", to_add->pid, entry->page_number);
    }

    else
    {

        if (strcmp(reemplazo_cache, "CLOCK") == 0)
        {
            replace_with_clock(to_add);
        }
        else
        {
            replace_with_clock_m(to_add);
        }
    }
    return;
}

void replace_with_clock(t_cache_entry *to_add)
{

    while (1)
    {
        t_cache_entry *candidate = list_get(cache, clock_to_cache);
        if (candidate->referenced == 0)
        {
            if (candidate->modified == 1)
            {
                u_int32_t physical_address = candidate->frame_number * PAGE_TAM;
                int result = write_full_page_memory(physical_address, candidate->content, candidate->pid);
                if (result != 0)
                {
                    log_error(loggerCPU, "Error al escribir en memoria para PID: %d - Página: %d\n", candidate->pid, candidate->page_number);
                }
            }
            log_info(loggerCPU, "PID: <%d> - Memory Update - Página: <%d> - Frame: <%d>", candidate->pid, candidate->page_number, candidate->frame_number);
            log_info(loggerCPU, "PID: %d - Cache Add - Pagina: %d\n", to_add->pid, to_add->page_number);
            list_replace_and_destroy_element(cache, clock_to_cache, to_add, free);
            clock_to_cache = (clock_to_cache + 1) % atoi(entradas_cache);
            return;
        }
        candidate->referenced = false;
        clock_to_cache = (clock_to_cache + 1) % atoi(entradas_cache);
    }
    return;
}

void replace_with_clock_m(t_cache_entry *to_add)
{
    while (1)
    {
        for (int i = 0; i < list_size(cache); i++)
        {
            t_cache_entry *candidate = list_get(cache, clock_to_cache);
            if (candidate->referenced == 0)
            {
                if (candidate->modified == 0)
                {
                    // u_int32_t physical_address = candidate->frame_number * PAGE_TAM;
                    // int result = write_full_page_memory(physical_address, candidate->content, candidate->pid);
                    // if (result != 0)
                    // {
                    //     log_error(loggerCPU, "Error al escribir en memoria para PID: %d - Página: %d\n", candidate->pid, candidate->page_number);
                    // }
                    log_info(loggerCPU, "PID: <%d> - Memory Update - Página: <%d> - Frame: <%d>", candidate->pid, candidate->page_number, candidate->frame_number);
                    log_info(loggerCPU, "PID: %d - Cache Add - Pagina: %d\n", to_add->pid, to_add->page_number);
                    list_replace_and_destroy_element(cache, clock_to_cache, to_add, free);
                    clock_to_cache = (clock_to_cache + 1) % atoi(entradas_cache);
                    return;
                }
            }
            clock_to_cache = (clock_to_cache + 1) % atoi(entradas_cache);
        }
        for (int i = 0; i < list_size(cache); i++)
        {
            t_cache_entry *candidate = list_get(cache, clock_to_cache);

            if (candidate->referenced == 0)
            {
                if (candidate->modified == 1)
                {

                    u_int32_t physical_address = candidate->frame_number * PAGE_TAM;
                    int result = write_full_page_memory(physical_address, candidate->content, candidate->pid);
                    if (result != 0)
                    {
                        log_error(loggerCPU, "Error al escribir en memoria para PID: %d - Página: %d\n", candidate->pid, candidate->page_number);
                    }
                    log_info(loggerCPU, "PID: <%d> - Memory Update - Página: <%d> - Frame: <%d>", candidate->pid, candidate->page_number, candidate->frame_number);
                    log_info(loggerCPU, "PID: %d - Cache Add - Pagina: %d\n", to_add->pid, to_add->page_number);
                    list_replace_and_destroy_element(cache, clock_to_cache, to_add, free);
                    clock_to_cache = (clock_to_cache + 1) % atoi(entradas_cache);
                    return;
                }
            }
            candidate->referenced = 0;
            clock_to_cache = (clock_to_cache + 1) % atoi(entradas_cache);
        }
    }
    return;
}

t_translate_result translate_logical_to_physical_address_to_read(t_logical_address *logical_addr, cpu_context_t *context, int size)
{

    t_translate_result result;
    result.hit_cache = false;
    result.cache_entry = NULL;

    t_cache_entry *entry;
    t_tlb_entry *tlb_entry = malloc(sizeof(t_tlb_entry));
    int frame_number = 0;

    logical_addr->page_number = floor(logical_addr->value / PAGE_TAM);
    logical_addr->offset = (logical_addr->value % PAGE_TAM);
    logical_addr->level_entries = malloc(sizeof(int) * ENTRIES_CANT);

    for (int i = 0; i < ENTRIES_CANT; i++)
    {
        logical_addr->level_entries[i] = (int)(logical_addr->page_number / pow(ENTRIES_CANT, PAGE_LEVELS - i - 1)) % ENTRIES_CANT;
    }

    if (atoi(entradas_cache) >= 1)
    {

        entry = search_cache(context->pid, logical_addr->page_number);

        if (entry->frame_number == -1)
        {

            if (atoi(entradas_TLB) >= 1)
            {
                entry->frame_number = search_tlb(context->pid, logical_addr->page_number);
            }

            if (entry->frame_number == -1)
            {

                log_info(loggerCPU, "PID: %d - OBTENER MARCO - Página: %d\n", context->pid, logical_addr->page_number);
                entry->frame_number = search_in_page_table(context->pid, logical_addr);

                if (entry->frame_number == -1)
                {
                    log_error(loggerCPU, "La pagina no existe en memoria\n");
                    return;
                }

                if (atoi(entradas_TLB) >= 1)
                {
                    add_to_tlb(context->pid, logical_addr->page_number, entry->frame_number);
                    result.physical_address = entry->frame_number * PAGE_TAM + logical_addr->offset;
                    return result;
                }
            }
            entry->pid = context->pid;
            entry->page_number = logical_addr->page_number;
            result.physical_address = entry->frame_number * PAGE_TAM + logical_addr->offset;
            entry->content = request_full_page((result.physical_address - logical_addr->offset), context->pid);
            add_to_cache(entry, 0, false);
            return result;
        }
        usleep(atoi(retardo_cache) * 1000);
        result.cache_entry = entry;
        result.hit_cache = true;
        result.physical_address = entry->frame_number * PAGE_TAM + logical_addr->offset;
        return result;
    }
    else
    {
        if (atoi(entradas_TLB) >= 1)
        {

            tlb_entry->frame_number = search_tlb(context->pid, logical_addr->page_number);

            if (tlb_entry->frame_number == -1)
            {

                log_info(loggerCPU, "PID: %d - OBTENER MARCO - Página: %d\n", context->pid, logical_addr->page_number);
                tlb_entry->frame_number = search_in_page_table(context->pid, logical_addr);

                if (tlb_entry->frame_number == -1)
                {
                    log_error(loggerCPU, "La pagina no existe en memoria\n");
                }

                add_to_tlb(context->pid, logical_addr->page_number, tlb_entry->frame_number);
                result.physical_address = tlb_entry->frame_number * PAGE_TAM + logical_addr->offset;
                return result;
            }
            result.physical_address = tlb_entry->frame_number * PAGE_TAM + logical_addr->offset;
            return result;
        }
        else
        {
            log_info(loggerCPU, "PID: %d - OBTENER MARCO - Página: %d\n", context->pid, logical_addr->page_number);
            frame_number = search_in_page_table(context->pid, logical_addr);

            if (frame_number == -1)
            {
                log_error(loggerCPU, "La pagina no existe en memoria\n");
            }
            result.physical_address = frame_number * PAGE_TAM + logical_addr->offset;
            return result;
        }
    }
}

t_translate_result translate_logical_to_physical_address_to_write(t_logical_address *logical_addr, cpu_context_t *context, char *to_write)
{

    t_translate_result result;
    result.hit_cache = false;
    result.cache_entry = NULL;

    t_cache_entry *entry;
    t_tlb_entry *tlb_entry = malloc(sizeof(t_tlb_entry));
    int frame_number = 0;

    logical_addr->page_number = floor(logical_addr->value / PAGE_TAM);
    logical_addr->offset = (logical_addr->value % PAGE_TAM);
    logical_addr->level_entries = malloc(sizeof(int) * ENTRIES_CANT);

    for (int i = 0; i < ENTRIES_CANT; i++)
    {
        logical_addr->level_entries[i] = (int)(logical_addr->page_number / pow(ENTRIES_CANT, PAGE_LEVELS - i - 1)) % ENTRIES_CANT;
    }

    if (atoi(entradas_cache) >= 1)
    {

        entry = search_cache(context->pid, logical_addr->page_number);

        if (entry->frame_number == -1)
        {

            if (atoi(entradas_TLB) >= 1)
            {
                entry->frame_number = search_tlb(context->pid, logical_addr->page_number);
            }

            if (entry->frame_number == -1)
            {

                log_info(loggerCPU, "PID: %d - OBTENER MARCO - Página: %d\n", context->pid, logical_addr->page_number);
                entry->frame_number = search_in_page_table(context->pid, logical_addr);

                if (entry->frame_number == -1)
                {
                    log_error(loggerCPU, "La pagina no existe en memoria\n");
                }

                if (atoi(entradas_TLB) >= 1)
                {
                    entry->timestamp = temporal_create();
                    add_to_tlb(context->pid, logical_addr->page_number, entry->frame_number);
                    result.physical_address = entry->frame_number * PAGE_TAM + logical_addr->offset;
                    return result;
                }
            }
            entry->pid = context->pid;
            entry->page_number = logical_addr->page_number;
            result.physical_address = entry->frame_number * PAGE_TAM + logical_addr->offset;
            entry->content = request_full_page((result.physical_address - logical_addr->offset), context->pid);
            add_to_cache(entry, logical_addr->offset, 0);
            return result;
        }
        usleep(atoi(retardo_cache) * 1000);
        result.cache_entry = entry;
        result.hit_cache = true;
        return result;
    }
    else
    {
        if (atoi(entradas_TLB) >= 1)
        {

            tlb_entry->frame_number = search_tlb(context->pid, logical_addr->page_number);

            if (tlb_entry->frame_number == -1)
            {

                log_info(loggerCPU, "PID: %d - OBTENER MARCO - Página: %d\n", context->pid, logical_addr->page_number);
                tlb_entry->frame_number = search_in_page_table(context->pid, logical_addr);

                if (tlb_entry->frame_number == -1)
                {
                    log_error(loggerCPU, "La pagina no existe en memoria\n");
                }
                add_to_tlb(context->pid, logical_addr->page_number, tlb_entry->frame_number);
                result.physical_address = tlb_entry->frame_number * PAGE_TAM + logical_addr->offset;
                return result;
            }
            result.physical_address = tlb_entry->frame_number * PAGE_TAM + logical_addr->offset;
            return result;
        }
        else
        {
            log_info(loggerCPU, "PID: %d - OBTENER MARCO - Página: %d\n", context->pid, logical_addr->page_number);

            frame_number = search_in_page_table(context->pid, logical_addr);

            if (frame_number == -1)
            {
                log_error(loggerCPU, "La pagina no existe en memoria\n");
            }
            result.physical_address = frame_number * PAGE_TAM + logical_addr->offset;
            return result;
        }
    }
}

int search_in_page_table(int pid, t_logical_address *logical_address)
{

    t_package *package = create_package(PACKAGE, REQUEST_FRAME);

    t_buffer_PID_PAGE_ENTRIES *buffer = malloc(sizeof(t_buffer_PID_PAGE_ENTRIES));

    buffer->pid = pid;
    buffer->page_number = logical_address->page_number;
    buffer->entries = malloc(sizeof(int) * ENTRIES_CANT);
    buffer->entries_cant = ENTRIES_CANT;

    for (int i = 0; i < ENTRIES_CANT; i++)
    {

        buffer->entries[i] = logical_address->level_entries[i];
    }

    int size_buffer;
    package->buffer = serialize_buffer_PID_PAGE_ENTRIES(buffer, &size_buffer);
    package->buffer_size = size_buffer;

    send_package(package, memory_cpu_socket);

    int result;

    recv(memory_cpu_socket, &result, sizeof(int), MSG_WAITALL);

    return result;
}

char *request_full_page(u_int32_t *physical_address, int PID)
{

    t_package *package = create_package(PACKAGE, REQUEST_FULL_PAGE);
    t_buffer_ADDRESS_PID_TO_MEMORY *buffer = malloc(sizeof(t_buffer_ADDRESS_PID_TO_MEMORY));

    buffer->pid = PID;
    buffer->address = physical_address;

    int size_buffer;
    package->buffer = serialize_ADDRESS_PID_TO_MEMORY(buffer, &size_buffer);
    package->buffer_size = size_buffer;

    send_package(package, memory_cpu_socket);

    t_package *package_with_page = receive_package_CPU(memory_cpu_socket);

    if (package_with_page->op_code == REQUEST_FULL_PAGE)
    {

        t_buffer_PAGE_CONTENT *deserialized_buffer = deserialize_buffer_PAGE_CONTENT(package_with_page->buffer);

        return deserialized_buffer->page;
    }
    else
    {
        log_error(loggerCPU, "Se recibio un OPCODE incorrecto");
        return -1;
    }
}
