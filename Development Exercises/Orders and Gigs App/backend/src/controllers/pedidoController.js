import { BadRequestError, UnprocessableEntityError } from "../utils/errors.js"

export class PedidoController {
    constructor(service) {
        this.service = service
    }

    crearPedido = async (req, res, next) => {
        try {
            const { cliente, gig, paquete, total, requerimientos, estado } = req.body

            const pedidoCreado = await this.service.crearPedido({
                cliente,
                gig,
                paquete,
                total,
                requerimientos,
                estado
            })

            res.status(201).json({
                mensaje: 'Pedido creado exitosamente',
                pedido: pedidoCreado
            })
        } catch (error) {
            console.error('Error al crear pedido:', error.message)
            
            const statusCode = error.statusCode || 500
            res.status(statusCode).json({
                error: error.message,
                tipo: error.name
            })
        }
    }


    obtenerTodosPedidos = (req, res, next) => {
        try {
            const pedidos = this.service.obtenerTodosPedidos()
            
            res.status(200).json({
                total: pedidos.length,
                pedidos: pedidos
            })
        } catch (error) {
            console.error('Error al obtener pedidos:', error.message)
            res.status(500).json({
                error: 'Error al obtener los pedidos'
            })
        }
    }

    
    obtenerPedidoPorId = (req, res, next) => {
        try {
            const { id } = req.params
            const pedido = this.service.obtenerPedidoPorId(id)

            if (!pedido) {
                return res.status(404).json({
                    error: `Pedido con ID ${id} no encontrado`
                })
            }

            res.status(200).json(pedido)
        } catch (error) {
            console.error('Error al obtener pedido:', error.message)
            res.status(500).json({
                error: 'Error al obtener el pedido'
            })
        }
    }

    obtenerPedidosPorCliente = (req, res, next) => {
        try {
            const { clienteId } = req.params
            const pedidos = this.service.obtenerPedidosPorCliente(clienteId)

            res.status(200).json({
                clienteId: clienteId,
                total: pedidos.length,
                pedidos: pedidos
            })
        } catch (error) {
            console.error('Error al obtener pedidos del cliente:', error.message)
            const statusCode = error.statusCode || 500
            res.status(statusCode).json({
                error: error.message,
                tipo: error.name
            })
        }
    }

    obtenerPedidosPorGig = (req, res, next) => {
        try {
            const { gigId } = req.params
            const pedidos = this.service.obtenerPedidosPorGig(gigId)

            res.status(200).json({
                gigId: gigId,
                total: pedidos.length,
                pedidos: pedidos
            })
        } catch (error) {
            console.error('Error al obtener pedidos del gig:', error.message)
            const statusCode = error.statusCode || 500
            res.status(statusCode).json({
                error: error.message,
                tipo: error.name
            })
        }
    }

    obtenerMensajesPedido = (req, res, next) => {
        try {
            const { id } = req.params
            const mensajes = this.service.obtenerMensajesPedido(id)

            if (mensajes === null) {
                return res.status(404).json({
                    error: `Pedido con ID ${id} no encontrado`
                })
            }

            res.status(200).json({
                pedidoId: id,
                total: mensajes.length,
                mensajes: mensajes
            })
        } catch (error) {
            console.error('Error al obtener mensajes del pedido:', error.message)
            const statusCode = error.statusCode || 500
            res.status(statusCode).json({
                error: error.message,
                tipo: error.name
            })
        }
    }

    agregarMensajePedido = async (req, res, next) => {
        try {
            const { id } = req.params
            const { usuario, mensaje } = req.body

            const pedidoActualizado = await this.service.agregarMensajePedido(id, { usuario, mensaje })

            if (!pedidoActualizado) {
                return res.status(404).json({
                    error: `Pedido con ID ${id} no encontrado`
                })
            }

            res.status(201).json({
                mensaje: 'Mensaje agregado al pedido exitosamente',
                pedido: pedidoActualizado
            })
        } catch (error) {
            console.error('Error al agregar mensaje al pedido:', error.message)
            const statusCode = error.statusCode || 500
            res.status(statusCode).json({
                error: error.message,
                tipo: error.name
            })
        }
    }

    cancelarPedido = async (req, res, next) => {
        try {
            const { id } = req.params
            const pedidoCancelado = await this.service.cancelarPedido(id)

            if (!pedidoCancelado) {
                return res.status(404).json({
                    error: `Pedido con ID ${id} no encontrado`
                })
            }

            res.status(200).json({
                mensaje: 'Pedido cancelado exitosamente',
                pedido: pedidoCancelado
            })
        } catch (error) {
            console.error('Error al cancelar el pedido:', error.message)
            const statusCode = error.statusCode || 500
            res.status(statusCode).json({
                error: error.message,
                tipo: error.name
            })
        }
    }

    agregarOpinionPedido = async (req, res, next) => {
        try {
            const { id } = req.params
            const { usuario, puntuacion, comentario } = req.body

            const resultado = await this.service.agregarOpinionAPedido(id, { usuario, puntuacion, comentario })

            if (!resultado) {
                return res.status(404).json({
                    error: `Pedido con ID ${id} no encontrado`
                })
            }

            res.status(201).json({
                mensaje: 'Opinión agregada exitosamente',
                opinion: resultado.opinion
            })
        } catch (error) {
            console.error('Error al agregar opinión al pedido:', error.message)
            const statusCode = error.statusCode || 500
            res.status(statusCode).json({
                error: error.message,
                tipo: error.name
            })
        }
    }

    cambiarEstadoPedido = async (req, res, next) => {
        try {
            const { id } = req.params
            const { nuevoEstado } = req.body

            const pedidoActualizado = await this.service.cambiarEstado(id, nuevoEstado)

            if (!pedidoActualizado) {
                return res.status(404).json({
                    error: `Pedido con ID ${id} no encontrado`
                })
            }

            res.status(200).json({
                mensaje: 'Estado del pedido actualizado exitosamente',
                pedido: pedidoActualizado
            })
        } catch (error) {
            console.error('Error al cambiar estado del pedido:', error.message)
            
            // Usar el statusCode del error si está disponible
            const statusCode = error.statusCode || 500
            res.status(statusCode).json({
                error: error.message,
                tipo: error.name
            })
        }
    }
}
