import { Medico } from "../domain/medico.js";
import { DisponibilidadHoraria } from "../domain/disponibilidadHoraria.js";
import { BadRequestError, UnprocessableEntityError } from "../errors/errores.js";
import { MedicoModel } from "../models/medicoModel.js";
import { UsuarioModel } from "../models/UsuarioModel.js";

export class MedicoRepository {
        
/*
-------------------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------MEDICOS----------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

    async findAll() {
        return await MedicoModel.find();
    }

    async buscarPorNombreOApellido(nombre, limit = 20) {
        return await MedicoModel.find({
            $or: [
                { nombre: { $regex: nombre, $options: 'i' } },
                { apellido: { $regex: apellido, $options: 'i' } }
            ]
        }).limit(limit);
    }

    async guardarMedico(medico) {
        this.validarMedico(medico);

        const dataParaGuardar = {...medico, usuario: medico.usuario._id || medico.usuario.id || medico.usuario};

        try {
            if (medico._id) {
                return await MedicoModel.findByIdAndUpdate(medico._id, dataParaGuardar, { new: true });
            }

        const nuevoMedico = new MedicoModel(dataParaGuardar);
        return await nuevoMedico.save();
    } catch (error) {
            throw new Error("Error al guardar el medico: " + error.message);
        }
    }

/*
-------------------------------------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------DISPONIBILIDADES------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

    async guardarDisponibilidades(id, disponibilidades) {
        this.validarDisponibilidades(disponibilidades);
        try {
            const medicoDoc = await MedicoModel.findById(id);
            if (!medicoDoc) throw new Error("Médico no encontrado");

            const medicoDomain = new Medico(
            medicoDoc.usuario, 
            medicoDoc.matricula, 
            medicoDoc.nombre, 
            medicoDoc.apellido
        );

        medicoDomain.disponibilidades = medicoDoc.disponibilidades;
        disponibilidades.forEach(disponibilidad => {
            medicoDomain.definirDisponibilidad(disponibilidad);
        });

        medicoDoc.disponibilidades = medicoDomain.disponibilidades;
        return await medicoDoc.save();

        } catch (error) {
            throw new Error("Error al agregar disponibilidades a la BD: " + error.message);
        }
    }




/*
-------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------USUARIOS-------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

    async obtenerPorUsuarioId(idUsuarioBuscado) {
        try{
            return await UsuarioModel.findById(idUsuarioBuscado);
        }catch{
            throw new Error("No existe usuario asociado a ese ID")
        }
        
    }

    async obtenerPorUsuario(usuarioId) {
        return await MedicoModel.findOne({ usuario: usuarioId });
    }

    async obtenerPorId(id) {
        try {
        // Buscamos en la colección de médicos, que es la que tiene las especialidades
            return await MedicoModel.findById(id); 
        } catch (error) {
            throw new Error("Error al buscar el médico en la base de datos");
        }
    }

/*
-------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------VALIDACIONES---------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

    validarMedico(medico) {
        if(!(medico instanceof Medico))
            throw new UnprocessableEntityError("El médico es inválido");
    }

    validarDisponibilidades(disponibilidades) {
        disponibilidades.forEach((disponibilidad, index) => {
           if (!(disponibilidad instanceof DisponibilidadHoraria))
                throw new UnprocessableEntityError()
        })     
    }


/*
-------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------ESPECIALIDADES---------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

async obtenerEspecialidadesConConteo() {
    return await MedicoModel.aggregate([
        { $unwind: "$especialidades" },
        { 
            $group: {
                _id: "$especialidades.nombre", // Agrupa por nombre exacto
                medicosUnicos: { $addToSet: "$_id" }
            }
        }
    ]);
}

}