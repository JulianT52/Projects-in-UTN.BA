export class Especialidad {
    constructor(nombre, practicas = []){
        if (!nombre) throw new Error("El nombre de la especialidad es obligatorio");

        this.nombre = nombre
        this.practicas = practicas
    }

    static reconstituir(datosMongo) {
        if (!datosMongo) return null;
        const especialidad = new Especialidad(
            datosMongo.nombre,
            datosMongo.practicas ?? []
        );
        especialidad.id = datosMongo._id?.toString();
        return especialidad;
    }
}