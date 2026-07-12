import { CatalogoEspecialidadModel } from "../models/CatalogoEspecialidadModel.js";

export class EspecialidadesRepository {

    async findAll(){
        return await CatalogoEspecialidadModel.find()
    }

    async guardarEspecialidad(especialidad) {
        try {
            const existente = await CatalogoEspecialidadModel.findOne({
                nombre: especialidad.nombre.trim()
            }).collation({ locale: 'es', strength: 1 });

            if (existente) {
                return existente;
            }

            const nuevaEspecialidad = new CatalogoEspecialidadModel({ nombre: especialidad.nombre.trim() });
            await nuevaEspecialidad.save();
            return nuevaEspecialidad;
        } catch (error) {
            console.error("Error al guardar la especialidad:", error.message);
            throw error;
        }
    }
}
