import { Especialidad } from './especialidad.js';
import { Practica } from './practica.js';
import { NivelCobertura } from './nivelCobertura.js';

export class Plan {
    constructor(nombre, id = null) {
        this.id = id || "GeneratedRandomString";        
        this.nombre = nombre;
        this.coberturasEspecialidad = [];
        this.coberturasPractica = [];
    }

    static reconstituir(datosMongo) {
        if (!datosMongo) return null;
        const plan = new Plan(datosMongo.nombre, datosMongo._id.toString()); 
        plan.coberturasEspecialidad = datosMongo.coberturasEspecialidad || [];
        plan.coberturasPractica = datosMongo.coberturasPractica || [];
        
        return plan;
    }


    obtenerCoberturaE(especialidad) {
        if (!(especialidad instanceof Especialidad)) {
            throw new Error("La especialidad debe ser de tipo Especialidad");
        }

        const cobertura = this.coberturasEspecialidad.find(c => {
            const idEnCobertura = c.especialidad._id || c.especialidad;    
            return idEnCobertura.toString() === especialidad.id.toString() || 
                   idEnCobertura.toString() === especialidad._id?.toString();
        });

        return cobertura ? cobertura.nivel : NivelCobertura.NO_CUBIERTA;
    }

    obtenerCoberturaP(practica) {
        if (!(practica instanceof Practica)) {
            throw new Error("La practica debe ser de tipo Practica");
        }

        const cobertura = this.coberturasPractica.find(c => {
            const idEnCobertura = c.practica._id || c.practica;
            return idEnCobertura.toString() === practica.id.toString() || 
                   idEnCobertura.toString() === practica._id?.toString();
        });

        return cobertura ? cobertura.nivel : NivelCobertura.NO_CUBIERTA;
    }
}