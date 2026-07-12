import express from "express";
import { NotificacionController } from "../controllers/notificacionController.js";
import { NotificacionService } from "../services/notificacionService.js";
import { NotificacionRepository } from "../repositories/notificacionRepository.js";
import validateSchema from "../middlewares/validateSchema.js";
import { notificacionSchema } from "../middlewares/validationZod/notificacionSchema.js";
import { idParamSchema } from "../middlewares/validationZod/commonSchema.js";
import { FactoryNotificacion } from "../domain/factoryNotificacion.js"

const router = express.Router();

const notificacionRepository = new NotificacionRepository();
const factoryNotifaccion = new FactoryNotificacion();
const notificacionService = new NotificacionService({notificacionRepository, factoryNotifaccion});
const notificacionController = new NotificacionController({notificacionService});

router.route('/')
    .post(validateSchema(notificacionSchema), (req, res, next) => notificacionController.create(req, res, next)); 

router.route('/usuario/:id/sin-leer')
    .get(validateSchema({ params: idParamSchema }), (req, res, next) => notificacionController.obtenerSinLeer(req, res, next));

router.route('/usuario/:id/leidas')
    .get(validateSchema({ params: idParamSchema }), (req, res, next) => notificacionController.obtenerLeidas(req, res, next));

router.route('/:id/leer')
   .patch(validateSchema({ params: idParamSchema }), (req, res, next) => notificacionController.marcarComoLeida(req, res, next)); 

export default router;
