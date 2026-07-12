import { Pedido } from "../domain/pedido.js"
import { Opinion } from "../domain/opinion.js"
import { EstadoPedido } from "../domain/estadoPedido.js"
import { gigRepository } from "../repositories/gigRepository.js"
import { BadRequestError, UnprocessableEntityError, NotFoundError } from "../utils/errors.js"

export class PedidoService {
    constructor(repository) {
        this.repository = repository
    }

    async validarDatosPedido(datosPedido) {
        if (!datosPedido || typeof datosPedido !== 'object' || Array.isArray(datosPedido)) {
            throw new BadRequestError('Los datos del pedido son inválidos')
        }

        const { cliente, gig, paquete, total, estado = EstadoPedido.PENDIENTE, requerimientos = '' } = datosPedido

        if (!cliente || typeof cliente !== 'object' || Array.isArray(cliente)) {
            throw new UnprocessableEntityError('El cliente es requerido y debe ser un objeto')
        }

        if (!gig || typeof gig !== 'object' || Array.isArray(gig)) {
            throw new UnprocessableEntityError('El gig es requerido y debe ser un objeto')
        }

        if (!Array.isArray(gig.paquetes) || gig.paquetes.length === 0) {
            throw new UnprocessableEntityError('El gig debe incluir al menos un paquete disponible')
        }

        if (!paquete || typeof paquete !== 'object' || Array.isArray(paquete)) {
            throw new UnprocessableEntityError('El paquete es requerido y debe ser un objeto')
        }

        const paqueteValido = gig.paquetes.some(
            (p) => p.nombre === paquete.nombre && p.precio === paquete.precio && p.diasDeEntrega === paquete.diasDeEntrega
        )

        if (!paqueteValido) {
            throw new UnprocessableEntityError('El paquete seleccionado no está disponible para este gig')
        }

        if (typeof total !== 'number' || total <= 0) {
            throw new UnprocessableEntityError('El total debe ser un número mayor a 0')
        }

        if (total !== paquete.precio) {
            throw new UnprocessableEntityError('El total debe coincidir con el precio del paquete seleccionado')
        }

        if (typeof requerimientos !== 'string') {
            throw new UnprocessableEntityError('Los requerimientos deben ser una cadena de texto')
        }

        if (typeof estado !== 'string' || !Object.values(EstadoPedido).includes(estado)) {
            throw new UnprocessableEntityError(
                `Estado inválido: ${estado}. Debe ser uno de: ${Object.values(EstadoPedido).join(', ')}`
            )
        }
    }

    formatearEstado(estado) {
        const descripcionPorEstado = {
            [EstadoPedido.PENDIENTE]: 'Pendiente de confirmación del vendedor',
            [EstadoPedido.CONFIRMADO]: 'Confirmado - En proceso de entrega',
            [EstadoPedido.EN_REVISION]: 'En revisión por el vendedor',
            [EstadoPedido.ENTREGADO]: 'Pedido entregado exitosamente',
            [EstadoPedido.CANCELADO]: 'Pedido cancelado'
        }

        return {
            actual: estado,
            descripcion: descripcionPorEstado[estado] || 'Estado desconocido'
        }
    }

    calcularEntrega(pedido) {
        const diasEntrega = pedido?.paquete?.diasDeEntrega
        const fechaCreacion = pedido?.fechaCreacion

        if (pedido?.estado !== EstadoPedido.CONFIRMADO || typeof diasEntrega !== 'number' || !(fechaCreacion instanceof Date)) {
            return {
                diasEntregaEsperados: null,
                entregarEn: 'Pendiente de confirmación'
            }
        }

        const fechaEntrega = new Date(fechaCreacion)
        fechaEntrega.setDate(fechaEntrega.getDate() + diasEntrega)

        const ahora = new Date()
        const msPorDia = 1000 * 60 * 60 * 24
        const diasRestantes = Math.ceil((fechaEntrega.setHours(0, 0, 0, 0) - ahora.setHours(0, 0, 0, 0)) / msPorDia)

        return {
            diasEntregaEsperados: diasEntrega,
            entregarEn: diasRestantes <= 0 ? 'Entrega hoy' : `${diasRestantes} día${diasRestantes === 1 ? '' : 's'}`
        }
    }

    formatearPedido(pedido) {
        if (!pedido) return null

        const pedidoBase = {
            id: pedido.id,
            cliente: pedido.cliente,
            gig: pedido.gig,
            paquete: pedido.paquete,
            total: pedido.total,
            requerimientos: pedido.requerimientos || '',
            fechaCreacion: pedido.fechaCreacion,
            estado: this.formatearEstado(pedido.estado),
            mensajes: (pedido.mensajes || []).map((mensaje) => this.formatearMensaje(mensaje)),
            ...this.calcularEntrega(pedido)
        }

        return pedidoBase
    }

    formatearMensaje(mensaje) {
        return {
            usuario: mensaje.usuario,
            mensaje: mensaje.mensaje,
            fechaEnvio: mensaje.fechaEnvio
        }
    }

    validarMensaje(datosMensaje) {
        if (!datosMensaje || typeof datosMensaje !== 'object' || Array.isArray(datosMensaje)) {
            throw new BadRequestError('Los datos del mensaje son inválidos')
        }

        const { usuario, mensaje } = datosMensaje

        if (!usuario || typeof usuario !== 'object' || Array.isArray(usuario)) {
            throw new UnprocessableEntityError('El usuario del mensaje es requerido')
        }

        if (typeof mensaje !== 'string' || mensaje.trim() === '') {
            throw new UnprocessableEntityError('El mensaje es requerido')
        }
    }

    async crearPedido(datosPedido) {
        await this.validarDatosPedido(datosPedido)

        const { cliente, gig, paquete, total, estado = EstadoPedido.PENDIENTE, requerimientos = '' } = datosPedido

        const pedido = new Pedido(null, cliente, gig, paquete, total, new Date(), estado, requerimientos, [])
        const pedidoCreado = await this.repository.crear(pedido)

        return this.formatearPedido(pedidoCreado)
    }

    async agregarOpinionAPedido(idPedido, datosOpinion) {
        if (idPedido === '' || idPedido === null || idPedido === undefined || (typeof idPedido !== 'string' && typeof idPedido !== 'number')) {
            throw new UnprocessableEntityError('El ID del pedido es requerido')
        }

        const pedidoExistente = this.repository.obtenerPorId(idPedido)
        if (!pedidoExistente) {
            return null
        }

        if (pedidoExistente.estado !== EstadoPedido.ENTREGADO) {
            throw new UnprocessableEntityError('Solo se pueden agregar opiniones a pedidos entregados')
        }

        if (!datosOpinion || typeof datosOpinion !== 'object' || Array.isArray(datosOpinion)) {
            throw new BadRequestError('Los datos de la opinión son inválidos')
        }

        const { usuario, puntuacion, comentario } = datosOpinion
        if (!usuario || typeof usuario !== 'object' || Array.isArray(usuario)) {
            throw new UnprocessableEntityError('El usuario de la opinión es requerido')
        }

        if (typeof puntuacion !== 'number' || !Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
            throw new UnprocessableEntityError('La puntuación debe ser un número entero entre 1 y 5')
        }

        if (typeof comentario !== 'string' || comentario.trim() === '') {
            throw new UnprocessableEntityError('El comentario es requerido')
        }

        const opinion = new Opinion(
            (pedidoExistente.gig.opiniones?.length || 0) + 1,
            usuario,
            pedidoExistente.gig,
            puntuacion,
            comentario,
            new Date()
        )

        const gigActualizado = gigRepository.agregarOpinion(pedidoExistente.gig.id, opinion)
        if (!gigActualizado) {
            throw new NotFoundError(`Gig con ID ${pedidoExistente.gig.id} no encontrado`) 
        }

        return {
            pedido: this.formatearPedido(pedidoExistente),
            opinion: {
                id: opinion.id,
                cliente: opinion.cliente,
                puntuacion: opinion.puntuacion,
                comentario: opinion.comentario,
                fecha: opinion.fecha
            }
        }
    }

    obtenerTodosPedidos() {
        const pedidos = this.repository.obtenerTodos()
        return pedidos.map(pedido => this.formatearPedido(pedido))
    }

    obtenerPedidoPorId(id) {
        if (id === '' || id === null || id === undefined || (typeof id !== 'string' && typeof id !== 'number')) {
            throw new UnprocessableEntityError('El ID del pedido es requerido')
        }

        const pedido = this.repository.obtenerPorId(id)
        return this.formatearPedido(pedido)
    }

    obtenerMensajesPedido(idPedido) {
        if (idPedido === '' || idPedido === null || idPedido === undefined || (typeof idPedido !== 'string' && typeof idPedido !== 'number')) {
            throw new UnprocessableEntityError('El ID del pedido es requerido')
        }

        const pedido = this.repository.obtenerPorId(idPedido)
        if (!pedido) {
            return null
        }

        return (pedido.mensajes || []).map((mensaje) => this.formatearMensaje(mensaje))
    }

    obtenerPedidosPorCliente(clienteId) {
        if (clienteId === '' || clienteId === null || clienteId === undefined || (typeof clienteId !== 'string' && typeof clienteId !== 'number')) {
            throw new UnprocessableEntityError('El ID del cliente es requerido')
        }

        const pedidos = this.repository.obtenerPorCliente(clienteId)
        return pedidos.map(pedido => this.formatearPedido(pedido))
    }

    obtenerPedidosPorGig(gigId) {
        if (gigId === '' || gigId === null || gigId === undefined || (typeof gigId !== 'string' && typeof gigId !== 'number')) {
            throw new UnprocessableEntityError('El ID del gig es requerido')
        }

        const pedidos = this.repository.obtenerPorGig(gigId)
        return pedidos.map(pedido => this.formatearPedido(pedido))
    }

    async agregarMensajePedido(idPedido, datosMensaje) {
        this.validarMensaje(datosMensaje)

        const mensaje = {
            usuario: datosMensaje.usuario,
            mensaje: datosMensaje.mensaje,
            fechaEnvio: new Date()
        }

        const pedidoActualizado = this.repository.agregarMensaje(idPedido, mensaje)
        return this.formatearPedido(pedidoActualizado)
    }

    async cancelarPedido(idPedido) {
        if (idPedido === '' || idPedido === null || idPedido === undefined || (typeof idPedido !== 'string' && typeof idPedido !== 'number')) {
            throw new UnprocessableEntityError('El ID del pedido es requerido')
        }

        const pedidoExistente = this.repository.obtenerPorId(idPedido)
        if (!pedidoExistente) {
            return null
        }

        if (pedidoExistente.estado === EstadoPedido.ENTREGADO) {
            throw new UnprocessableEntityError('No se puede cancelar un pedido que ya fue entregado')
        }

        const pedidoCancelado = this.repository.actualizarEstado(idPedido, EstadoPedido.CANCELADO)
        return this.formatearPedido(pedidoCancelado)
    }

    async cambiarEstado(idPedido, nuevoEstado) {
        if (typeof nuevoEstado !== 'string' || !Object.values(EstadoPedido).includes(nuevoEstado)) {
            throw new UnprocessableEntityError(
                `Estado inválido: ${nuevoEstado}. Debe ser uno de: ${Object.values(EstadoPedido).join(', ')}`
            )
        }

        const pedidoActualizado = this.repository.actualizarEstado(idPedido, nuevoEstado)
        return this.formatearPedido(pedidoActualizado)
    }
}
