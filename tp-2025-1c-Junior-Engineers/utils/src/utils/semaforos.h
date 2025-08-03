#ifndef SEMAFOROS_H
#define SEMAFOROS_H

#include <stdio.h>
#include <stdlib.h>
#include <semaphore.h>

extern sem_t connection_semaphore;
extern pthread_mutex_t mutex_new_queue;
extern pthread_mutex_t mutex_ready_queue;
extern pthread_mutex_t mutex_exec_queue;

#endif /* SEMAFOROS_H */