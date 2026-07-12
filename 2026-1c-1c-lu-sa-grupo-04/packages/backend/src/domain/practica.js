export class Practica {
    
    constructor(codigo, nombre, duracionEnMins, costo, idEspecialidad) {
        if(duracionEnMins < 0) throw new Error("La duracion no puede ser negativa");
        if(!nombre) throw new Error("El campo nombre se encuentra vacio");
        if(!codigo) throw new Error("El campo codigo se encuentra vacio");
        if(costo < 0) throw new Error("El costo no puede ser negativo");
        if(idEspecialidad < 0 || !idEspecialidad) throw new Error("El id tiene que ser mayor a 0");
        
        this.codigo = codigo;
        this.nombre = nombre;
        this.duracionEnMins = duracionEnMins;
        this.costo = costo;
        this.idEspecialidad = idEspecialidad;
    }

    static reconstituir(datosMongo) {
        if (!datosMongo) return null;
        const practica = Object.create(Practica.prototype);
        practica.codigo = datosMongo.codigo;
        practica.nombre = datosMongo.nombre;
        practica.duracionEnMins = datosMongo.duracionEnMins;
        practica.costo = datosMongo.costo;
        practica.idEspecialidad = datosMongo.idEspecialidad;
        practica.id = datosMongo._id?.toString();
        return practica;
    }
}