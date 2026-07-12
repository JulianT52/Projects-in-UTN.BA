import { Gig } from "../domain/gig.js"
import { BadRequestError, UnprocessableEntityError, NotFoundError } from "../utils/errors.js"

export class GigService {
    constructor(repository) {
        this.repository = repository
    }

    validarId(id, nombreCampo = 'ID') {
        if (id === '' || id === null || id === undefined || (typeof id !== 'string' && typeof id !== 'number')) {
            throw new UnprocessableEntityError(`${nombreCampo} es requerido`)
        }
    }

    calcularPuntajePromedio(opiniones) {
        if (!Array.isArray(opiniones) || opiniones.length === 0) return 0
        const total = opiniones.reduce((suma, opinion) => suma + (typeof opinion.puntuacion === 'number' ? opinion.puntuacion : 0), 0)
        return Number((total / opiniones.length).toFixed(1))
    }

    obtenerPrecioDesde(paquetes) {
        if (!Array.isArray(paquetes) || paquetes.length === 0) return null
        return paquetes.reduce((min, paquete) => {
            const precio = typeof paquete.precio === 'number' ? paquete.precio : Infinity
            return precio < min ? precio : min
        }, Infinity)
    }

    formatearGig(gig) {
        if (!gig) return null

        const opiniones = Array.isArray(gig.opiniones) ? gig.opiniones : []
        const puntajePromedio = this.calcularPuntajePromedio(opiniones)

        return {
            id: gig.id,
            nombre: gig.nombre,
            descripcion: gig.descripcion,
            imagen: gig.imagen,
            categoria: gig.categoria,
            vendedor: gig.vendedor,
            paquetes: gig.paquetes || [],
            precioDesde: this.obtenerPrecioDesde(gig.paquetes),
            puntajePromedio,
            numeroOpiniones: opiniones.length,
            opiniones: opiniones.map((opinion) => ({
                id: opinion.id,
                cliente: opinion.cliente,
                puntuacion: opinion.puntuacion,
                comentario: opinion.comentario,
                fecha: opinion.fecha
            })),
            fechaPublicacion: gig.fechaPublicacion
        }
    }

    validarGig(datosGig) {
        if (!datosGig || typeof datosGig !== 'object' || Array.isArray(datosGig)) {
            throw new BadRequestError('Los datos del gig son inválidos')
        }

        const { nombre, descripcion, imagen, categoria, vendedor, paquetes } = datosGig

        if (typeof nombre !== 'string' || nombre.trim() === '') {
            throw new UnprocessableEntityError('El nombre del gig es requerido')
        }

        if (typeof descripcion !== 'string' || descripcion.trim() === '') {
            throw new UnprocessableEntityError('La descripción del gig es requerida')
        }

        if (typeof imagen !== 'string' || imagen.trim() === '') {
            throw new UnprocessableEntityError('La imagen del gig es requerida')
        }

        if (!categoria || typeof categoria !== 'object' || Array.isArray(categoria)) {
            throw new UnprocessableEntityError('La categoría del gig es requerida')
        }

        if (!vendedor || typeof vendedor !== 'object' || Array.isArray(vendedor)) {
            throw new UnprocessableEntityError('El vendedor del gig es requerido')
        }

        if (!Array.isArray(paquetes) || paquetes.length === 0) {
            throw new UnprocessableEntityError('El gig debe tener al menos un paquete')
        }

        paquetes.forEach((paquete, index) => {
            if (!paquete || typeof paquete !== 'object') {
                throw new UnprocessableEntityError(`El paquete en la posición ${index} es inválido`)
            }
            if (typeof paquete.nombre !== 'string' || paquete.nombre.trim() === '') {
                throw new UnprocessableEntityError(`El nombre del paquete en la posición ${index} es requerido`)
            }
            if (typeof paquete.precio !== 'number' || paquete.precio <= 0) {
                throw new UnprocessableEntityError(`El precio del paquete en la posición ${index} debe ser mayor a 0`)
            }
            if (typeof paquete.diasDeEntrega !== 'number' || paquete.diasDeEntrega <= 0) {
                throw new UnprocessableEntityError(`Los días de entrega del paquete en la posición ${index} deben ser un número entero positivo`)
            }
        })
    }

    async crearGig(datosGig) {
        this.validarGig(datosGig)

        const { nombre, descripcion, imagen, categoria, vendedor, paquetes } = datosGig
        const gig = new Gig(null, nombre, descripcion, imagen, categoria, vendedor, paquetes)
        const gigCreado = this.repository.crear(gig)
        return this.formatearGig(gigCreado)
    }

    obtenerTodosGigs() {
        return this.repository.obtenerTodos().map((gig) => this.formatearGig(gig))
    }

    obtenerGigPorId(id) {
        this.validarId(id, 'ID del gig')

        const gig = this.repository.obtenerPorId(id)
        if (!gig) {
            throw new NotFoundError(`Gig con ID ${id} no encontrado`)
        }

        return this.formatearGig(gig)
    }

    obtenerGigsPorCategoria(categoriaId) {
        this.validarId(categoriaId, 'ID de categoría')

        const gigs = this.repository.obtenerPorCategoria(categoriaId)
        return gigs.map((gig) => this.formatearGig(gig))
    }

    ordenarGigs(gigs, orden) {
        if (!orden) return gigs
        const copia = [...gigs]
        switch (orden) {
            case 'precio':
                return copia.sort((a, b) => (a.precioDesde || 0) - (b.precioDesde || 0))
            case 'puntaje':
                return copia.sort((a, b) => (b.puntajePromedio || 0) - (a.puntajePromedio || 0))
            case 'fechaPublicacion':
                return copia.sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion))
            default:
                return gigs
        }
    }

    buscarGigs({ termino, categoriaId, orden }) {
        if ((!termino || termino.trim() === '') && (categoriaId === undefined || categoriaId === null)) {
            return this.ordenarGigs(this.obtenerTodosGigs(), orden)
        }

        if (categoriaId !== undefined && categoriaId !== null) {
            this.validarId(categoriaId, 'ID de categoría')
        }

        const gigs = this.repository.obtenerPorCriterios({ termino, categoriaId })
        return this.ordenarGigs(gigs.map((gig) => this.formatearGig(gig)), orden)
    }
}
