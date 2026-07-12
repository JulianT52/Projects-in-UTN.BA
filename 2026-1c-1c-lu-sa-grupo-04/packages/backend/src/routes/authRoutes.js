import express from "express";
import { AuthController } from "../controllers/authController.js";
import { AuthService } from "../services/AuthService.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { PacienteRepository } from "../repositories/PacienteRepository.js";
import { MedicoRepository } from "../repositories/medicoRepository.js";

const router = express.Router();

const usuarioRepository = new UsuarioRepository();
const pacienteRepository = new PacienteRepository();
const medicoRepository = new MedicoRepository();
const authService = new AuthService({ usuarioRepository, pacienteRepository, medicoRepository });
const authController = new AuthController({ authService });

router.post("/login", (req, res, next) => authController.login(req, res, next));

export default router;
