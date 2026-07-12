export class Gig {
    constructor(
        id,
        nombre,
        descripcion,
        imagen,
        categoria,
        vendedor,
        paquetes = [],
        fechaPublicacion = new Date()
    ) {
        this.id = id
        this.nombre = nombre
        this.descripcion = descripcion
        this.imagen = imagen
        this.categoria = categoria
        this.vendedor = vendedor
        this.paquetes = paquetes
        this.opiniones = []
        this.fechaPublicacion = fechaPublicacion
    }
}
