import mongoose from "mongoose";
import { NivelCobertura } from "../domain/nivelCobertura.js";

const coberturaEspecialidadSchema = new mongoose.Schema({

    especialidad: { type: mongoose.Schema.Types.ObjectId, ref: 'Especialidad', required: true },
    nivel: { type: String, enum: Object.values(NivelCobertura), required: true }

}, { _id: false });

const coberturaPracticaSchema = new mongoose.Schema({

    practica: { type: mongoose.Schema.Types.ObjectId, ref: 'Practica', required: true },
    nivel: { type: String, enum: Object.values(NivelCobertura), required: true }

}, { _id: false });

const planSchema = new mongoose.Schema({
    
    nombre: { type: String, required: true },
    coberturasEspecialidad: [coberturaEspecialidadSchema],
    coberturasPractica: [coberturaPracticaSchema],

});

const obraSocialSchema = new mongoose.Schema({
    
    nombre: { type: String, required: true, unique: true },
    planes: [planSchema],

}, { timestamps: true });

export const ObraSocialModel = mongoose.model("ObraSocial", obraSocialSchema);