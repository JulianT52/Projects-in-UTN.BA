import mongoose from "mongoose";

export const catalogoEspecialidadSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true},
}, { timestamps: true });

export const CatalogoEspecialidadModel = mongoose.model("Catalogo de especialidades", catalogoEspecialidadSchema);