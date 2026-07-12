import { Pedido } from "../domain/pedido.js"
import { EstadoPedido } from "../domain/estadoPedido.js"

export class PedidoRepository {
    constructor() {
        this.pedidos = new Map()
        this.idCounter = 1 
    }


    crear(pedido) {
        const id = this.idCounter++
        pedido.id = id
        this.pedidos.set(id, pedido)
        return pedido
    }


    obtenerTodos() {
        return Array.from(this.pedidos.values())
    }

    obtenerPorId(id) {
        return this.pedidos.get(Number(id)) || null
    }

    obtenerPorCliente(clienteId) {
        return this.obtenerTodos().filter(pedido => pedido.cliente.id === Number(clienteId))
    }

    obtenerPorGig(gigId) {
        return this.obtenerTodos().filter(pedido => pedido.gig.id === Number(gigId))
    }

    agregarMensaje(pedidoId, mensaje) {
        const pedido = this.obtenerPorId(pedidoId)
        if (!pedido) return null

        pedido.mensajes = pedido.mensajes || []
        pedido.mensajes.push(mensaje)
        return pedido
    }

    actualizarEstado(id, nuevoEstado) {
        const pedido = this.obtenerPorId(id)
        if (pedido) {
            pedido.estado = nuevoEstado
        }
        return pedido
    }

    eliminar(id) {
        return this.pedidos.delete(Number(id))
    }

    limpiar() {
        this.pedidos.clear()
        this.idCounter = 1
    }
}
