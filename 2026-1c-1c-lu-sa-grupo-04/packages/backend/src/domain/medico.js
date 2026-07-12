import { DisponibilidadHoraria } from "./disponibilidadHoraria.js";
import crypto from "crypto";

export class Medico{

    constructor(usuario, matricula, nombre, apellido){

        if (!usuario) throw new Error("El medico debe tener un usuario asociado");
        if (!matricula) throw new Error("La matricula del medico es obligatoria");
        if (!nombre) throw new Error("El nombre del medico es obligatorio");
        if (!apellido) throw new Error("El apellido del medico es obligatorio");

        this.usuario = usuario;
        this.matricula = matricula;
        this.nombre = nombre;
        this.apellido = apellido;
        this.especialidades = [];
        this.sedes = [];
        this.disponibilidades = []; 
        // Consideramos que cuando se instancia la clase medico, es necesario que tambien se instancien las especialidades, practicas, sedes y disponibilidades. 
    }

    definirDisponibilidad(disponibilidadHoraria){
        if(!disponibilidadHoraria) throw new Error("La disponibilidad horaria es obligatoria");
        if(!(disponibilidadHoraria instanceof DisponibilidadHoraria)){
            throw new Error("Debe ser una instancia de DisponibilidadHoraria");
        }

        this.disponibilidades.push(disponibilidadHoraria);
    }

    agregarEspecialidad(datosEspecialidad) {
        this.especialidades.push(datosEspecialidad);
    }

    quitarEspecialidad(idEspecialidad) {
        const idAFiltrar = idEspecialidad.toString();

        if (typeof this.especialidades.pull === 'function') {
            this.especialidades.pull(idEspecialidad);
        } else {
            this.especialidades = this.especialidades.filter(e => {
                const idActual = e._id || e.id;
                return idActual && idActual.toString() !== idAFiltrar;
            });
        }   
    }

    modificarEspecialidad(idEspecialidad, nuevosDatos) {
        const especialidad = typeof this.especialidades.id === 'function'
            ? this.especialidades.id(idEspecialidad)
            : this.especialidades.find(e => (e._id || e.id)?.toString() === idEspecialidad.toString());

        if (!especialidad) throw new Error("Especialidad no encontrada");

        if (nuevosDatos.nombre !== undefined) especialidad.nombre = nuevosDatos.nombre;
        if (nuevosDatos.practicas !== undefined) especialidad.practicas = nuevosDatos.practicas;
    }

    agregarPractica(nuevaPractica){ 
        const especialidad = this.findById(nuevaPractica.idEspecialidad)
        if (!especialidad)
            throw new Error ("Especialidad no encontrada");
        this.removeEspecialidad(nuevaPractica.idEspecialidad);
        especialidad.practicas.push(nuevaPractica);
        this.especialidades.push(especialidad);
    }

    findById(id) {
        return this.especialidades.find((especialidad) => especialidad._id.toString() === id.toString()) || null;
    }

    removeEspecialidad(idEspecialidad){
        this.especialidades = this.especialidades.filter(
        (especialidad) => especialidad._id.toString() !== idEspecialidad.toString()
        );
    }

    modificarPractica(idEspecialidad, idPractica, nuevosDatos) {
        const especialidad = this.findById(idEspecialidad);
        if (!especialidad) throw new Error("Especialidad no encontrada");
        if (!especialidad.practicas) throw new Error("La especialidad no tiene prácticas asociadas");

        const practica = especialidad.practicas.find(p => {
            if (!p) return false;
            const idActual = p._id || p.id;
            return idActual && idActual.toString() === idPractica.toString();
        });
        
        if (!practica) throw new Error("Práctica no encontrada en esta especialidad");

        if (nuevosDatos.codigo !== undefined) practica.codigo = nuevosDatos.codigo;
        if (nuevosDatos.nombre !== undefined) practica.nombre = nuevosDatos.nombre;
        if (nuevosDatos.duracionEnMins !== undefined) practica.duracionEnMins = nuevosDatos.duracionEnMins;
        if (nuevosDatos.costo !== undefined) practica.costo = nuevosDatos.costo;
    }

    quitarPractica(idEspecialidad, idPractica) {
        const specialty = this.findById(idEspecialidad);
        if (!specialty) throw new Error("Especialidad no encontrada");
        if (!specialty.practicas) return;

        specialty.practicas = specialty.practicas.filter(p => {
            if (!p) return false;
            const idActual = p._id || p.id;
            return !idActual || idActual.toString() !== idPractica.toString();
        });
    }
}
