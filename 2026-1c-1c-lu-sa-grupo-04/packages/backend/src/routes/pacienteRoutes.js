import express from "express"
import { PacienteController } from "../controllers/PacienteController.js"
import { PacienteService } from "../services/pacienteService.js"
import { PacienteRepository } from "../repositories/PacienteRepository.js"
import { NotificacionRepository } from "../repositories/notificacionRepository.js"
import { NotificacionService } from "../services/notificacionService.js"
import { UsuarioService } from "../services/UsuarioService.js"
import { UsuarioRepository } from "../repositories/UsuarioRepository.js"
import { TurnoService } from "../services/turnoService.js"
import { TurnoRepository } from "../repositories/TurnoRepository.js"
import { FactoryNotificacion } from "../domain/factoryNotificacion.js"
import validateSchema from "../middlewares/validateSchema.js"
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { checkRol } from "../middlewares/checkRol.js"
import { pacienteSchema } from "../middlewares/validationZod/pacienteSchema.js"
import { cancelacionBodySchema, solicitarCambioBodySchema, resolverCambioBodySchema } from "../middlewares/validationZod/turnoSchema.js"
import { idParamSchema, pacienteTurnoParamsSchema } from "../middlewares/validationZod/commonSchema.js"

const router = express.Router()

const usuarioRepository = new UsuarioRepository();
const usuarioService = new UsuarioService({ usuarioRepository });

const turnoRepository = new TurnoRepository();
const turnoService = new TurnoService({ turnoRepository });

const notificacionRepository = new NotificacionRepository();
const factoryNotificacion = new FactoryNotificacion();
const notificacionService = new NotificacionService({ notificacionRepository, factoryNotificacion });

const pacienteRepository = new PacienteRepository();
const pacienteService = new PacienteService({ pacienteRepository, usuarioService, turnoService, notificacionService, factoryNotificacion });
const pacienteController = new PacienteController({ pacienteService });

router.route('/')
    .post(validateSchema(pacienteSchema), (req, res, next) => pacienteController.create(req, res, next));

router.route('/:id')
    .get(
        authMiddleware,
        checkRol(['PACIENTE']),
        validateSchema({ params: idParamSchema }),
        (req, res, next) => pacienteController.obtenerPerfil(req, res, next)
    );

router.route('/:id/turnos')
    .get(
        authMiddleware,
        checkRol(['PACIENTE']),
        validateSchema({ params: idParamSchema }), (req, res, next) => pacienteController.obtenerHistorial(req, res, next));

router.route('/:id/turnos/:turnoId/cancelacion')
    .post(
        authMiddleware,
        checkRol(['PACIENTE']),
        validateSchema({ params: pacienteTurnoParamsSchema, body: cancelacionBodySchema }),
        (req, res, next) => pacienteController.cancelarTurno(req, res, next)
    );

router.route('/:id/turnos/:turnoId/solicitud-cambio')
    .post(
        authMiddleware,
        checkRol(['PACIENTE']),
        validateSchema({ params: pacienteTurnoParamsSchema, body: solicitarCambioBodySchema }),
        (req, res, next) => pacienteController.solicitarCambioFecha(req, res, next)
    )
    .patch(
        authMiddleware,
        checkRol(['PACIENTE']),
        validateSchema({ params: pacienteTurnoParamsSchema, body: resolverCambioBodySchema }),
        (req, res, next) => pacienteController.resolverPropuestaCambio(req, res, next)
    );

export default router
