#include "utilsIo.h"
#include "globalIO.h"

t_log * loggerIO;
int kernel_socket;

int main(int argc, char *argv[]) {

    if (argc < 1) {
        fprintf(stderr, "Uso: %s [interfaz_name]\n", argv[0]);
        return EXIT_FAILURE;
    }
    loggerIO = log_create("io.log","io",1,LOG_LEVEL_TRACE);

    interface_name = argv[1];
    log_info(loggerIO,"Nombre de la interfaz IO: %s\n", interface_name);

    t_config * config = config_create("io.config");
    read_configs_io(config);

    kernel_socket = connect_io_kernel(ip_kernel, puerto_kernel, interface_name);
    if (kernel_socket == -1){

        log_error(loggerIO, "No se pudo conectar al Kernel");
        return EXIT_FAILURE;
    }

    log_debug(loggerIO, "Esperando peticiones del Kernel...");

     while (1) {
        t_package *package = receive_package(kernel_socket);

        if (package == NULL) {
            log_error(loggerIO, "Error al recibir paquete del Kernel");
            break;
        }

        switch (package->op_code) {

            case SYSCALL_IO:
                t_buffer_IO_NAME_TIME_MS_SYSCALL_IO* buffer = deserialize_buffer_IO_NAME_TIME_MS_SYSCALL_IO(package->buffer);
                
                if (buffer == NULL) {
                    log_error(loggerIO, "Error al deserializar el buffer de IO");
                    free(package);
                    continue;
                }

                if (buffer->time_ms <= 0) {
                    log_error(loggerIO, "Tiempo de IO inválido: %d", buffer->time_ms);
                    free(buffer);
                    delete_package(package);
                    continue;
                }

                if (buffer->pid < 0) {
                    log_error(loggerIO, "PID inválido: %d", buffer->pid);
                    free(buffer);
                    delete_package(package);
                    continue;
                }

                log_info(loggerIO, "## PID: %d - Inicio de IO - Tiempo: %d", buffer->pid, buffer->time_ms);

                usleep(buffer->time_ms * 1000);
                 
                log_info(loggerIO, "## PID: %d - Fin de IO", buffer->pid);
        
                t_package *response_package = create_package(PACKAGE, IO_COMPLETED);

                t_buffer_PID_to_kernel_io * buffer_io_completed = malloc(sizeof(t_buffer_PID_to_kernel_io));
                buffer_io_completed->PID = buffer->pid;

                int size_buffer;
                response_package->buffer = serialize_buffer_PID_to_kernel_io(buffer_io_completed, &size_buffer);
                response_package->buffer_size = size_buffer;

                send_package(response_package, kernel_socket);
                break;
    
            default:
              log_error(loggerIO, "Código de operación desconocido: %d", package->op_code);
              break;
        }
    }
    close(kernel_socket);
    log_destroy(loggerIO);
    return 0;
}
