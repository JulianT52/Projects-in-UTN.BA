import mongoose from "mongoose";
import { practicaSchema } from "./PracticaModel.js";

export const especialidadSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    practicas: [practicaSchema],
}, { timestamps: true });

export const EspecialidadModel = mongoose.model("Especialidad", especialidadSchema);