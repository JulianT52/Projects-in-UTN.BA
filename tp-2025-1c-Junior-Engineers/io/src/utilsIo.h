#include <utils/utilsClient.h>
#include <utils/utilsServer.h>

void read_configs_io(t_config * config);
t_package *receive_package(int socket);
int connect_io_kernel(char * ip, char *port,char* interface_name);