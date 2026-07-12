import express from "express"
import { SedeRepository } from "../repositories/sedeRepository.js";
import { Sede } from "../domain/sede.js";


export class SedeService {
    constructor({ sedeRepository } = {}) {
        this.sedeRepository = sedeRepository;
    }
    async crearSede(datos) {
        return await this.sedeRepository.guardar(datos);
    }
    async obtenerTodas() {
        return await this.sedeRepository.obtenerTodas();
    }
}