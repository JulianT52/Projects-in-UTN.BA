import { SedeService } from "../services/sedeService.js";

export class SedeController {
    constructor({ sedeService } = {}) {
        this.sedeService = sedeService;
    }
    crear = async (req, res, next) => {
        try {
            const resultado = await this.sedeService.crearSede(req.validated);
            res.status(201).json(resultado);
        } catch (error) {
            next(error);
        }
    }
    obtenerTodas = async (req, res, next) => {
        try {
            const sedes = await this.sedeService.obtenerTodas();
            res.status(200).json({ status: "success", data: sedes });
        } catch (error) {
            next(error);
        }
    }
}
