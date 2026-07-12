import express from "express"
import { PedidoController } from "../controllers/pedidoController.js"
import { PedidoService } from "../services/pedidoService.js"
import { PedidoRepository } from "../repositories/pedidoRepository.js"
import validateSchema from "../middlewares/validateSchema.js"
import { 
    pedidoCreateSchema, 
    cambiarEstadoSchema, 
    idParamSchema, 
    clienteIdParamSchema,
    gigIdParamSchema,
    mensajePedidoSchema,
    opinionPedidoSchema
} from "../middlewares/validationZod/pedidoSchema.js"

const router = express.Router()

const pedidoRepository = new PedidoRepository()
const pedidoService = new PedidoService(pedidoRepository)
const pedidoController = new PedidoController(pedidoService)

router.route('/')
    .post(validateSchema(pedidoCreateSchema), (req, res, next) => pedidoController.crearPedido(req, res, next))
    .get((req, res, next) => pedidoController.obtenerTodosPedidos(req, res, next))

router.route('/cliente/:clienteId')
    .get(validateSchema(clienteIdParamSchema), (req, res, next) => pedidoController.obtenerPedidosPorCliente(req, res, next))

router.route('/gig/:gigId')
    .get(validateSchema(gigIdParamSchema), (req, res, next) => pedidoController.obtenerPedidosPorGig(req, res, next))

router.route('/:id/mensajes')
    .post(validateSchema(mensajePedidoSchema), (req, res, next) => pedidoController.agregarMensajePedido(req, res, next))
    .get(validateSchema(idParamSchema), (req, res, next) => pedidoController.obtenerMensajesPedido(req, res, next))

router.route('/:id/opiniones')
    .post(validateSchema(opinionPedidoSchema), (req, res, next) => pedidoController.agregarOpinionPedido(req, res, next))

router.route('/:id/cancelar')
    .patch(validateSchema(idParamSchema), (req, res, next) => pedidoController.cancelarPedido(req, res, next))

router.route('/:id/estado')
    .patch(validateSchema(cambiarEstadoSchema), (req, res, next) => pedidoController.cambiarEstadoPedido(req, res, next))

router.route('/:id')
    .get(validateSchema(idParamSchema), (req, res, next) => pedidoController.obtenerPedidoPorId(req, res, next))

export default router
