export class Pedido {
    constructor(id, cliente, gig, paquete, total, fechaCreacion, estado, requerimientos = '', mensajes = []) {
        this.id = id
        this.cliente = cliente
        this.gig = gig
        this.paquete = paquete
        this.total = total
        this.fechaCreacion = fechaCreacion
        this.estado = estado
        this.requerimientos = requerimientos
        this.mensajes = mensajes
    }
}
