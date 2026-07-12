import { ObraSocialModel } from "../models/ObraSocialModel.js";


export class ObraSocialRepository {
    async guardar(datos) {
        try {
            const nuevaOS = new ObraSocialModel(datos);
            return await nuevaOS.save();
        } catch (error) {
            throw new Error("Error al guardar Obra Social: " + error.message);
        }
    }

    async obtenerPorId(id) {
        return await ObraSocialModel.findById(id)
            .populate('planes.coberturasEspecialidad.especialidad')
            .populate('planes.coberturasPractica.practica');
    }

    async obtenerTodas() {
        return await ObraSocialModel.find();
    }
}