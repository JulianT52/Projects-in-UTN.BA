#ifndef INSTRUCTIONS_H
#define INSTRUCTIONS_H

#include "utilsCpu.h"

t_instruction* parse_instruction(char* instruction);
void free_instruction(t_instruction* instruction);

#endif /* INSTRUCTIONS_H */