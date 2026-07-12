export class GigController {
    constructor(service) {
        this.service = service
    }

    obtenerGigs = async (req, res) => {
        try {
            const { q, categoriaId, orden } = req.query
            const gigs = await this.service.buscarGigs({ termino: q, categoriaId, orden })

            res.status(200).json({
                gigs
            })
        } catch (error) {
            console.error('Error al obtener gigs:', error.message)
            const statusCode = error.statusCode || 500
            res.status(statusCode).json({
                error: error.message,
                tipo: error.name
            })
        }
    }

    crearGig = async (req, res) => {
        try {
            const datosGig = req.body
            const gigCreado = await this.service.crearGig(datosGig)

            res.status(201).json({
                mensaje: 'Gig creado exitosamente',
                gig: gigCreado
            })
        } catch (error) {
            console.error('Error al crear gig:', error.message)
            const statusCode = error.statusCode || 500
            res.status(statusCode).json({
                error: error.message,
                tipo: error.name
            })
        }
    }

    obtenerGigPorId = async (req, res) => {
        try {
            const { id } = req.params
            const gig = await this.service.obtenerGigPorId(id)

            res.status(200).json(gig)
        } catch (error) {
            console.error('Error al obtener gig:', error.message)
            const statusCode = error.statusCode || 500
            res.status(statusCode).json({
                error: error.message,
                tipo: error.name
            })
        }
    }

    obtenerGigsPorCategoria = async (req, res) => {
        try {
            const { categoriaId } = req.params
            const gigs = await this.service.obtenerGigsPorCategoria(categoriaId)

            res.status(200).json({
                categoriaId,
                total: gigs.length,
                gigs
            })
        } catch (error) {
            console.error('Error al obtener gigs por categoría:', error.message)
            const statusCode = error.statusCode || 500
            res.status(statusCode).json({
                error: error.message,
                tipo: error.name
            })
        }
    }
}
