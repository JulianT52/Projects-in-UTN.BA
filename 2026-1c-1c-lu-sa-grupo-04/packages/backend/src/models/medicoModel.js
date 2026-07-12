import mongoose from 'mongoose';
import { Medico } from '../domain/medico.js';
import { especialidadSchema } from './EspacialidadModel.js';    

const medicoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    matricula: { type: String, required: true },
    usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true},
    especialidades: [especialidadSchema], 
    sedes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sede' }],
    disponibilidades: [{
        diaSemana: String,
        horaDesde: String,
        horaHasta: String,
        sede: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede' },
    }],
}, { 
    timestamps: true 
});

medicoSchema.loadClass(Medico);
export const MedicoModel = mongoose.model('Medico', medicoSchema);