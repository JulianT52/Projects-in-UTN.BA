#include "kernel.h"
#include <utilsMemoria/globalMemoria.h>

void read_init_package_kernel(t_buffer_PID_SIZE_to_MEMORY *data, int socket)
{

  t_config *config = config_create("memoria.config");
  read_configs_memory(config);

  int pid = data->PID;
  int size = data->size;
  // char *path_file = data->path_file;

  char path_file[256];
  snprintf(path_file, sizeof(path_file), "%s%s", path_instrucciones, data->path_file);

  int total_pages = (size + atoi(tam_pagina) - 1) / atoi(tam_pagina);
  int remaing_pages = total_pages;
  int free_frames = count_free_frames();
  if (free_frames < total_pages)
  {
    // log_error(loggerMemoria, "No hay espacio para el proceso");
    send(socket, "FAIL", strlen("FAIL") + 1, 0);
    return;
  }

  log_debug(loggerMemoria, "OK - Proceso Puede Iniciar");
  t_process *process = malloc(sizeof(t_process));
  process->pid = pid;
  process->size = size;
  process->instructions = read_path(path_file, &process->cant_instructions);
  process->metrics = calloc(1, sizeof(t_metrics));
  process->metrics->cant_upload_memory++;
  process->page_table = create_page_table(0, &remaing_pages);
  list_add(memory->process, process);
  memory->cant_process++;
  log_info(loggerMemoria, "## PID: <%d> - Proceso Creado - Tamaño: <%d>", process->pid, process->size);
  send(socket, "OK", strlen("OK") + 1, 0);
}

void *handle_package_kernel(void *arg)
{

  int socket = *((int *)arg);
  t_package *package = receive_package(socket);

  log_debug(loggerMemoria, "recibo de kernel");

  if (package == NULL)
  {
    log_error(loggerMemoria, "Error al recibir el paquete. Saliendo del hilo.");
    close(socket);
    return NULL;
  }

  switch (package->op_code)
  {

  case INIT_PROCESS:
    usleep(atoi(retardo_memoria) * 1000);
    t_buffer_PID_SIZE_to_MEMORY *data_init = deserialize_buffer_PID_SIZE_to_MEMORY(package->buffer);
    read_init_package_kernel(data_init, socket);

    int n = count_free_frames() * atoi(tam_pagina);

    log_debug(loggerMemoria, "Memoria libre iniciar: %d bytes", n);

    free(package);
    free(data_init);
    close(socket);

    break;

  case FINALIZE_PROCESS:
    usleep(atoi(retardo_memoria) * 1000);
    t_buffer_PID_to_MEMORY_FINALIZE_PROC *data_final = deserialize_buffer_PID_to_MEMORY_FINALIZE_PROC(package->buffer);
    int pid_final = data_final->PID;
    finalize_process(pid_final);

    int response_final = 1;
    send(socket, &response_final, sizeof(int), 0);

    int nf = count_free_frames() * atoi(tam_pagina);

    log_debug(loggerMemoria, "Memoria libre finalizar: %d bytes", nf);

    close(socket);

    break;

  case DUMP_MEMORY:
    usleep(atoi(retardo_memoria) * 1000);
    t_buffer_PID_to_MEMORY_DUMP_MEMORY *data_dump = deserialize_buffer_PID_to_MEMORY_DUMP_MEMORY(package->buffer);
    t_process *process_to_dump = process_id_search(data_dump->PID);

    if (process_to_dump == NULL)
    {
      log_error(loggerMemoria, "No se encontró el proceso %d", data_dump->PID);
      break;
    }

    char *dump_dir = strdup(dump_path);
    char name_file[100];
    char *timestamp = temporal_get_string_time("%H:%M:%S:%MS");
    sprintf(name_file, "%s/<%d>-<%s>.dmp", dump_dir,data_dump->PID, timestamp);
    free(timestamp);

    int size_dump = process_to_dump->size;
    int total_pages = (size_dump + atoi(tam_pagina) - 1) / atoi(tam_pagina);
    int *writed_pages = 0;

    FILE *dump_file = fopen(name_file, "wb");
    if (dump_file == NULL)
    {
      log_error(loggerMemoria, "Error al abrir archivo para dump");
      break;
    }

    ftruncate(dump_file, size_dump);

    write_pages_in_dump(process_to_dump->page_table, dump_file, total_pages, &writed_pages);

    int response = 1;
    send(socket, &response, sizeof(int), 0);

    log_info(loggerMemoria, "## PID: <%d> - Memory Dump solicitado: %s", data_dump->PID, name_file);

    fclose(dump_file);

    close(socket);
    break;

  case SUSPEND_PROCESS:
    usleep(atoi(retardo_swap) * 1000);
    t_buffer_PID_to_MEMORY_FINALIZE_PROC *data_swap = deserialize_buffer_PID_to_MEMORY_FINALIZE_PROC(package->buffer);
    int pid_swap = data_swap->PID;
    suspend_process(pid_swap);

    int nsus = count_free_frames() * atoi(tam_pagina);

    log_debug(loggerMemoria, "Memoria libre suspender: %d bytes", nsus);

    close(socket);
    break;

  case RESUME_PROCESS:
    usleep(atoi(retardo_swap) * 1000);
    t_buffer_PID_to_MEMORY_FINALIZE_PROC *data_resume = deserialize_buffer_PID_to_MEMORY_FINALIZE_PROC(package->buffer);
    int pid_resume = data_resume->PID;

    // Verificar si hay espacio suficiente antes de reanudar
    t_swap_process *swap_proc = find_suspended_process(pid_resume);
    int response_t = 0;

    if (swap_proc != NULL)
    {
      int pages_in_swap = list_size(swap_proc->pages);
      int frames_free = count_free_frames();

      if (frames_free >= pages_in_swap)
      {
        resume_process(pid_resume);
        response_t = 1; // Éxito
        log_info(loggerMemoria, "## PID: <%d> - Proceso reanudado exitosamente", pid_resume);
      }
      else
      {
        log_debug(loggerMemoria, "No hay espacio suficiente para reanudar proceso %d (necesita %d frames, hay %d libres)",
                  pid_resume, pages_in_swap, frames_free);
        response_t = 0; // Fallo - no hay espacio
      }
    }
    else
    {
      log_debug(loggerMemoria, "Proceso %d no encontrado en swap", pid_resume);
      response_t = 0; // Fallo - proceso no encontrado
    }

    send(socket, &response_t, sizeof(int), 0);
    close(socket);
    break;
  }
  return NULL;
}

char *jump_line(char *line)
{
  char *pos = strchr(line, '\n');
  if (pos)
    *pos = '\0';
  return line;
}

char **read_path(const char *path_file, int *num_lines)
{
  FILE *f = fopen(path_file, "r");
  if (!f)
  {
    log_error(loggerMemoria, "Error al abrir el archivo: %s", path_file);
    *num_lines = 0;
    return NULL;
  }
  char **lines = NULL;
  char line[256];
  int cont = 0;

  while (fgets(line, sizeof(line), f))
  {
    jump_line(line);
    lines = realloc(lines, sizeof(char *) * (cont + 1));

    lines[cont] = malloc(strlen(line) + 1);
    strcpy(lines[cont], line);
    cont++;
  }

  fclose(f);
  *num_lines = cont;
  return lines;
}

void write_pages_in_dump(t_page_table *table, FILE *file, int pages_to_write, int *writed_pages)
{

  *writed_pages = 0;
  for (int i = 0; i < list_size(table->entries); i++)
  {

    if (*writed_pages >= pages_to_write)
      return;

    t_page_entry *entry = list_get(table->entries, i);

    if (entry->is_final_level == 1)
    {

      if (entry != NULL)
      {
        t_page *page = (t_page *)entry->next_level;
        int frame_number = page->frame_assigned;
        int frame_address = frame_number * atoi(tam_pagina);

        void *frame_content = malloc(atoi(tam_pagina));

        pthread_mutex_lock(&mutex_write_read_memory);
        memcpy(frame_content, memory->space_memory + frame_address, atoi(tam_pagina));
        pthread_mutex_unlock(&mutex_write_read_memory);

        fwrite(frame_content, 1, atoi(tam_pagina), file);

        frame_content = NULL;
        free(frame_content);
        (*writed_pages)++;
      }
      else
      {
        char *zeros = calloc(1, atoi(tam_pagina));
        fwrite(zeros, 1, atoi(tam_pagina), file);
        free(zeros);
        (*writed_pages)++;
      }
    }
    else
    {

      if (entry == NULL)
      {
        t_page_table *next_table = (t_page_table *)entry->next_level;
        write_pages_in_dump(next_table, file, pages_to_write, writed_pages);
      }
    }
  }
}

t_page_table *create_page_table(int level, int *remaining_pages)
{
  t_page_table *table = malloc(sizeof(t_page_table));
  table->level = level;
  table->entries = list_create();

  for (int i = 0; i < atoi(entradas_por_tabla); i++)
  {
    if (*remaining_pages <= 0 && level + 1 == atoi(cantidad_niveles))
      break;

    t_page_entry *entry = malloc(sizeof(t_page_entry));
    entry->entry = i;

    if (level + 1 == atoi(cantidad_niveles))
    {
      entry->is_final_level = true;

      int frame = search_for_free_frame();
      if (frame == -1)
      {
        log_error(loggerMemoria, "No hay marcos libres para asignar a la pagina");
        free(entry);
        break;
      }
      t_page *page = malloc(sizeof(t_page));
      page->page_number = i;
      page->frame_assigned = frame;
      entry->next_level = (void *)page;
      (*remaining_pages)--;
    }
    else
    {
      entry->is_final_level = false;
      entry->next_level = (void *)create_page_table(level + 1, remaining_pages);
    }
    list_add(table->entries, entry);
  }
  return table;
}

// finalize process funcion para finalizar el proceso y liberar recursos
void finalize_process(int pid)
{
  t_process *process = process_id_search(pid);
  if (process == NULL)
  {
    log_error(loggerMemoria, "Error: Proceso con PID %d no encontrado", pid);
    send(kernel_socket, "FAIL", strlen("FAIL") + 1, 0);
    return;
  }
  // Liberar las instrucciones del proceso
  for (int i = 0; i < process->cant_instructions; i++)
  {
    free(process->instructions[i]);
  }
  free(process->instructions);

  // FUNCION PARA LIBERAR TABLA DE PAGINAS
  free_page_table(process->page_table);

  for (int i = 0; i < list_size(memory->process); i++)
  {
    t_process *p = list_get(memory->process, i);
    if (p->pid == process->pid)
    {
      list_remove(memory->process, i);
      memory->cant_process--;
      break;
    }
  }
  log_info(loggerMemoria, "## PID: %d - Proceso Destruido - Métricas - Acc.T.Pag: %d; Inst.Sol.: %d; SWAP: %d; Mem.Prin.: %d; Lec.Mem.:%d; Esc.Mem.:%d\n",
           process->pid,
           process->metrics->cant_access_page_table,
           process->metrics->cant_request_instruction,
           process->metrics->cant_drop_swap,
           process->metrics->cant_upload_memory,
           process->metrics->cant_read_memory,
           process->metrics->cant_write_memory);

  free(process->metrics);
  free(process);
  int result = 1;
  send(kernel_socket, &result, sizeof(int), 0);
  return;
}

void free_page_table(t_page_table *table)
{
  for (int i = 0; i < list_size(table->entries); i++)
  {
    t_page_entry *entry = list_get(table->entries, i);

    if (entry->is_final_level)
    {
      t_page *page = (t_page *)entry->next_level;
      bitarray_clean_bit(memory->frames, page->frame_assigned);
      free(page);
    }
    else
    {
      t_page_table *next_table = (t_page_table *)entry->next_level;
      free_page_table(next_table);
    }
    free(entry);
  }
  list_destroy(table->entries);
  free(table);
}

int count_free_frames()
{
  int frames = 0;
  for (int i = 0; i < memory->cant_frames; i++)
  {
    if (!bitarray_test_bit(memory->frames, i))
    {
      frames++;
    }
  }
  return frames;
}

int search_for_free_frame()
{
  for (int i = 0; i < memory->cant_frames; i++)
  {
    if (!bitarray_test_bit(memory->frames, i))
    {
      bitarray_set_bit(memory->frames, i);
      return i;
    }
  }
  return -1;
}

t_swap_process *find_suspended_process(int pid)
{
  for (int i = 0; i < list_size(swap->page_in_swap); i++)
  {
    t_swap_process *swap_proc = list_get(swap->page_in_swap, i);
    if (swap_proc->pid == pid)
      return swap_proc;
  }
  return NULL;
}

void resume_process(int pid)
{

  t_swap_process *swap_proc = find_suspended_process(pid);

  if (swap_proc == NULL)
  {
    return;
  }
  int pages_in_swap = list_size(swap_proc->pages);
  int frames_free = count_free_frames();
  if (frames_free < pages_in_swap)
  {
    return;
  }

  t_process *process_resume = process_id_search(pid);

  FILE *swapfile = fopen(path_swapfile, "rb+");

  int pages_read = 0;
  restore_pages_swap(process_resume->page_table, swap_proc, swapfile, &pages_read);

  process_resume->metrics->cant_upload_memory++;

  fclose(swapfile);

  FILE *zero_file = fopen(path_swapfile, "wb");
  if (zero_file != NULL)
  {
    FILE *temp_file = fopen(path_swapfile, "rb");
    if (temp_file != NULL)
    {
      fseek(temp_file, 0, SEEK_END);
      long file_size = ftell(temp_file);
      fclose(temp_file);

      char *zeros = calloc(file_size, 1);
      fwrite(zeros, 1, file_size, zero_file);
      free(zeros);
    }
    fclose(zero_file);
  }

  for (int i = 0; i < list_size(swap->page_in_swap); i++)
  {
    t_swap_process *process = list_get(swap->page_in_swap, i);
    if (process->pid == pid)
    {
      list_remove(swap->page_in_swap, i);

      for (int j = 0; j < list_size(process->pages); j++)
      {
        t_swap_page *page = list_get(process->pages, j);
        free(page);
      }
      list_destroy(process->pages);
      free(process);
      break;
    }
  }
}

void suspend_process(int pid)
{
  t_process *process_suspend = process_id_search(pid);
  if (!process_suspend)
  {
    send(kernel_socket, "FAIL", strlen("FAIL") + 1, 0);
    return;
  }

  FILE *swapfile = fopen(path_swapfile, "ab+"); // wb ab+?

  int pages_swap = 0;
  write_page_swap(process_suspend->page_table, pid, swapfile, &pages_swap);

  t_swap_process *swap_proc = malloc(sizeof(t_swap_process));
  swap_proc->pid = pid;
  swap_proc->pages = list_create();
  for (int i = 0; i < pages_swap; i++)
  {
    t_swap_page *swap_page = malloc(sizeof(t_swap_page));
    swap_page->page = i;
    swap_page->pos_page = i * atoi(tam_pagina);
    list_add(swap_proc->pages, swap_page);
  }

  list_add(swap->page_in_swap, swap_proc);

  process_suspend->metrics->cant_drop_swap++;

  fclose(swapfile);
}

void write_page_swap(t_page_table *table, int pid, FILE *swapfile, int *pages_swap)
{
  for (int i = 0; i < list_size(table->entries); i++)
  {
    t_page_entry *entry = list_get(table->entries, i);

    if (entry->is_final_level)
    {
      t_page *page = (t_page *)entry->next_level;
      int frame_number = page->frame_assigned;
      int frame_address = frame_number * atoi(tam_pagina);

      void *frame_content = malloc(atoi(tam_pagina));
      pthread_mutex_lock(&mutex_write_read_memory);
      memcpy(frame_content, memory->space_memory + frame_address, atoi(tam_pagina));
      pthread_mutex_unlock(&mutex_write_read_memory);

      fseek(swapfile, (*pages_swap) * atoi(tam_pagina), SEEK_SET);
      fwrite(frame_content, 1, atoi(tam_pagina), swapfile);

      bitarray_clean_bit(memory->frames, frame_number);
      free(frame_content);
      (*pages_swap)++;
    }
    else
    {
      write_page_swap((t_page_table *)entry->next_level, pid, swapfile, pages_swap);
    }
  }
}

void restore_pages_swap(t_page_table *table, t_swap_process *swap_proc, FILE *swapfile, int *pages_read)
{
  for (int i = 0; i < list_size(table->entries); i++)
  {
    t_page_entry *entry = list_get(table->entries, i);

    if (entry->is_final_level)
    {
      if (*pages_read >= list_size(swap_proc->pages))
        return;
      // Si ya se leyeron todas las paginas del swap, no hay nada mas que hacer

      t_page *page = (t_page *)entry->next_level;
      t_swap_page *swpage = list_get(swap_proc->pages, *pages_read);

      int frame_number = page->frame_assigned;
      int frame_address = frame_number * atoi(tam_pagina);

      void *frame_content = malloc(atoi(tam_pagina));
      fseek(swapfile, swpage->pos_page, SEEK_SET);
      fread(frame_content, 1, atoi(tam_pagina), swapfile);

      pthread_mutex_lock(&mutex_write_read_memory);
      memcpy(memory->space_memory + frame_address, frame_content, atoi(tam_pagina));
      pthread_mutex_unlock(&mutex_write_read_memory);

      bitarray_set_bit(memory->frames, frame_number);
      (*pages_read)++;
      free(frame_content);
    }
    else
    {
      restore_pages_swap((t_page_table *)entry->next_level, swap_proc, swapfile, pages_read);
    }
  }
}
