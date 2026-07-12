import express from "express"

export const EstadoPedido = Object.freeze({
    PENDIENTE: "PENDIENTE",
    CONFIRMADO: "CONFIRMADO",
    EN_REVISION: "EN_REVISION",
    ENTREGADO: "ENTREGADO",
    CANCELADO: "CANCELADO",
});
