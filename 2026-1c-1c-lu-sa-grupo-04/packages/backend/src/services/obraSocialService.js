import express from "express"
import { ObraSocialRepository } from "../repositories/obraSocialRepository.js";

export class ObraSocialService {
    constructor({ obraSocialRepository } = {}) {
        this.obraSocialRepository = obraSocialRepository;
    }
    async crearObraSocial(datos) {
        return await this.obraSocialRepository.guardar(datos);
    }

    async obtenerObrasSociales() {
        return await this.obraSocialRepository.obtenerTodas();
    }
}