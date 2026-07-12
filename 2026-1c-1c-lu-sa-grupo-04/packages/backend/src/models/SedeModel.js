import mongoose from 'mongoose';

const SedeSchema = new mongoose.Schema({

    nombre: {type: String, required: true},
    direccion: {type: String, required: true}
    
}, { timestamps: true });

export const SedeModel = mongoose.model('Sede', SedeSchema);