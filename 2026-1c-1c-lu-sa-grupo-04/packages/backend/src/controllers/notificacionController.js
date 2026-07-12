import { NotificacionService } from "../services/notificacionService.js";

export class NotificacionController {
    constructor({
        notificacionService
    } = {}){
        this.notificacionService = notificacionService;
    }

    create = async (req, res, next) => {
        try {
            const nuevaNotificacion = await this.notificacionService.create(req.validated);
            
            return res.status(201).json({
                status: "success",
                data: nuevaNotificacion
            })
        } catch (error){
            return next(error);
        }
    }

    obtenerSinLeer = async (req, res, next) => {
        try {
            const { id } = req.validated;
            const notificaciones = await this.notificacionService.obtenerSinLeer(id)
            
            return res.status(200).json({status: "success", data: notificaciones})
        } catch (error){
            return next(error);
        }
    }

    obtenerLeidas = async (req, res, next) => {
        try {
            const { id } = req.validated;
            const notificaciones = await this.notificacionService.obtenerLeidas(id)
            
            return res.status(200).json({status: "success", data: notificaciones})
            
        } catch (error){
            return next(error);
        }
    }

    marcarComoLeida = async (req, res, next) => {
        try {
            const { id } = req.validated;
            const notificacionActualizada = await this.notificacionService.marcarComoLeida(id);

            return res.status(200).json({status: "success", data: notificacionActualizada})
        } catch (error){
            return next(error);
        }
    }
}
