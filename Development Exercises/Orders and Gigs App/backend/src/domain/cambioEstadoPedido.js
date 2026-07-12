import express from "express"
import { Pedido } from "./pedido.js"
import { Usuario } from "./usuario.js"
import { EstadoPedido } from "./estadoPedido.js"

export class CambioEstadoPedido {
    constructor(id, pedido, estado, quien, fecha, razon){
        this.id = id
        this.pedido = pedido
        this.estado = estado
        this.quien = quien
        this.fecha = fecha
        this.razon = razon
    }
}
