import express from "express";
import { SedeController } from "../controllers/sedeController.js";
import { SedeService } from "../services/sedeService.js";
import { SedeRepository } from "../repositories/sedeRepository.js";
import validateSchema from "../middlewares/validateSchema.js";
import { sedeSchema } from "../middlewares/validationZod/sedeSchema.js";

const router = express.Router();
const sedeController = new SedeController({ 
    sedeService: new SedeService({ sedeRepository: new SedeRepository() }) 
});

router.post("/", validateSchema(sedeSchema), (req, res, next) => sedeController.crear(req, res, next));
router.get("/", (req, res, next) => sedeController.obtenerTodas(req, res, next));

export default router;
