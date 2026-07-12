import express from "express"
import validateSchema from "../middlewares/validateSchema.js"
import { FreelancerController } from "../controllers/freelancerController.js"
import { FreelancerService } from "../services/freelancerService.js"
import { FreelancerRepository} from "../repositories/freelancerRepository.js"
import { loginSchema } from "../middlewares/validationZod/authSchema.js"

const router = express.Router()
const freelancerRepository = new FreelancerRepository();
const freelancerService = new FreelancerService(freelancerRepository)
const freelancerController = new FreelancerController(freelancerService)

router.route('/')
    .post((req, res) => freelancerController.registrar(req, res))

router.route('/login')
    .post(validateSchema(loginSchema), (req, res) => freelancerController.iniciarSesion(req, res))

export default router