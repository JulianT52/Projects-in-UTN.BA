import mongoose from 'mongoose';
import { Paciente } from '../domain/paciente.js';

const pacienteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    dni: { type: String, required: true, unique: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    obraSocial: { type: mongoose.Schema.Types.ObjectId, ref: 'ObraSocial', default: null },
    plan: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { 
    timestamps: true
});

pacienteSchema.loadClass(Paciente);

export const PacienteModel = mongoose.model('Paciente', pacienteSchema);