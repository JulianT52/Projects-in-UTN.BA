import bcrypt from "bcryptjs";
import { Usuario } from '../domain/usuario.js';
import { BadRequestError, ConflictError } from '../errors/errores.js';

export class UsuarioService {
    constructor({usuarioRepository} = {}) {
        this.usuarioRepository = usuarioRepository;
    }

/*
-------------------------------------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------USUARIOS--------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

    async create(datos) {
        await this.validarDatosUsuario(datos);

        const passwordHasheada = await bcrypt.hash(datos.password, 10);

        const usuario = new Usuario(datos.nombreUsuario, passwordHasheada);

        return await this.usuarioRepository.guardarUsuario(usuario);
    }

/*
-------------------------------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------VALIDACIONES------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

    async validarDatosUsuario(datos) {
        if (!datos.nombreUsuario || typeof datos.nombreUsuario !== 'string') {
            throw new BadRequestError("El nombre de usuario es obligatorio y debe ser texto");
        }

        const existe = await this.usuarioRepository.obtenerPorNombreUsuario(datos.nombreUsuario);

        if (existe) {
            throw new ConflictError(`El nombre de usuario '${datos.nombreUsuario}' ya está en uso`);
        }
    }
}