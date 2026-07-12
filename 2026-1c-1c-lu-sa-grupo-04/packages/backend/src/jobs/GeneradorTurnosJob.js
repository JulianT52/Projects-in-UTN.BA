import cron from "node-cron";
import express from "express"
import { MedicoRepository } from "../repositories/medicoRepository.js";
import { TurnoService } from "../services/turnoService.js";
import { TurnoRepository } from "../repositories/TurnoRepository.js";

const turnoRepository = new TurnoRepository();
const medicoRepository = new MedicoRepository();
const turnoService = new TurnoService({turnoRepository});
let ejecutando = false;

async function generarTurnosPendientes(){
    if (ejecutando){
        console.log("El job ya está corriendo")
        return;
    }

    ejecutando = true;

    try {
        console.log("Iniciando generación batch de turnos...");
        const medicos = await medicoRepository.findAll();

        for (const medico of medicos) {
            try {
                await turnoRepository.eliminarTurnosDisponibles(medico._id);
                await turnoService.create(medico._id, medico.disponibilidades);
            } catch (error) {
                console.log(`Error con médico ${medico._id}: ` + error.message);
            }
        }
        console.log("Proceso batch finalizado");
    } finally {
        ejecutando = false;
    }
}

    function convertirMedicoSchemaAObjeto(medicoDoc){
        const data = medicoDoc.toObject();
        const medico = new Medico(data.usuario, data.matricula, data.nombre, data.apellido);
        Object.assign(medico, data);
        medico._id = medicoDoc._id;
        return medico;
    }

       export function iniciarCronTurnos(){
        cron.schedule('0 3 * * *',() => {
            generarTurnosPendientes();
        })
        console.log("Cron Job de turnos iniciado")
    }