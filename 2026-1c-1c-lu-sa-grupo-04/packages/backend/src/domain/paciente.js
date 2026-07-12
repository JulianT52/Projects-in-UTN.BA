export class Paciente {

    constructor(usuarioId, dni, nombre, apellido, obraSocial, plan) {
        if (!dni) throw new Error("El DNI del paciente es obligatorio");
        if (!nombre) throw new Error("El nombre del paciente es obligatorio");
        if (plan && !obraSocial) throw new Error("No se puede asignar un plan sin una obra social");

        //Me parece que es opcional tener una obra social pero si te llega un plan debes tener una obra social
        //Faltaria hacer una validacion para que si llega un plan, la obra social no sea null me parece
    
        this.usuario = usuarioId;
        this.dni = dni;
        this.nombre = nombre;
        this.apellido = apellido;
        this.obraSocial= obraSocial;
        this.plan = plan;        
    }

    static reconstituir(datosMongo, planDominio) {
        const paciente = new Paciente(
            datosMongo.usuario,
            datosMongo.dni,
            datosMongo.nombre,
            datosMongo.apellido,
            datosMongo.obraSocial,
            planDominio
        );
        paciente._id = datosMongo._id;
        return paciente;
    }
}
