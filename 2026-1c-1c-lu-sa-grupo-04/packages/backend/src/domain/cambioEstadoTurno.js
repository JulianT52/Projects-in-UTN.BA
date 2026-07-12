import { EstadoTurno } from './estadoTurno.js';
import { Turno } from './turno.js';

export class CambioEstadoTurno {
    constructor(fechaHoraIngreso, estado, turno, usuario, motivo) {
        if(!Object.values(EstadoTurno).includes(estado)) throw new Error("El estado del turno no es valido");
        if(!fechaHoraIngreso || !(fechaHoraIngreso instanceof Date)) throw new Error ("La fecha de ingreso es vacia o es de otro tipo de dato");
        if(!(turno instanceof Turno)) throw new Error ("El turno debe ser de tipo Turno");

        this.fechaHoraIngreso = fechaHoraIngreso;
        this.estado = estado;
        this.turno = turno;
        this.usuario = usuario;
        this.motivo = motivo;
    }
}