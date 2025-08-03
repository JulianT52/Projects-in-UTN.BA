#include "instructions.h"
#include <stdlib.h>
#include <string.h>

int count_spaces(const char* string) {
    int spaces = 0;
    for(int i = 0; string[i] != '\0'; i++) {
        if(string[i] == ' ') spaces++;
    }
    return spaces;
}

char* get_word(const char* string, int start) {
    int i = start;
    
    while(string[i] != ' ' && string[i] != '\0') {
        i++;
    }
    
    int length = i - start;
    
    char* word = malloc(length + 1);

    for(int j = 0; j < length; j++) {
        word[j] = string[start + j];
    }

    word[length] = '\0';
    
    return word;
}

t_instruction* parse_instruction(char* instruction) {
    
    t_instruction* parsed_instruction = malloc(sizeof(t_instruction));
    
    int num_parameters = count_spaces(instruction);
    
    parsed_instruction->parameters = malloc(sizeof(char*) * num_parameters);
    parsed_instruction->cant_parameters = 0;
    parsed_instruction->name = get_word(instruction, 0);
       
    int position = strlen(parsed_instruction->name) + 1;
    
    while(position < strlen(instruction)) {
        
        while(instruction[position] == ' ') 
            position++;
        
        if(instruction[position] == '\0') 
            break;
               
        parsed_instruction->parameters[parsed_instruction->cant_parameters] = get_word(instruction, position);
        parsed_instruction->cant_parameters++;
                
        position += strlen(parsed_instruction->parameters[parsed_instruction->cant_parameters - 1]) + 1;
    }
    
    return parsed_instruction;
} 

void free_instruction(t_instruction* instruction) {
    
    if (instruction == NULL) 
        return;
    
    free(instruction->name);
    
    for (int i = 0; i < instruction->cant_parameters; i++) {
        free(instruction->parameters[i]);
    }

    free(instruction->parameters);
    free(instruction);
    return;
} 