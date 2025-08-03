#include "serializacion.h"

//SERIALIZACION Y DESERIALIZACION DEL PAQUETE
//[MSG_TYPE][OP_CODE][BUFFER_SIZE][BUFFER]
void *serialize_package(t_package *package) {
    
    // Serializas el paquete completo
    int total_size = sizeof(package->message_type) + sizeof(package->op_code) + sizeof(package->buffer_size) + package->buffer_size;
    void *serialized_package = malloc(total_size);
    int offset = 0;

    memcpy(serialized_package + offset, &package->message_type, sizeof(package->message_type));
    offset += sizeof(package->message_type);

    memcpy(serialized_package + offset, &package->op_code, sizeof(package->op_code));
    offset += sizeof(package->op_code);

    memcpy(serialized_package + offset, &package->buffer_size, sizeof(package->buffer_size));
    offset += sizeof(package->buffer_size);

    memcpy(serialized_package + offset, package->buffer, package->buffer_size);

    return serialized_package;
}

//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------
//-----------------SERIALIZACION Y DESERIALIZACION DE LOS BUFFERS----------------
//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------
// BUFFER PARA EL PAQUETE QUE ENVIA KERNEL A MEMORIA CON PID, TAMAÑO DEL PROCESO Y PATH PARA INICIALIZAR
//------------------------------------------------------------------------------------------------------

void *serialize_buffer_PID_SIZE_to_MEMORY(t_buffer_PID_SIZE_to_MEMORY *buffer, int *bytes) {

    int size_path = strlen(buffer->path_file) + 1;
	*bytes = sizeof(int) * 2 + size_path;
    
	void *serialized_buffer = malloc(*bytes);
	int offset = 0;

    memcpy(serialized_buffer + offset, &(buffer->size), sizeof(int));
	offset += sizeof(int);

	memcpy(serialized_buffer + offset, &(buffer->PID), sizeof(int));
	offset += sizeof(int);

    memcpy(serialized_buffer + offset, buffer->path_file, size_path);
	offset += size_path;

	return serialized_buffer;
}

t_buffer_PID_SIZE_to_MEMORY *deserialize_buffer_PID_SIZE_to_MEMORY(void* buffer) {
    
    t_buffer_PID_SIZE_to_MEMORY* deserialized_buffer = malloc(sizeof(t_buffer_PID_SIZE_to_MEMORY));
    int offset = 0;

    memcpy(&(deserialized_buffer->size), buffer + offset, sizeof(int));
    offset += sizeof(int);

    memcpy(&(deserialized_buffer->PID), buffer + offset, sizeof(int));
    offset += sizeof(int);

    deserialized_buffer->path_file = strdup(buffer + offset);

    return deserialized_buffer;
}

//-----------------------------------------------------------------------------------
// BUFFER PARA EL PAQUETE QUE ENVIA KERNEL A CPU CON PID Y PC
//-----------------------------------------------------------------------------------

void *serialize_buffer_PID_PC_to_CPU(t_buffer_PID_PC_to_CPU *buffer, int *bytes) {
	*bytes = sizeof(int) + sizeof(uint32_t);
	void *serialized_buffer = malloc(*bytes);
	int offset = 0;

	memcpy(serialized_buffer + offset, &(buffer->PID), sizeof(int));
	offset += sizeof(int);

	memcpy(serialized_buffer + offset, &(buffer->PC), sizeof(int));
	offset += sizeof(int);

	return serialized_buffer;
}

t_buffer_PID_PC_to_CPU *deserialize_buffer_PID_PC_to_CPU(void* buffer) {
    
    t_buffer_PID_PC_to_CPU* deserialized_buffer = malloc(sizeof(t_buffer_PID_PC_to_CPU));
    int offset = 0;

    memcpy(&(deserialized_buffer->PID), buffer + offset, sizeof(int));
    offset += sizeof(int);

    memcpy(&(deserialized_buffer->PC), buffer + offset, sizeof(uint32_t));

    return deserialized_buffer;
}

//-------------------------------------------------------------------------------------------------------------
// BUFFER PARA EL PAQUETE QUE ENVIA KERNEL A MEMORIA CON PID DEL PROCESO A FINALIZAR
//-------------------------------------------------------------------------------------------------------------

void *serialize_buffer_PID_to_MEMORY_FINALIZE_PROC(t_buffer_PID_to_MEMORY_FINALIZE_PROC *buffer, int *bytes) {

	*bytes = sizeof(int);
	void *serialized_buffer = malloc(*bytes);
	int offset = 0;

	memcpy(serialized_buffer + offset, &(buffer->PID), sizeof(int));
	offset += sizeof(int);

	return serialized_buffer;
}

t_buffer_PID_to_MEMORY_FINALIZE_PROC *deserialize_buffer_PID_to_MEMORY_FINALIZE_PROC(void* buffer) {
    
    t_buffer_PID_to_MEMORY_FINALIZE_PROC* deserialized_buffer = malloc(sizeof(t_buffer_PID_to_MEMORY_FINALIZE_PROC));
    int offset = 0;

    memcpy(&(deserialized_buffer->PID), buffer + offset, sizeof(int));
    offset += sizeof(int);

    return deserialized_buffer;
}

//--------------------------------------------------------------------------------------------------------------
// BUFFER PARA EL PAQUETE QUE ENVIA CPU A KERNEL CON TAMAÑO DEL PROCESO Y FILE PATH PARA INICIALIZAR UN PROCESO
//--------------------------------------------------------------------------------------------------------------

void *serialize_buffer_SIZE_PATH_to_KERNEL_INIT_PROC(t_buffer_SIZE_PATH_to_KERNEL_INIT_PROC *buffer, int *bytes) {

    int size_path = strlen(buffer->path_file) + 1;
	*bytes = 2 * sizeof(int) + size_path;
    
	void *serialized_buffer = malloc(*bytes);
	int offset = 0;

    memcpy(serialized_buffer + offset, &(buffer->size), sizeof(int));
	offset += sizeof(int);

    memcpy(serialized_buffer + offset, &(buffer->pc), sizeof(int));
	offset += sizeof(int);

    memcpy(serialized_buffer + offset, buffer->path_file, size_path);
	offset += size_path;

	return serialized_buffer;
}

t_buffer_SIZE_PATH_to_KERNEL_INIT_PROC *deserialize_buffer_SIZE_PATH_to_KERNEL_INIT_PROC(void* buffer) {
    
    t_buffer_SIZE_PATH_to_KERNEL_INIT_PROC* deserialized_buffer = malloc(sizeof(t_buffer_SIZE_PATH_to_KERNEL_INIT_PROC));
    int offset = 0;

    memcpy(&(deserialized_buffer->size), buffer + offset, sizeof(int));
    offset += sizeof(int);

    memcpy(&(deserialized_buffer->pc), buffer + offset, sizeof(int));
    offset += sizeof(int);

    deserialized_buffer->path_file = strdup(buffer + offset);

    return deserialized_buffer;
}

//-------------------------------------------------------------------------------------------------------------------
// BUFFER PARA EL PAQUETE QUE ENVIA KERNEL A MEMORIA CON PID PARA DUMP MEMORY
//---------------------------------------------------------------------------------------------------------------------

void *serialize_buffer_PID_to_MEMORY_DUMP_MEMORY(t_buffer_PID_to_MEMORY_DUMP_MEMORY *buffer, int *bytes) {

	*bytes = sizeof(int) * 2;
    // *bytes = sizeof(int);
	void *serialized_buffer = malloc(*bytes);
	int offset = 0;

	memcpy(serialized_buffer + offset, &(buffer->PID), sizeof(int));
	offset += sizeof(int);

    memcpy(serialized_buffer + offset, &(buffer->PC), sizeof(int));
	offset += sizeof(int);

	return serialized_buffer;
}

t_buffer_PID_to_MEMORY_DUMP_MEMORY *deserialize_buffer_PID_to_MEMORY_DUMP_MEMORY(void* buffer) {
    
    t_buffer_PID_to_MEMORY_DUMP_MEMORY* deserialized_buffer = malloc(sizeof(t_buffer_PID_to_MEMORY_DUMP_MEMORY));
    int offset = 0;

    memcpy(&(deserialized_buffer->PID), buffer + offset, sizeof(int));
    offset += sizeof(int);

    memcpy(&(deserialized_buffer->PC), buffer + offset, sizeof(int));
    offset += sizeof(int);

    return deserialized_buffer;
}

//---------------------------------------------------------------------------------------------------------------------
// BUFFER PARA EL PAQUETE QUE ENVIA CPU A KERNEL CON IO NAME Y TIME MS PARA SYSCALL IO
//---------------------------------------------------------------------------------------------------------------------

void *serialize_buffer_IO_NAME_TIME_MS_SYSCALL_IO(t_buffer_IO_NAME_TIME_MS_SYSCALL_IO *buffer, int *bytes) {

    int name_size = strlen(buffer->io_name) + 1;
	*bytes = sizeof(int) * 3 + name_size;
    
	void *serialized_buffer = malloc(*bytes);
	int offset = 0;

    memcpy(serialized_buffer + offset, &(buffer->pid), sizeof(int));
	offset += sizeof(int);

    memcpy(serialized_buffer + offset, &(buffer->pc), sizeof(int));
	offset += sizeof(int);

    memcpy(serialized_buffer + offset, &(buffer->time_ms), sizeof(int));
	offset += sizeof(int);

    memcpy(serialized_buffer + offset, buffer->io_name, name_size);
	offset += name_size;

	return serialized_buffer;
}

t_buffer_IO_NAME_TIME_MS_SYSCALL_IO *deserialize_buffer_IO_NAME_TIME_MS_SYSCALL_IO(void* buffer) {
    
    t_buffer_IO_NAME_TIME_MS_SYSCALL_IO* deserialized_buffer = malloc(sizeof(t_buffer_IO_NAME_TIME_MS_SYSCALL_IO));
    int offset = 0;

    memcpy(&(deserialized_buffer->pid), buffer + offset, sizeof(int));
    offset += sizeof(int);

    memcpy(&(deserialized_buffer->pc), buffer + offset, sizeof(int));
    offset += sizeof(int);
   
    memcpy(&(deserialized_buffer->time_ms), buffer + offset, sizeof(int));
    offset += sizeof(int);

    deserialized_buffer->io_name = strdup(buffer + offset);

    return deserialized_buffer;
}

//------------------------------------------------------------------------------------------------------------------------
// BUFFER PARA EL PAQUETE QUE ENVIA MEMORIA A CPU CON CHAR* PARA MANDAR INSTRUCCIONES
//------------------------------------------------------------------------------------------------------------------------

void *serialize_buffer_INSTRUCTION_to_CPU(t_buffer_INSTRUCTION_to_CPU *buffer, int *bytes) {

    int size_instruction = strlen(buffer->instruction) + 1;
	*bytes = size_instruction;
    
	void *serialized_buffer = malloc(*bytes);
	int offset = 0;

    memcpy(serialized_buffer + offset, buffer->instruction, size_instruction);
	offset += size_instruction;

	return serialized_buffer;
}

t_buffer_INSTRUCTION_to_CPU *deserialize_buffer_INSTRUCTION_to_CPU(void* buffer) {
    
    t_buffer_INSTRUCTION_to_CPU* deserialized_buffer = malloc(sizeof(t_buffer_INSTRUCTION_to_CPU));
    int offset = 0;

    deserialized_buffer->instruction = strdup(buffer + offset);

    return deserialized_buffer;
}


//-------------------------------------------------------------------------------------------------------------
// BUFFER PARA EL PAQUETE QUE ENVIA KERNEL A CPU CON PID DEL PROCESO QUE VA A INTERRUMPIRSE
//-------------------------------------------------------------------------------------------------------------

void *serialize_buffer_PID_to_CPU_INTERRUPT_PROC(t_buffer_PID_to_CPU_INTERRUPT_PROC *buffer, int *bytes) {

	*bytes = sizeof(int);
	void *serialized_buffer = malloc(*bytes);
	int offset = 0;

	memcpy(serialized_buffer + offset, &(buffer->PID), sizeof(int));
	offset += sizeof(int);

	return serialized_buffer;
}

t_buffer_PID_to_CPU_INTERRUPT_PROC *deserialize_buffer_PID_to_CPU_INTERRUPT_PROC(void* buffer) {
    
    t_buffer_PID_to_CPU_INTERRUPT_PROC* deserialized_buffer = malloc(sizeof(t_buffer_PID_to_CPU_INTERRUPT_PROC));
    int offset = 0;

    memcpy(&(deserialized_buffer->PID), buffer + offset, sizeof(int));
    offset += sizeof(int);

    return deserialized_buffer;
}

//------------------------------------------------------------------------------------------------------------------------
// BUFFER PARA EL PAQUETE QUE ENVIA CPU A KERNEL CON LA SYSCALL DE IO
//------------------------------------------------------------------------------------------------------------------------

void *serialize_buffer_DEVICE_TIME_kernel(t_buffer_DEVICE_TIME_kernel *buffer, int *bytes) {

    int size_name = strlen(buffer->io_name) + 1;
	*bytes = size_name + sizeof(int) * 2;
    
	void *serialized_buffer = malloc(*bytes);
	int offset = 0;

    memcpy(serialized_buffer + offset, &(buffer->time_ms), sizeof(int));
	offset += sizeof(int);

    memcpy(serialized_buffer + offset, buffer->io_name, size_name);
	offset += size_name;

	return serialized_buffer;
}

t_buffer_DEVICE_TIME_kernel *deserialize_buffer_DEVICE_TIME_kernel(void* buffer){
    
    t_buffer_DEVICE_TIME_kernel* deserialized_buffer = malloc(sizeof(t_buffer_DEVICE_TIME_kernel));
    int offset = 0;

    memcpy(&(deserialized_buffer->time_ms), buffer + offset, sizeof(int));
    offset += sizeof(int);

    deserialized_buffer->io_name = strdup(buffer + offset);

    return deserialized_buffer;
}

//---------------------------------------------------------------------------------------------------------------------
// BUFFER PARA EL PAQUETE QUE ENVIA IO A KERNEL CON EL PID
//---------------------------------------------------------------------------------------------------------------------

void *serialize_buffer_PID_to_kernel_io(t_buffer_PID_to_kernel_io *buffer, int *bytes) {

	*bytes = sizeof(int);
	void *serialized_buffer = malloc(*bytes);
	int offset = 0;

	memcpy(serialized_buffer + offset, &(buffer->PID), sizeof(int));
	offset += sizeof(int);

	return serialized_buffer;
}

t_buffer_PID_to_kernel_io *deserialize_buffer_PID_to_kernel_io(void* buffer) {
    
    t_buffer_PID_to_kernel_io* deserialized_buffer = malloc(sizeof(t_buffer_PID_to_MEMORY_DUMP_MEMORY));
    int offset = 0;

    memcpy(&(deserialized_buffer->PID), buffer + offset, sizeof(int));
    offset += sizeof(int);

    return deserialized_buffer;
}

//---------------------------------------------------------------------------------------------------------------------
// BUFFER PARA EL PAQUETE QUE ENVIA CPU A MEMORIA PIDIENDO MARCO DE PAGINA
//---------------------------------------------------------------------------------------------------------------------

void* serialize_buffer_PID_PAGE_ENTRIES(t_buffer_PID_PAGE_ENTRIES* buffer, int* bytes) {

    int total_size = sizeof(int) * (3 + buffer->entries_cant);
    void* stream = malloc(total_size);
    int offset = 0;

    memcpy(stream + offset, &buffer->pid, sizeof(int));
    offset += sizeof(int);

    memcpy(stream + offset, &buffer->page_number, sizeof(int));
    offset += sizeof(int);

    memcpy(stream + offset, &buffer->entries_cant, sizeof(int));
    offset += sizeof(int);

    for (int i = 0; i < buffer->entries_cant; i++) {
        memcpy(stream + offset, &buffer->entries[i], sizeof(int));
        offset += sizeof(int);
    }

    *bytes = total_size;
    return stream;
}

t_buffer_PID_PAGE_ENTRIES* deserialize_buffer_PID_PAGE_ENTRIES(void* buffer) {
    
    t_buffer_PID_PAGE_ENTRIES* deserialized_buffer = malloc(sizeof(t_buffer_PID_PAGE_ENTRIES));
    int offset = 0;

    memcpy(&deserialized_buffer->pid, buffer + offset, sizeof(int));
    offset += sizeof(int);

    memcpy(&deserialized_buffer->page_number, buffer + offset, sizeof(int));
    offset += sizeof(int);

    memcpy(&deserialized_buffer->entries_cant, buffer + offset, sizeof(int));
    offset += sizeof(int);

    deserialized_buffer->entries = malloc(sizeof(int) * deserialized_buffer->entries_cant);

    for (int i = 0; i < deserialized_buffer->entries_cant; i++) {
        memcpy(&deserialized_buffer->entries[i], buffer + offset, sizeof(int));
        offset += sizeof(int);
    }

    return deserialized_buffer;
}

//---------------------------------------------------------------------------------------------------------------------
// BUFFER PARA EL PAQUETE QUE ENVIA CPU A MEMORIA PIDIENDOLE LA PAGINA
//---------------------------------------------------------------------------------------------------------------------

// void *serialize_buffer_PID_FRAME_TO_MEMORY(t_buffer_PID_FRAME_TO_MEMORY *buffer, int *bytes) {

// 	*bytes = sizeof(int) ;
// 	void *serialized_buffer = malloc(*bytes);
// 	int offset = 0;

//     memcpy(serialized_buffer + offset, &(buffer->frame_number), sizeof(int));
// 	offset += sizeof(int);

// 	return serialized_buffer;
// }

// t_buffer_PID_FRAME_TO_MEMORY *deserialize_buffer_PID_FRAME_TO_MEMORY(void* buffer) {
    
//     t_buffer_PID_FRAME_TO_MEMORY* deserialized_buffer = malloc(sizeof(t_buffer_PID_FRAME_TO_MEMORY));
//     int offset = 0;

//     memcpy(&(deserialized_buffer->frame_number), buffer + offset, sizeof(int));
//     offset += sizeof(int);

//     return deserialized_buffer;
// }

//------------------------------------------------------------------------------------------------------------------------
// BUFFER PARA EL PAQUETE QUE ENVIA MEMORIA A CPU CON EL CONTENIDO DEL MARCO Y SU TAMAÑO
//------------------------------------------------------------------------------------------------------------------------

void *serialize_buffer_CONTENT_SIZE_TO_CPU(t_buffer_CONTENT_SIZE_TO_CPU *buffer, int *bytes) {

    int size_name = strlen(buffer->content)+1;
	*bytes = size_name + sizeof(u_int32_t)+sizeof(int);
    
	void *serialized_buffer = malloc(*bytes);
	int offset = 0;

    memcpy(serialized_buffer + offset, &(buffer->pid), sizeof(int));
	offset += sizeof(int);

    memcpy(serialized_buffer + offset, &(buffer->size), sizeof(u_int32_t));
	offset += sizeof(u_int32_t);

    memcpy(serialized_buffer + offset, buffer->content, size_name);
	offset += size_name;

	return serialized_buffer;
}

t_buffer_CONTENT_SIZE_TO_CPU *deserialize_buffer_CONTENT_SIZE_TO_CPU(void* buffer) {
    
    t_buffer_CONTENT_SIZE_TO_CPU* deserialized_buffer = malloc(sizeof(t_buffer_CONTENT_SIZE_TO_CPU));
    int offset = 0;

    memcpy(&(deserialized_buffer->pid), buffer + offset, sizeof(int));
    offset += sizeof(int);

    memcpy(&(deserialized_buffer->size), buffer + offset, sizeof(u_int32_t));
    offset += sizeof(u_int32_t);

    deserialized_buffer->content = strdup(buffer + offset);

    return deserialized_buffer;
}


void *serialize_buffer_ADDRESS_SIZE_TO_MEMORY(t_buffer_ADDRESS_SIZE_TO_MEMORY *buffer, int *bytes){

	*bytes = sizeof(u_int32_t) + sizeof(int) + sizeof(int);
    
	void *serialized_buffer = malloc(*bytes);
	int offset = 0;

    memcpy(serialized_buffer + offset, &(buffer->pid), sizeof(int));
	offset += sizeof(int);

    memcpy(serialized_buffer + offset, &(buffer->address), sizeof(u_int32_t));
	offset += sizeof(u_int32_t);

    memcpy(serialized_buffer + offset, &(buffer->size), sizeof(int));
    offset += sizeof(int);

	return serialized_buffer;
}

t_buffer_ADDRESS_SIZE_TO_MEMORY  *deserialize_buffer_ADDRESS_SIZE_TO_MEMORY(void* buffer){
    
    t_buffer_ADDRESS_SIZE_TO_MEMORY * deserialized_buffer = malloc(sizeof(t_buffer_ADDRESS_SIZE_TO_MEMORY ));
    int offset = 0;

    memcpy(&(deserialized_buffer->pid), buffer + offset, sizeof(int));
    offset += sizeof(int);

    memcpy(&(deserialized_buffer->address), buffer + offset, sizeof(u_int32_t));
    offset += sizeof(u_int32_t);

    memcpy(&(deserialized_buffer->size), buffer + offset, sizeof(int));
    offset += sizeof(int);

    return deserialized_buffer;
}

void *serialize_ADDRESS_PID_TO_MEMORY (t_buffer_ADDRESS_PID_TO_MEMORY * buffer, int *bytes){

    *bytes = sizeof(u_int32_t) + sizeof(int);

    void *serialized_buffer = malloc(*bytes);
	int offset = 0;

    memcpy(serialized_buffer + offset, &(buffer->pid), sizeof(int));
	offset += sizeof(int);

    memcpy(serialized_buffer + offset, &(buffer->address), sizeof(u_int32_t));
	offset += sizeof(u_int32_t);

	return serialized_buffer;
}

t_buffer_ADDRESS_PID_TO_MEMORY  *deserialize_buffer_ADDRESS_PID_TO_MEMORY(void* buffer){
    
    t_buffer_ADDRESS_PID_TO_MEMORY * deserialized_buffer = malloc(sizeof(t_buffer_ADDRESS_PID_TO_MEMORY));
    int offset = 0;

    memcpy(&(deserialized_buffer->pid), buffer + offset, sizeof(int));
    offset += sizeof(int);

    memcpy(&(deserialized_buffer->address), buffer + offset, sizeof(u_int32_t));
    offset += sizeof(u_int32_t);

    return deserialized_buffer;
}

void *serialize_buffer_PAGE_CONTENT (t_buffer_PAGE_CONTENT * buffer, int *bytes){

    int size_page = strlen(buffer->page)+1;
	*bytes = size_page;

    void *serialized_buffer = malloc(*bytes);
    int offset = 0;

    memcpy(serialized_buffer + offset, buffer->page, size_page);
	offset += size_page;

    return serialized_buffer;
}

t_buffer_PAGE_CONTENT * deserialize_buffer_PAGE_CONTENT (void * buffer){

    t_buffer_PAGE_CONTENT* deserialized_buffer = malloc(sizeof(t_buffer_CONTENT_SIZE_TO_CPU));
    int offset = 0;

    deserialized_buffer->page = strdup(buffer + offset);

    return deserialized_buffer;
}

