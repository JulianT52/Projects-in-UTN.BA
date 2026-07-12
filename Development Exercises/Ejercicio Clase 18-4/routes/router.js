import express from "express"
import productRouter from "./productRoutes.js"

const router = express.Router()

router.use('/productos', productRouter)

export default router