import express from "express"
import { MedicoController } from "../controllers/medicoController.js"
import { MedicoService } from "../services/medicoService.js"
import { MedicoRepository } from "../repositories/medicoRepository.js"
import { UsuarioService } from "../services/UsuarioService.js"
import { UsuarioRepository } from "../repositories/UsuarioRepository.js"
import { EspecialidadesService } from "../services/EspecialidadesService.js"
import { EspecialidadesRepository } from "../repositories/EspecialidadesRepository.js"
import { TurnoController } from "../controllers/TurnoController.js"
import { TurnoService } from "../services/turnoService.js"
import { TurnoRepository} from "../repositories/TurnoRepository.js"
import { ServicioRepository } from "../repositories/ServicioRepository.js"
import { FactoryNotificacion } from "../domain/factoryNotificacion.js"
import { NotificacionRepository } from "../repositories/notificacionRepository.js"
import { NotificacionService } from "../services/notificacionService.js"
import validateSchema from '../middlewares/validateSchema.js'
import { medicoSchema, disponibilidadesQuerySchema, buscarMedicoQuerySchema } from '../middlewares/validationZod/medicoSchema.js'
import { disponibilidadesSchema, eliminarDisponibilidadSchema } from '../middlewares/validationZod/disponibilidadSchema.js'
import { cancelacionBodySchema, propuestaCambioBodySchema, resolverCambioBodySchema } from '../middlewares/validationZod/turnoSchema.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { checkRol } from "../middlewares/checkRol.js"
import { idParamSchema, medicoPacienteParamsSchema, medicoEspecialidadParamsSchema, medicoTurnoParamsSchema } from '../middlewares/validationZod/commonSchema.js'
import { especialidadSchema, idEspecialidadQuerySchema } from '../middlewares/validationZod/especialidadSchema.js'
import { practicaSchema } from "../middlewares/validationZod/practicaSchema.js"

const router = express.Router()

const especialidadesRepository = new EspecialidadesRepository()
const especialidadesService = new EspecialidadesService(especialidadesRepository)
const servicioRepository = new ServicioRepository()

const turnoRepository = new TurnoRepository()
const turnoService = new TurnoService({turnoRepository});
const turnoController = new TurnoController({turnoService});

const usuarioRepository = new UsuarioRepository();
const usuarioService = new UsuarioService({ usuarioRepository });

const notificacionRepository = new NotificacionRepository();
const factoryNotificacion = new FactoryNotificacion();
const notificacionService = new NotificacionService({ notificacionRepository, factoryNotificacion });

const medicoRepository = new MedicoRepository();
const medicoService = new MedicoService({ medicoRepository, usuarioService, turnoService, turnoRepository, servicioRepository, factoryNotificacion, notificacionService, especialidadesService});
const medicoController = new MedicoController({ medicoService });


router.route('/')
    .post(validateSchema(medicoSchema), (req, res, next) => medicoController.crearMedico(req, res, next))
    .get(validateSchema({ query: buscarMedicoQuerySchema }), (req, res, next) => medicoController.buscarPorNombre(req, res, next))

router.route('/disponibilidades')
    .get(authMiddleware, checkRol(['MEDICO']),validateSchema({ query: disponibilidadesQuerySchema }), (req,res,next) => medicoController.findAll(req,res,next))
    .post(authMiddleware, checkRol(['MEDICO']),validateSchema(disponibilidadesSchema), (req,res,next) => medicoController.crearDisponibilidades(req,res,next))
    .patch(authMiddleware, checkRol(['MEDICO']),validateSchema(disponibilidadesSchema), (req,res,next) => medicoController.actualizarDisponibilidades(req,res,next))
    .delete(authMiddleware, checkRol(['MEDICO']),validateSchema(eliminarDisponibilidadSchema), (req,res,next) => medicoController.eliminarDisponibilidad(req,res,next))

router.route('/:id/servicios')
    .get(
        validateSchema({ params: idParamSchema }),
        (req, res, next) => medicoController.obtenerServicios(req, res, next)
    );

router.route('/:id/especialidades')
.post(
    authMiddleware, 
    checkRol(['MEDICO']),
    validateSchema({ params: idParamSchema, body: especialidadSchema }),
    (req, res, next) => medicoController.addEspecialidad(req, res, next)
)
.patch(
    authMiddleware, 
    checkRol(['MEDICO']),
    validateSchema({ params: idParamSchema, query: idEspecialidadQuerySchema, body: especialidadSchema }),
    (req, res, next) => medicoController.updateEspecialidad(req, res, next)
)
.delete(
    authMiddleware, 
    checkRol(['MEDICO']),
    validateSchema({ params: idParamSchema, query: idEspecialidadQuerySchema}),
    (req, res, next) => medicoController.removeEspecialidad(req, res, next)
);

router.route('/:id/especialidades/:idEspecialidad/practicas')
    .post(
        authMiddleware, 
        checkRol(['MEDICO']),
        validateSchema({ params: medicoEspecialidadParamsSchema, body: practicaSchema }),
        (req, res, next) => medicoController.addPractica(req, res, next)
    );

router.route('/:id/especialidades/:idEspecialidad/practicas/:idPractica')
    .patch(
        authMiddleware, 
        checkRol(['MEDICO']),
        validateSchema({ params: medicoEspecialidadParamsSchema, body: practicaSchema }), // ← Agregale los params acá
        (req, res, next) => medicoController.updatePractica(req, res, next)
    )
    .delete(
        authMiddleware, 
        checkRol(['MEDICO']),
        validateSchema({ params: medicoEspecialidadParamsSchema }), // ← Agregale la validación de params aquí
        (req, res, next) => medicoController.removePractica(req, res, next)
    )

router.route('/:id/pacientes/:pacienteId/historial')
    .get(
        authMiddleware, 
        checkRol(['MEDICO']),
        validateSchema({ params: medicoPacienteParamsSchema }),
        (req, res, next) => medicoController.consultarHistorialPaciente(req, res, next)
    );

router.route('/:id/historialPacientes')
    .get(
        authMiddleware, 
        checkRol(['MEDICO']),
        validateSchema({ params: idParamSchema }),
        (req, res, next) => medicoController.obtenerPacientes(req, res, next)
    );

router.route('/:id/turnos/:turnoId/realizacion')
    .post(
        authMiddleware, 
        checkRol(['MEDICO']),
        validateSchema({ params: medicoTurnoParamsSchema }),
        (req, res, next) => medicoController.marcarTurnoRealizado(req, res, next)
    );

router.route('/:id/turnos/:turnoId/cancelacion')
    .post(
        authMiddleware, 
        checkRol(['MEDICO']),
        validateSchema({ params: medicoTurnoParamsSchema, body: cancelacionBodySchema }),
        (req, res, next) => medicoController.cancelarTurno(req, res, next)
    );

router.route('/:id/turnos/:turnoId/propuesta-cambio')
    .post(
        authMiddleware, 
        checkRol(['MEDICO']),
        validateSchema({ params: medicoTurnoParamsSchema, body: propuestaCambioBodySchema }),
        (req, res, next) => medicoController.proponerModificacionFecha(req, res, next)
    )
    .patch(
        authMiddleware, 
        checkRol(['MEDICO']),
        validateSchema({ params: medicoTurnoParamsSchema, body: resolverCambioBodySchema }),
        (req, res, next) => medicoController.resolverSolicitudCambio(req, res, next)
    );

    router.route('/:id/turnos')
    .get(
        authMiddleware, 
        checkRol(['MEDICO']),
        validateSchema({ params: idParamSchema }),
        (req, res, next) => medicoController.obtenerTurnos(req, res, next)
    );
    
export default router
