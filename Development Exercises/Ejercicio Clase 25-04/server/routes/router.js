import express from "express"
import productoRouter from "./productoRoutes.js"

const router = express.Router()

// Configuración de paths bases para cada recurso
router.use('/productos', productoRouter)



export default router