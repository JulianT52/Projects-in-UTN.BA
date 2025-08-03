#ifndef CPU_CYCLE_H
#define CPU_CYCLE_H

#include "instructions.h"
#include "tlb_y_cache.h"

// Funciones del ciclo de instrucción
cpu_context_t* init_cpu_context(int pid, int pc);
char *fetch_instruction(cpu_context_t* context);
void decode_instruction(cpu_context_t* context, char *instruction);
void execute_instruction(cpu_context_t* context);
void handle_interrupt();
void run_cpu_cycle(cpu_context_t* context);

#endif /* CPU_CYCLE_H */ 