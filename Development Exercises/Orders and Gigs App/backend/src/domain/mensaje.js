import express from "express"
import { Usuario } from "./usuario.js"

export class Mensaje {
    constructor(usuario, mensaje, fechaEnvio){
        this.usuario = usuario
        this.mensaje = mensaje
        this.fechaEnvio = fechaEnvio
    }
}
