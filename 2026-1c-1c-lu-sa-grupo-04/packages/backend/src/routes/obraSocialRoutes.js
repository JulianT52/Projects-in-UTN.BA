import express from "express";
import { ObraSocialController } from "../controllers/obraSocialController.js";
import { ObraSocialService } from "../services/obraSocialService.js";
import { ObraSocialRepository } from "../repositories/obraSocialRepository.js";
import validateSchema from "../middlewares/validateSchema.js";
import { obraSocialSchema } from "../middlewares/validationZod/obraSocialSchema.js";

const router = express.Router();
const controller = new ObraSocialController({
    obraSocialService: new ObraSocialService({ 
        obraSocialRepository: new ObraSocialRepository() 
    })
});

router.post("/", validateSchema(obraSocialSchema), (req, res, next) => controller.crear(req, res, next));
router.get("/", (req, res, next) => controller.obtenerObrasSociales(req, res, next));
export default router;
