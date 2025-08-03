#include "io.h"
#include "global.h"
#include <utils/structsKernel.h>
#include <utilsKernel/planificacion.h>

pthread_t wait_end_of_io_thread;

t_list *devices_list;
t_list *blocked_by_io_list;

void start_lists()
{
    devices_list = list_create();
    blocked_process_list = list_create();
    blocked_by_io_list = list_create();
}

void *init_listen_io(int server_socket)
{
    while (1)
    {
        int client_socket;
        client_socket = accept(server_socket, NULL, NULL);
        ID handshake;

        recv(client_socket, &handshake, sizeof(uint32_t), MSG_WAITALL);

        if (handshake != HANDSHAKE_IO)
        {
            log_error(loggerKernel, "Handshake incorrecto: %d", handshake);
            close(kernel_io_socket);
            continue;
        }

        t_package *package = receive_package_with_interrupt_reason(client_socket);
        t_buffer_DEVICE_TIME_kernel *buffer = deserialize_buffer_DEVICE_TIME_kernel(package->buffer);

        log_debug(loggerKernel, "Se conectó el dispositivo IO: %s con socket: %d", buffer->io_name, client_socket);

        manage_io_connection(client_socket, buffer->io_name);
        free(buffer->io_name);
        free(buffer);
        free(package->buffer);
        free(package);
    }
}

void manage_io_connection(int io_socket, char *io_name)
{

    t_io_devices *io_device = malloc(sizeof(t_io_devices));
    io_device->io_name = strdup(io_name);
    io_device->io_socket = io_socket;
    // io_device->blocked_process = list_create();
    io_device->free = 1;

    pthread_mutex_lock(&mutex_io);
    list_add(devices_list, io_device);
    pthread_mutex_unlock(&mutex_io);

    pthread_t io_thread;
    pthread_create(&wait_end_of_io_thread, NULL, wait_end_of_io, io_device);
    pthread_detach(wait_end_of_io_thread);
}

void *wait_end_of_io(t_io_devices *io_device)
{
    while (1)
    {
        pthread_mutex_lock(&io_blocked_mutex);
        log_debug(loggerKernel, "voy a entrar al if tam: %d", list_size(blocked_process_list));
        if ((list_size(blocked_process_list) > 0) && (io_device->free == 1))
        {
            log_debug(loggerKernel, "entre al if:");
            t_io_blocked *blocked_process = list_remove(blocked_process_list, 0);
            io_device->free == 0;
            pthread_mutex_unlock(&io_blocked_mutex);

            pthread_mutex_lock(&mutex_block_list);
            t_PCB *pcb = search_pcb_from_pid(block_list, blocked_process->pid);
            pthread_mutex_unlock(&mutex_block_list);

            if (pcb == NULL)
            {
                pthread_mutex_lock(&mutex_susp_block_list);
                pcb = search_pcb_from_pid(susp_block_list, blocked_process->pid);
                pthread_mutex_unlock(&mutex_susp_block_list);
            }

            if (pcb != NULL)
            {
                t_package *package_io = create_package(PACKAGE, SYSCALL_IO);
                t_buffer_IO_NAME_TIME_MS_SYSCALL_IO *buffer_to_send = malloc(sizeof(t_buffer_IO_NAME_TIME_MS_SYSCALL_IO));

                buffer_to_send->pid = pcb->PID;
                buffer_to_send->pc = pcb->PC;
                buffer_to_send->time_ms = blocked_process->time;
                buffer_to_send->io_name = strdup(io_device->io_name);

                int size_buffer_io;
                package_io->buffer = serialize_buffer_IO_NAME_TIME_MS_SYSCALL_IO(buffer_to_send, &size_buffer_io);
                package_io->buffer_size = size_buffer_io;

                send_package(package_io, io_device->io_socket);

                pthread_mutex_lock(&mutex_blocked_by_io_list);
                list_add(blocked_by_io_list, blocked_process);
                pthread_mutex_unlock(&mutex_blocked_by_io_list);
            }
            // free(blocked_process);
        }
        pthread_mutex_unlock(&io_blocked_mutex);
        // else
        // {
        //     io_device->free = 1;
        //     pthread_mutex_unlock(&io_blocked_mutex);
        // }

        log_debug(loggerKernel, "esperando el paquete");
        t_package *package = receive_package_with_interrupt_reason(io_device->io_socket);

        // log_debug(loggerKernel, "tam de la lista de blocked_by_io_list %d", list_size(blocked_by_io_list));

        if (package == NULL || package->op_code != IO_COMPLETED)
        {
            log_debug(loggerKernel, "IO %s con socket %d se deconecto", io_device->io_name, io_device->io_socket);
            end_process_io_disc(io_device);
            return NULL;
        }

        t_buffer_PID_to_kernel_io *buffer = deserialize_buffer_PID_to_kernel_io(package->buffer);

        if (package->op_code == IO_COMPLETED)
        {
            pthread_mutex_lock(&mutex_blocked_by_io_list);
            if (list_size(blocked_by_io_list) > 0)
            {
                t_io_blocked *blocked_process = list_remove(blocked_by_io_list, 0);
            }
            pthread_mutex_unlock(&mutex_blocked_by_io_list);

            pthread_mutex_lock(&mutex_susp_block_list);
            t_PCB *pcb = list_remove_by_pid(susp_block_list, buffer->PID);
            pthread_mutex_unlock(&mutex_susp_block_list);

            if (pcb != NULL)
            {
                sem_post(&sem_new_list);

                pthread_mutex_lock(&mutex_susp_ready_list);
                list_add(susp_ready_list, pcb);
                pthread_mutex_unlock(&mutex_susp_ready_list);

                change_status(pcb, SUSP_READY);

                log_info(loggerKernel, "## (%d) Pasa del estado SUSP_BLOCKED al estado SUSP_READY", pcb->PID);
                log_info(loggerKernel, "## (%d) finalizó IO y pasa a SUSP_READY", pcb->PID);

                sem_post(&sem_susp_ready_list);
                // sem_post(&sem_new_list);
            }
            else
            {
                pthread_mutex_lock(&mutex_block_list);
                t_PCB *pcb = list_remove_by_pid(block_list, buffer->PID);
                pthread_mutex_unlock(&mutex_block_list);

                if (pcb != NULL)
                {
                    pthread_mutex_lock(&mutex_ready_list);
                    list_add(ready_list, pcb);
                    change_status(pcb, READY);
                    pthread_mutex_unlock(&mutex_ready_list);

                    log_info(loggerKernel, "## (%d) Finalizó IO y pasa a READY", pcb->PID);

                    sem_post(&sem_ready_list);
                }
            }

            pthread_mutex_lock(&io_blocked_mutex);
            if (list_size(blocked_process_list) > 0)
            {
                t_io_blocked *blocked_process = list_remove(blocked_process_list, 0);
                pthread_mutex_unlock(&io_blocked_mutex);

                pthread_mutex_lock(&mutex_block_list);
                t_PCB *pcb = search_pcb_from_pid(block_list, blocked_process->pid);
                pthread_mutex_unlock(&mutex_block_list);

                if (pcb == NULL)
                {
                    pthread_mutex_lock(&mutex_susp_block_list);
                    pcb = search_pcb_from_pid(susp_block_list, blocked_process->pid);
                    pthread_mutex_unlock(&mutex_susp_block_list);
                }

                if (pcb != NULL)
                {
                    t_package *package_io = create_package(PACKAGE, SYSCALL_IO);
                    t_buffer_IO_NAME_TIME_MS_SYSCALL_IO *buffer_to_send = malloc(sizeof(t_buffer_IO_NAME_TIME_MS_SYSCALL_IO));

                    buffer_to_send->pid = pcb->PID;
                    buffer_to_send->pc = pcb->PC;
                    buffer_to_send->time_ms = blocked_process->time;
                    buffer_to_send->io_name = strdup(io_device->io_name);

                    int size_buffer_io;
                    package_io->buffer = serialize_buffer_IO_NAME_TIME_MS_SYSCALL_IO(buffer_to_send, &size_buffer_io);
                    package_io->buffer_size = size_buffer_io;

                    send_package(package_io, io_device->io_socket);

                    pthread_mutex_lock(&mutex_blocked_by_io_list);
                    list_add(blocked_by_io_list, blocked_process);
                    pthread_mutex_unlock(&mutex_blocked_by_io_list);
                }
                // free(blocked_process);
            }
            else
            {
                io_device->free = 1;
                pthread_mutex_unlock(&io_blocked_mutex);
            }
        }
    }
    return NULL;
}
