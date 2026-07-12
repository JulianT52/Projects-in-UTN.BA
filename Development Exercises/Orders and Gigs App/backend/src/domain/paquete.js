import express from "express"

export class Paquete {
    constructor(nombre, precio, diasDeEntrega){
        this.nombre = nombre
        this.precio = precio
        this.diasDeEntrega = diasDeEntrega
    }
}