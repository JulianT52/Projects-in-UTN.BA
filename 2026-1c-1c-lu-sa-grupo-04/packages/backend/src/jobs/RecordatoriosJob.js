import cron from "node-cron";
import express from "express"
import { TurnoRepository } from "../repositories/TurnoRepository.js";
import { NotificacionService } from "../services/notificacionService.js";
import { FactoryNotificacion } from "../domain/factoryNotificacion.js";
import { EstadoTurno } from "../domain/estadoTurno.js"
import { NotificacionRepository } from "../repositories/notificacionRepository.js";

const turnoRepository = new TurnoRepository();
const notificacionService = new NotificacionService({NotificacionRepository, FactoryNotificacion});
const factoryNotificacion = new FactoryNotificacion();

let ejecutando = false; 

async function generarRecordatorios() {
    if(ejecutando){
        console.log("El job de recordatorios ya está corriendo")
        return;
    }

    ejecutando = true;

    try{
        console.log("Iniciando generación batch de recordatorios...");
        const hoy = new Date();
        const inicioManana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1, 0, 0, 0);
        const finManana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1, 23, 59, 59);
    
        const turnosDeManana = await turnoRepository.obtenerTurnosPorRangoDeFechas(inicioManana, finManana);
        
        const turnosValidos = turnosDeManana.filter(turno => 
            turno.estado === EstadoTurno.RESERVADO 
        );
        
        if (turnosValidos.length === 0){
            console.log("No hay turnos para recordar");
        }

        for (const turno of turnosValidos) {
            try {
                const notificaciones = factoryNotificacion.crearRecordatorio(turno);

                for (const notif of notificaciones) {

                    const destinatarioId = notif.destinatario._id || notif.destinatario;
                    
                    const datosNotificacion = {
                        usuario: destinatarioId.toString(),
                        mensaje: notif.mensaje
                    };
                    
                    await notificacionService.create(datosNotificacion);
                }
            } catch (error) {
                console.error(`Error al generar recordatorio para el turno ${turno._id}: ${error.message}`);
            }
        }
        console.log("Proceso batch de recordatorios finalizado con éxito.");
    } catch (error) {
        console.error("Error global crítico en el job de recordatorios:", error.message);
    } finally {
        ejecutando = false;
    }
}

export function iniciarCronRecordatorios(){
    cron.schedule('0 14 * * *', () => {
        generarRecordatorios();
    });
    console.log("Cron Job de Recordatorios iniciado")
}