import mongoose from "mongoose";

export const practicaSchema = new mongoose.Schema({
    codigo: { 
        type: String, 
        required: true, 
        unique: true, 
        sparse: true 
    },
    nombre: { type: String, required: true },
    duracionEnMins: { type: Number },  
    costo: { type: Number, required: true, min: 0 },
}, { timestamps: true });

export const PracticaModel = mongoose.model('Practica', practicaSchema);