import mongoose from 'mongoose';
import { Usuario } from '../domain/usuario.js';

export const usuarioSchema = new mongoose.Schema({
    nombreUsuario: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { 
    timestamps: true
});

usuarioSchema.loadClass(Usuario);

export const UsuarioModel = mongoose.model('Usuario', usuarioSchema);