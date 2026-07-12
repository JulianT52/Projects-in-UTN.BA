import express from "express"
import { Notificacion } from "../domain/notificacion.js";
import { NotificacionRepository } from "../repositories/notificacionRepository.js"
import { BadRequestError, UnprocessableEntityError, ConflictError } from "../errors/errores.js";

export class NotificacionService{
    constructor({
        notificacionRepository = new NotificacionRepository(),
        factoryNotificacion 
    } = {}) {
        this.notificacionRepository = notificacionRepository;
        this.factoryNotificacion = factoryNotificacion;
    }

/*
-------------------------------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------NOTIFICACIONES------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/
    async create(datos){
        await this.validarNotificacion(datos);
        return await this.notificacionRepository.guardarNotificacion(datos);
    }

    async procesarNotificacionTurno(turno, idDestinatario){
        try {
            const notificacionDominio = this.factoryNotificacion.crearSegunEstadoTurno(turno);
            
            const datos = {
                usuario: idDestinatario.toString(),
                mensaje: notificacionDominio.mensaje
            };
            
            await this.create(datos);
        } catch (error) {
            console.error(`Error interno al procesar notificación (Turno ID: ${turno._id}):`, error.message);
        }
    }
    
/*
-------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------SERVICIOS------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/
    async obtenerSinLeer(usuario){
        if(!usuario){
            throw new BadRequestError("El ID del usuario es obligatorio");
        }
        return await this.notificacionRepository.obtenerSinLeerUsuario(usuario);
    }

    async obtenerLeidas(usuario){
        if(!usuario){
            throw new BadRequestError("El ID del usuario es obligatorio");
        }
        return await this.notificacionRepository.obtenerLeidasUsuario(usuario);
    }

    async marcarComoLeida(notificacionId){
        if(!notificacionId){
            throw new BadRequestError("El ID de la notificacion es obligatorio");
        }
        const notificacion = await this.notificacionRepository.obtenerPorId(notificacionId);

        if(!notificacion){
            throw new UnprocessableEntityError("La notificación solicitada no existe");
        }
        if(notificacion.leida === true) return notificacion

        notificacion.leida = true; 
        return await this.notificacionRepository.actualizarALeida(notificacionId);
    }

/*
-------------------------------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------VALIDACIONES------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

    validarNotificacion(datosNotifacion){
        const { usuario, mensaje } = datosNotifacion;

        if (!usuario || typeof usuario !== "string" || usuario.trim().length === 0){
            throw new UnprocessableEntityError("El ID del usuario es inválido o está vacío");
        }
        if (!mensaje || typeof mensaje !== "string" || mensaje.trim().length === 0){
            throw new UnprocessableEntityError("El mensaje es inválido o está vacío");
        }
    }

}