import { Practica } from './practica.js';

export class CoberturaPractica {
    constructor(practica, nivel){
        if(!(practica instanceof Practica)) throw new Error("La practica debe ser de tipo practica");
        this.practica = practica;
        this.nivel = nivel;
    }
}