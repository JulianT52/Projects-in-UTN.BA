import { DiaSemana } from './diaSemana.js';

//duda, valido la parte del request en medicoSchema pero aca validamos de otra manera
export class DisponibilidadHoraria {
    constructor(diaSemana, horaDesde, horaHasta, sede){
        if(!Object.values(DiaSemana).includes(diaSemana)) throw new Error("El dia de la semana no es valido");
        if(horaDesde >= horaHasta) throw new Error (`${horaDesde} debe ser anterior a ${horaHasta}`);
        if(!sede) throw new Error("La sede es obligatoria");
        this.diaSemana = diaSemana;
        this.horaDesde = horaDesde;
        this.horaHasta = horaHasta;
        this.sede = sede;
    }
}