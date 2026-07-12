import { Plan } from './plan.js';

export class ObraSocial {
    constructor(nombre, id = null) {
        this.id = id || "GeneratedRandomString";
        this.nombre = nombre;
        this.planes = []; 
    }

    static reconstituir(datosMongo) {
        if (!datosMongo) return null;
        const os = new ObraSocial(datosMongo.nombre, datosMongo._id.toString());
        os.planes = (datosMongo.planes || []).map(p => Plan.reconstituir(p));
        return os;
    }

    agregarPlan(plan) {
        if(!(plan instanceof Plan)) throw new Error("El plan debe ser de tipo Plan");
        this.planes.push(plan);
    }
}