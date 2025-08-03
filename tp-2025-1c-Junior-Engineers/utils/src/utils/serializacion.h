#ifndef SERIALIZACION_H
#define SERIALIZACION_H

#include <stdlib.h>
#include <stdio.h>
#include <signal.h>
#include <commons/config.h>
#include <commons/collections/list.h>
#include <commons/string.h>
#include <commons/log.h>
#include <sys/socket.h>
#include <string.h>
#include <unistd.h>
#include <pthread.h>
#include <netdb.h>

// Tipo de Paquete
typedef enum
{
	MESSAGE,
	PACKAGE
} t_message_type;

typedef enum
{

	// OP CODE KERNEL A MEMORIA
	INIT_PROCESS = 1,
	INIT_OK,
	INIT_FAIL,
	SUSPEND_PROCESS,
	RESUME_PROCESS,
	FINALIZE_PROCESS,
	DUMP_MEMORY,

	// RESPUESTAS DE HANDSHAKE
	HANDSHAKE_OK,

	// OP CODE KERNEL A CPU
	EXEC_PROC,
	EXEC_OK,
	EXEC_REPL,
	INTERRUPT_PROCESS,
	INTERRUPT_SRT,
	INTERRUPT_SRT_IO,
	CONTINUE_EXEC,
	STOP_EXEC,

	// SYSCALLS CPU A KERNEL
	SYSCALL_IO,
	SYSCALL_INIT_PROC,
	SYSCALL_EXIT,
	SYSCALL_DUMP_MEMORY,
	UPDATE_BURST_ESTIMATE,

	// OP CODE CPU A MEMORIA
	REQUEST_INSTRUCTION,
	RESPONSE_INSTRUCTION,
	END_OF_INSTRUCTIONS,
	REQUEST_FRAME,
	WRITE_FULL_PAGE,
	REQUEST_FULL_PAGE,
	WRITE_OK,
	WRITE_NOT_OK,
	READ_OK,
	NO_MORE_PAGES_SWAP,

	// OP CODES QUE USA CPU
	VERIFY_INTERRUPT,
	INTERRUPT_RECEIVED,
	INTERRUPT_RESPONSE,
	READ_MEMORY,
	WRITE_MEMORY,
	START_PROCESS,

	// DUMP_MEMORY,
	EXIT_PROCESS,

	// OP CODE IO A KERNEL
	IO_COMPLETED,

} t_op_code;

typedef struct
{
	t_message_type message_type;
	t_op_code op_code;
	int buffer_size;
	void *buffer;
} t_package;

typedef struct
{
	uint32_t PC;
	int PID;
} t_buffer_PID_PC_to_CPU;

typedef struct
{
	int size;
	int PID;
	char *path_file;
} t_buffer_PID_SIZE_to_MEMORY;

typedef struct
{
	int PID;
} t_buffer_PID_to_MEMORY_FINALIZE_PROC;

typedef struct
{
	int size;
	int pc;
	char *path_file;
} t_buffer_SIZE_PATH_to_KERNEL_INIT_PROC;

typedef struct
{
	int PID;
	int PC;
} t_buffer_PID_to_MEMORY_DUMP_MEMORY;

typedef struct
{
	int pid;
	int pc;
	int time_ms;
	char *io_name;
} t_buffer_IO_NAME_TIME_MS_SYSCALL_IO;

typedef struct
{
	char *instruction;
} t_buffer_INSTRUCTION_to_CPU;

typedef struct
{
	int PID;
} t_buffer_PID_to_CPU_INTERRUPT_PROC;

typedef struct
{
	int time_ms;
	char *io_name;
} t_buffer_DEVICE_TIME_kernel;

typedef struct
{
	int PID;
} t_buffer_PID_to_kernel_io;

typedef struct
{
	int pid;
	int page_number;
	int entries_cant;
	int *entries;
} t_buffer_PID_PAGE_ENTRIES;

// typedef struct {
//     int frame_number;
// } t_buffer_PID_FRAME_TO_MEMORY;

typedef struct
{
	int pid;
	u_int32_t size;
	char *content;
} t_buffer_CONTENT_SIZE_TO_CPU;

typedef struct
{
	int pid;
	u_int32_t address;
	int size;
} t_buffer_ADDRESS_SIZE_TO_MEMORY;

typedef struct
{
	int pid;
	u_int32_t address;
} t_buffer_ADDRESS_PID_TO_MEMORY;

typedef struct
{
	char *page;
} t_buffer_PAGE_CONTENT;

// SERIALIZACION Y DESERIALIZACION DE PAQUETES
void *serialize_package(t_package *package);

// SERIALIZACION Y DESEREALIZACION DE BUFFERS
void *serialize_buffer_PID_SIZE_to_MEMORY(t_buffer_PID_SIZE_to_MEMORY *buffer, int *bytes);
t_buffer_PID_SIZE_to_MEMORY *deserialize_buffer_PID_SIZE_to_MEMORY(void *buffer);

void *serialize_buffer_PID_PC_to_CPU(t_buffer_PID_PC_to_CPU *buffer, int *bytes);
t_buffer_PID_PC_to_CPU *deserialize_buffer_PID_PC_to_CPU(void *buffer);

void *serialize_buffer_PID_to_MEMORY_FINALIZE_PROC(t_buffer_PID_to_MEMORY_FINALIZE_PROC *buffer, int *bytes);
t_buffer_PID_to_MEMORY_FINALIZE_PROC *deserialize_buffer_PID_to_MEMORY_FINALIZE_PROC(void *buffer);

void *serialize_buffer_SIZE_PATH_to_KERNEL_INIT_PROC(t_buffer_SIZE_PATH_to_KERNEL_INIT_PROC *buffer, int *bytes);
t_buffer_SIZE_PATH_to_KERNEL_INIT_PROC *deserialize_buffer_SIZE_PATH_to_KERNEL_INIT_PROC(void *buffer);

void *serialize_buffer_PID_to_MEMORY_DUMP_MEMORY(t_buffer_PID_to_MEMORY_DUMP_MEMORY *buffer, int *bytes);
t_buffer_PID_to_MEMORY_DUMP_MEMORY *deserialize_buffer_PID_to_MEMORY_DUMP_MEMORY(void *buffer);

void *serialize_buffer_IO_NAME_TIME_MS_SYSCALL_IO(t_buffer_IO_NAME_TIME_MS_SYSCALL_IO *buffer, int *bytes);
t_buffer_IO_NAME_TIME_MS_SYSCALL_IO *deserialize_buffer_IO_NAME_TIME_MS_SYSCALL_IO(void *buffer);

void *serialize_buffer_INSTRUCTION_to_CPU(t_buffer_INSTRUCTION_to_CPU *buffer, int *bytes);
t_buffer_INSTRUCTION_to_CPU *deserialize_buffer_INSTRUCTION_to_CPU(void *buffer);

void *serialize_buffer_PID_to_CPU_INTERRUPT_PROC(t_buffer_PID_to_CPU_INTERRUPT_PROC *buffer, int *bytes);
t_buffer_PID_to_CPU_INTERRUPT_PROC *deserialize_buffer_PID_to_CPU_INTERRUPT_PROC(void *buffer);

void *serialize_buffer_DEVICE_TIME_kernel(t_buffer_DEVICE_TIME_kernel *buffer, int *bytes);
t_buffer_DEVICE_TIME_kernel *deserialize_buffer_DEVICE_TIME_kernel(void *buffer);

void *serialize_buffer_PID_to_kernel_io(t_buffer_PID_to_kernel_io *buffer, int *bytes);
t_buffer_PID_to_kernel_io *deserialize_buffer_PID_to_kernel_io(void *buffer);

void *serialize_buffer_PID_PAGE_ENTRIES(t_buffer_PID_PAGE_ENTRIES *buffer, int *bytes);
t_buffer_PID_PAGE_ENTRIES *deserialize_buffer_PID_PAGE_ENTRIES(void *buffer);

// void *serialize_buffer_PID_FRAME_TO_MEMORY(t_buffer_PID_FRAME_TO_MEMORY *buffer, int *bytes);
// t_buffer_PID_FRAME_TO_MEMORY *deserialize_buffer_PID_FRAME_TO_MEMORY(void* buffer);

void *serialize_buffer_CONTENT_SIZE_TO_CPU(t_buffer_CONTENT_SIZE_TO_CPU *buffer, int *bytes);
t_buffer_CONTENT_SIZE_TO_CPU *deserialize_buffer_CONTENT_SIZE_TO_CPU(void *buffer);

void *serialize_buffer_ADDRESS_SIZE_TO_MEMORY(t_buffer_ADDRESS_SIZE_TO_MEMORY *buffer, int *bytes);
t_buffer_ADDRESS_SIZE_TO_MEMORY *deserialize_buffer_ADDRESS_SIZE_TO_MEMORY(void *buffer);

void *serialize_ADDRESS_PID_TO_MEMORY(t_buffer_ADDRESS_PID_TO_MEMORY *buffer, int *bytes);
t_buffer_ADDRESS_PID_TO_MEMORY *deserialize_buffer_ADDRESS_PID_TO_MEMORY(void *buffer);

void *serialize_buffer_PAGE_CONTENT(t_buffer_PAGE_CONTENT *buffer, int *bytes);
t_buffer_PAGE_CONTENT *deserialize_buffer_PAGE_CONTENT(void *buffer);

#endif /* SERIALIZACION_H */