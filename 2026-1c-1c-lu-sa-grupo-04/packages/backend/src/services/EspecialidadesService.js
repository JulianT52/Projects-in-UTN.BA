import express from "express"

export class EspecialidadesService{
    constructor(especialidadesRepository, medicoRepository) {
        this.especialidadesRepository = especialidadesRepository;
        this.medicoRepository = medicoRepository;
    }

    findAll = async(req,res,next) =>{
        try{
            return await this.especialidadesRepository.findAll()
        }
        catch(error){
            next(error)
        }
    }

    async guardarEspecialidad(especialidad){
        return await this.especialidadesRepository.guardarEspecialidad(especialidad)
    }


    async obtenerResumenEspecialidades() {
    const data = await this.medicoRepository.obtenerEspecialidadesConConteo();
    
    return data.map(esp => {
        const idNormalizado = esp._id.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(" ")[0];

        return {
            id: idNormalizado,
            nombre: esp._id,
            desc: `Atención y tratamiento especializado en ${esp._id.toLowerCase()}.`,
            medicos: esp.medicosUnicos.length
        };
    }).sort((a, b) => a.nombre.localeCompare(b.nombre));
}
} 