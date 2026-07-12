import { Especialidad } from './especialidad.js';

export class CoberturaEspecialidad {
    constructor(especialidad, nivel) {
        if(!(especialidad instanceof Especialidad)) throw new Error("La especialidad debe ser de tipo Especialidad");
        this.especialidad = especialidad;
        this.nivel = nivel;
    }
}