import express from "express"
import clienteRouter from "./clienteRoutes.js"
import freelancerRouter from "./freelancerRoutes.js"
import pedidosRouter from "./pedidosRoutes.js"
import gigsRouter from "./gigsRoutes.js"

const router = express.Router()

router.use('/cliente', clienteRouter)
router.use('/freelancer', freelancerRouter)
router.use('/pedidos', pedidosRouter)
router.use('/gigs', gigsRouter)

export default router