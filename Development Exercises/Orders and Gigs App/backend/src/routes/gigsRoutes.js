import express from "express"
import validateSchema from "../middlewares/validateSchema.js"
import { GigController } from "../controllers/gigController.js"
import { GigService } from "../services/gigService.js"
import { gigRepository } from "../repositories/gigRepository.js"
import { gigSearchSchema, gigCreateSchema, gigIdParamSchema, categoriaIdParamSchema } from "../middlewares/validationZod/gigSchema.js"

const router = express.Router()
const gigService = new GigService(gigRepository)
const gigController = new GigController(gigService)

router.route('/')
    .get(validateSchema(gigSearchSchema), (req, res) => gigController.obtenerGigs(req, res))
    .post(validateSchema(gigCreateSchema), (req, res) => gigController.crearGig(req, res))

router.route('/categoria/:categoriaId')
    .get(validateSchema(categoriaIdParamSchema), (req, res) => gigController.obtenerGigsPorCategoria(req, res))

router.route('/:id')
    .get(validateSchema(gigIdParamSchema), (req, res) => gigController.obtenerGigPorId(req, res))

export default router
