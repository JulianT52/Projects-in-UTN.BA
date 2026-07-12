import express from "express"
import medicoRouter from "./medicoRoutes.js"
import healthcheckRouter from "./healthcheckRoutes.js"
import pacienteRouter from "./pacienteRoutes.js"
import notificacionRouter from "./notificacionRoutes.js"
import sedeRouter from "./sedeRoutes.js"
import obraSocialRouter from "./obraSocialRoutes.js"
import turnosRouter from "./turnosRoutes.js"
import authRouter from "./authRoutes.js"
import especialidadesRouter from "./especialidadesRouter.js"


const router = express.Router()

// Configuración de paths bases para cada recurso
router.use('/medico', medicoRouter)
router.use('/health', healthcheckRouter)
router.use('/paciente', pacienteRouter)
router.use('/notificacion', notificacionRouter)
router.use('/sede', sedeRouter)
router.use('/obraSocial', obraSocialRouter)
router.use('/turnos', turnosRouter)
router.use('/auth', authRouter)
router.use('/especialidades', especialidadesRouter)



export default router