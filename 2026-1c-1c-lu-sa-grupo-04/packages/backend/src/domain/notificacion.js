export class Notificacion {

    constructor(destinatario, remitente, mensaje){
        this.id = "GeneratedRandomString";
        this.destinatario = destinatario;
        this.remitente = remitente;
        this.mensaje = mensaje;
        this.fechaHoraCreacion = new Date();
        // El constructor tambien tiene un parametro leida y fecha de lectura pero como no son necesarios para la inicializacion de la clase notificacion, no es necesario instanciarlos en el constructor
    }

    marcarComoLeida(){
        this.leida = true;
        this.fechaHoraLectura = new Date();
    }
}