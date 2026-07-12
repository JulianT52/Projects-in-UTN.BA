import express from "express";
import { EspecialidadesController } from "../controllers/EspecialidadController.js";
import { EspecialidadesService } from "../services/EspecialidadesService.js";
import { EspecialidadesRepository } from "../repositories/EspecialidadesRepository.js";
import { MedicoRepository } from "../repositories/medicoRepository.js";

const especilidadesRepository = new EspecialidadesRepository();
const medicoRepository = new MedicoRepository();

const especialidadesService = new EspecialidadesService(especilidadesRepository, medicoRepository);
const especialidadesController = new EspecialidadesController({ especialidadesService });
const especialidadesRouter = express.Router();

especialidadesRouter.route('/')
    .get((req,res,next) => especialidadesController.obtenerEspecialidades(req,res,next));

export default especialidadesRouter;