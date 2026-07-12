import { UsuarioModel } from "../models/UsuarioModel.js";

export class UsuarioRepository {
    
    async guardarUsuario(usuario){
        const nuevoUsuario = new UsuarioModel(usuario);

        return await nuevoUsuario.save();
    }

    async obtenerPorId(id) {
        return await UsuarioModel.findById(id);
    }

    async obtenerPorNombreUsuario(nombre) {
        return await UsuarioModel.findOne({ nombreUsuario: nombre });
    }
}