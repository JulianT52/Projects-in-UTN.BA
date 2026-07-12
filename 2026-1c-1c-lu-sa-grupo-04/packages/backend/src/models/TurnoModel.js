import mongoose from "mongoose";
import { EstadoTurno } from "../domain/estadoTurno.js";

const cambioEstadoTurnoSchema = new mongoose.Schema({
  fechaHoraIngreso: { type: Date, default: Date.now },
  estado: { type: String, enum: Object.values(EstadoTurno), required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  motivo: { type: String }
}, {_id: false }); 

const turnoSchema = new mongoose.Schema({
    medico: { type: mongoose.Schema.Types.ObjectId, ref: 'Medico', required: true },
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', default: null },
    fechaHora: { type: Date , required: true },
    sede: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede', default: null },
    especialidad: { type: mongoose.Schema.Types.ObjectId }, 
    practica: { type: mongoose.Schema.Types.ObjectId },    
    estado: { type: String, enum: Object.values(EstadoTurno),  default: EstadoTurno.DISPONIBLE },
    historialEstados: [cambioEstadoTurnoSchema],
    costo: { type: Number, default: 0 },
    fechaPropuesta: { type: Date, default: null },
    cambioPropuestoPor: { type: String, enum: ['PACIENTE', 'MEDICO'] }

}, { timestamps: true });

export const TurnoModel = mongoose.model("Turno", turnoSchema);