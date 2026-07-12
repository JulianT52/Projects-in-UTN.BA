import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/errores.js";

export class AuthService {
    
    constructor({ usuarioRepository, pacienteRepository, medicoRepository } = {}) {
        this.usuarioRepository = usuarioRepository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
    }

    async login(nombreUsuario, password) {
        const usuario = await this.usuarioRepository.obtenerPorNombreUsuario(nombreUsuario);
        if (!usuario) {
            throw new UnauthorizedError("Usuario o contraseña incorrectos");
        }

        const passwordOk = await bcrypt.compare(password, usuario.password);
        if (!passwordOk) {
            throw new UnauthorizedError("Usuario o contraseña incorrectos");
        }

        const paciente = await this.pacienteRepository.obtenerPorUsuario(usuario._id);
        const medico = await this.medicoRepository.obtenerPorUsuario(usuario._id);

        let pacienteId = null;
        if (paciente) {
            pacienteId = paciente._id;
        }

        let medicoId = null;
        if (medico) {
            medicoId = medico._id;
        }
        let rol = null;
        if (paciente) {
            rol = "PACIENTE";
        } else if (medico) {
            rol = "MEDICO";
        }

        let persona = null;
        if (paciente) {
            persona = paciente;
        } else if (medico) {
            persona = medico;
        }

        let nombre = null;
        let apellido = null;
        let dni = null;
        let obraSocial = null;
        let plan = null;

        if (persona) {
            nombre = persona.nombre;
            apellido = persona.apellido;
        }

        if (paciente) {
            const perfil = await this.pacienteRepository.obtenerPerfilPorId(paciente._id);
            if (perfil) {
                dni = perfil.dni;
                obraSocial = perfil.obraSocial;
                plan = perfil.plan;
            }
        }

        const payload = {
            usuarioId: usuario._id,
            nombreUsuario: usuario.nombreUsuario,
            rol,
            pacienteId,
            medicoId,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

        return {
            token,
            usuario: {
                id: usuario._id,
                nombreUsuario: usuario.nombreUsuario,
                nombre,
                apellido,
                dni,
                obraSocial,
                plan,
                rol,
                pacienteId,
                medicoId,
            },
        };
    }
}
