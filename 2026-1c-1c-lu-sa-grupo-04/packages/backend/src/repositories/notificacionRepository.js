import { BadRequestError, UnprocessableEntityError } from "../errors/errores.js";
import { Notificacion } from "../domain/notificacion.js";
import { NotificacionModel } from "../models/notificacionModel.js";
import { TurnoModel } from "../models/TurnoModel.js";

export class NotificacionRepository{
    
    async obtenerPorId(id) {
        return await NotificacionModel.findById(id);
    }

    async obtenerSinLeerUsuario(usuario){
        return await NotificacionModel.find({usuario: usuario, leida: false});
    }

    async obtenerLeidasUsuario(usuario){
        return await NotificacionModel.find({usuario: usuario, leida: true});
    }

    async actualizarALeida(id){
        return await NotificacionModel.findByIdAndUpdate(
            id, 
            { leida: true },
            { new: true }
        );
    }

    async guardarNotificacion(notificacion){
        try {
        if(notificacion._id){
            return await NotificacionModel.findByIdAndUpdate(notificacion._id, notificacion, {new: true});
        }
        
        const nuevaNotificacion = new NotificacionModel(notificacion);
        const notificacionGuardada = await nuevaNotificacion.save();

        return notificacionGuardada;
        } catch (error){
            throw new Error ("Error al guarda la notificación");
        }
    }
}