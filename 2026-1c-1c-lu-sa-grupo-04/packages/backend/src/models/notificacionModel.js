import mongoose from 'mongoose';
import { Notificacion } from "../domain/notificacion.js";

const notificacionSchema = new mongoose.Schema({
    usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true},
    mensaje: {type: String, required: true },
    leida: { type:Boolean, default: false }
}, {
    timestamps: true
});

notificacionSchema.loadClass(Notificacion);

export const NotificacionModel = mongoose.model('Notificacion', notificacionSchema);