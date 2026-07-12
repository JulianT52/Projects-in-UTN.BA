export class Sede {
    
    constructor(nombre, direccion) {

        if(!nombre) throw new Error("El campo nombre se encuentra vacio");
        if(!direccion) throw new Error("El campo direccion se encuentra vacio");
        this.nombre = nombre;
        this.direccion = direccion;
    }

    static reconstituir(datosMongo) {
        if (!datosMongo) return null;
        return new Sede(datosMongo.nombre, datosMongo.direccion, datosMongo._id.toString());
    }
    
}
