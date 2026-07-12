import express from "express";
import { TurnoController } from "../controllers/TurnoController.js";
import { TurnoService } from "../services/turnoService.js";
import { TurnoRepository } from "../repositories/TurnoRepository.js";
import { PacienteRepository } from "../repositories/PacienteRepository.js";
import { NotificacionRepository } from "../repositories/notificacionRepository.js";
import { NotificacionService } from "../services/notificacionService.js";
import { FactoryNotificacion } from "../domain/factoryNotificacion.js";
import validateSchema from "../middlewares/validateSchema.js";
import { buscarDisponiblesQuerySchema, reservarTurnoBodySchema, cotizarTurnoQuerySchema } from "../middlewares/validationZod/turnoSchema.js";
import { idParamSchema } from "../middlewares/validationZod/commonSchema.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
const turnosRepository = new TurnoRepository();
const pacienteRepository = new PacienteRepository();

const notificacionRepository = new NotificacionRepository();
const factoryNotificacion = new FactoryNotificacion();
const notificacionService = new NotificacionService({ notificacionRepository, factoryNotificacion });

const turnosService = new TurnoService({ turnoRepository: turnosRepository, pacienteRepository, notificacionService });
const turnosController = new TurnoController({ turnosService });

router.route('/disponibles')
    .get(
        authMiddleware,
        validateSchema({ query: buscarDisponiblesQuerySchema }),
        (req, res, next) => turnosController.buscarDisponibles(req, res, next)
    );

router.route('/:turnoId/reservar')
    .patch(
        authMiddleware,
        validateSchema({ body: reservarTurnoBodySchema }),
        (req, res, next) => turnosController.reservarTurno(req, res, next)
    );

router.route('/:turnoId/cotizar')
    .get(
        authMiddleware,
        validateSchema({ query: cotizarTurnoQuerySchema }),
        (req, res, next) => turnosController.cotizarTurno(req, res, next)
    );

router.route('/:id/turnos')
    .get(validateSchema({ params: idParamSchema }), (req, res, next) => turnosController.obtenerHistorial(req, res, next));

export default router;
