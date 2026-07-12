import { Paciente } from "../domain/paciente.js";
import { PacienteModel } from "../models/PacienteModel.js";
import { TurnoModel } from "../models/TurnoModel.js";
import { BadRequestError, UnprocessableEntityError } from "../errors/errores.js";
import { Plan } from "../domain/plan.js";

export class PacienteRepository {

    async guardarPaciente(paciente) {
        this.validarPaciente(paciente);
        try {
            // Si el objeto paciente ya tiene un _id de MongoDB, lo actualiza
            if (paciente._id) {
                return await PacienteModel.findByIdAndUpdate(paciente._id, paciente, { new: true } );
            }
            const nuevoPaciente = new PacienteModel(paciente)
            const pacienteGuardado = await nuevoPaciente.save();
            return pacienteGuardado;

        }catch(error){
            throw new Error("Error al guardar el paciente: " + error.message)
        }
    }

/*
-------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------GETTERS--------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

    async obtenerPorId(id) {
        try {
            const pacienteDoc = await PacienteModel.findById(id)
                .populate('usuario')
                .populate('obraSocial');

            if (!pacienteDoc) return null;
            
            const planDoc = pacienteDoc.plan ? pacienteDoc.obraSocial?.planes?.find(p => p._id.toString() === pacienteDoc.plan.toString()): null;

            const planDominio = Plan.reconstituir(planDoc);
            return Paciente.reconstituir(pacienteDoc, planDominio);

        } catch (error) {
            throw new Error("Error al obtener el paciente: " + error.message);
        }
    }

    async obtenerPorDni(dni) {
        try {
            return await PacienteModel.findOne({ dni: dni });
        } catch (error) {
            throw new Error("Error al buscar el DNI: " + error.message);
        }
    }

    async obtenerPorUsuario(usuarioId) {
        return await PacienteModel.findOne({ usuario: usuarioId });
    }

    async obtenerPerfilPorId(id) {
        try {
            const paciente = await PacienteModel.findById(id)
                .populate("usuario", "nombreUsuario")
                .populate("obraSocial")
                .lean();

            if (!paciente) return null;

            let planNombre = null;
            if (paciente.plan && paciente.obraSocial?.planes) {
                const planEncontrado = paciente.obraSocial.planes.find(
                    (plan) => plan._id.toString() === paciente.plan.toString()
                );
                planNombre = planEncontrado?.nombre ?? null;
            }

            return {
                _id: paciente._id,
                nombre: paciente.nombre,
                apellido: paciente.apellido,
                dni: paciente.dni,
                nombreUsuario: paciente.usuario?.nombreUsuario ?? null,
                obraSocial: paciente.obraSocial?.nombre ?? null,
                plan: planNombre,
            };
        } catch (error) {
            throw new Error("Error al obtener el perfil del paciente: " + error.message);
        }
    }

/*
-------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------VALIDACIONES---------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

    validarPaciente(paciente) {
            if(!(paciente instanceof Paciente) && !paciente._id)
                throw new UnprocessableEntityError("El paciente es inválido");
    }

}