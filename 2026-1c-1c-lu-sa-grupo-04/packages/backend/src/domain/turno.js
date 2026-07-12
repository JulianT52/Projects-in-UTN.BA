import {EstadoTurno} from './estadoTurno.js';
import { CambioEstadoTurno } from './cambioEstadoTurno.js';
import { Medico } from './medico.js';
import { Paciente } from './paciente.js';
import { Practica } from './practica.js';
import { Especialidad } from './especialidad.js';
import { Sede } from './sede.js'


export class Turno{

    constructor(idMedico, fechaHora, sede, costo){
        if((typeof idMedico !== "string")) throw new Error("El medico no es valido");
        if(!fechaHora) throw new Error("La fecha y hora no es valida"); //Aca quizas se deberia verificar que sea un formato de fecha y hora valido
        if (!(sede instanceof Sede)) throw new Error("La sede no es válida");
        if(costo < 0) throw new Error("El costo no puede ser negativo");

        // No ponemos la practica ni la especialidad debido a que cuando se genera el turno, no se sabe quien lo toma o no. 
        // No es necesario que el paciente se pase por constructor ya que puede ser un turno libre que un paciente puede o no tomar, cuando se crea un turno, se crea en base a si esta disponible o no
        this.idMedico = idMedico;
        this.fechaHora = fechaHora;
        this.servicio = null;
        this.estado = EstadoTurno.DISPONIBLE; // Cuando instanciamos el turno, lo dejamos como disponible. 
        this.historialEstados = [];
        this.costo = costo;       
    }

    asignarTurno(paciente, servicio){
        if(this.estado !== EstadoTurno.DISPONIBLE) throw new Error(`El estado del turno es: ${this.estado}, no puede asignarse`);
        if(!(paciente instanceof Paciente)) throw new Error("El paciente no es valido");
        if((servicio instanceof Practica)){
            this.practica = servicio;
        }
        else{
            if((servicio instanceof Especialidad)){
                this.especialidad = servicio;
            }
        else {
        throw new Error("La practica o especialidad no es valida"); 
    }
   }
    this.paciente = paciente;
    this.actualizarEstado(EstadoTurno.RESERVADO, paciente, "Reservar Turno");
    return this;
   }


actualizarEstado(nuevoEstado, actor, motivo) {

    if(!Object.values(EstadoTurno).includes(nuevoEstado)) throw new Error("El estado del turno no es valido");
    
    const nuevoCambio = new CambioEstadoTurno(
        new Date(), 
        nuevoEstado,  
        this,         
        actor,        
        motivo 
    ); 
    this.estado = nuevoEstado;
    this.historialEstados.push(nuevoCambio);
    }
}

