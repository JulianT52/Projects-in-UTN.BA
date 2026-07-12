import express from "express"
import validateSchema from "../middlewares/validateSchema.js"
import { ClienteController } from "../controllers/clienteController.js"
import { ClienteService } from "../services/clienteService.js"
import { ClienteRepository } from "../repositories/clienteRepository.js"
import { loginSchema } from "../middlewares/validationZod/authSchema.js"

const router = express.Router()
const clienteRepository = new ClienteRepository()
const clienteService = new ClienteService(clienteRepository)
const clienteController = new ClienteController(clienteService)

router.route('/')
    .post((req, res) => clienteController.registrar(req, res))

router.route('/login')
    .post(validateSchema(loginSchema), (req, res) => clienteController.iniciarSesion(req, res))

export default router