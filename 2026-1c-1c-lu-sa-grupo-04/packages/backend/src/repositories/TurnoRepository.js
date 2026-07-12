import express from "express"
import mongoose from "mongoose";
import { Turno } from "../domain/turno.js";
import { EstadoTurno } from "../domain/estadoTurno.js";
import { TurnoModel } from "../models/TurnoModel.js";
import { MedicoModel } from "../models/medicoModel.js";
import { UnprocessableEntityError, ConflictError } from "../errors/errores.js";
import { PacienteModel } from "../models/PacienteModel.js";

export class TurnoRepository{

    constructor(){
        
    }
    
    //evaluar meter el constructor como hicieron el sabado 9-5

/*
-------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------TURNOS---------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

    async buscarTurnosDisponibles(filtros) {
    const {
        especialidadId, practicaId, sedeId,
        fechaDesde, fechaHasta,
        page = 1, limit = 10, // Valores por defecto
        sortBy = 'fechaHora', sortOrder = 'asc' // Orden por defecto
    } = filtros;

    try {
        const query = { estado: 'DISPONIBLE' };

        if (sedeId) query.sede = sedeId;
        if (especialidadId) query.especialidad = especialidadId;
        if (practicaId) query.practica = practicaId;

        const idsMedico = await this.resolverIdsMedicoPorFiltros(filtros);
        if (idsMedico !== null) {
            query.medico = idsMedico.length > 0 ? { $in: idsMedico } : null;
        }

        if (fechaDesde || fechaHasta) {
            query.fechaHora = {};
            if (fechaDesde) query.fechaHora.$gte = new Date(fechaDesde);
            if (fechaHasta) query.fechaHora.$lte = new Date(fechaHasta);
        }

        const total = await TurnoModel.countDocuments(query);

        const skip = (page - 1) * limit;
        const direccion = sortOrder === 'desc' ? -1 : 1;

        const turnos = await TurnoModel.find(query)
            .populate('medico')
            .populate('especialidad')
            .populate('practica')
            .populate('sede')
            .sort({ [sortBy]: direccion }) 
            .skip(skip)
            .limit(Number(limit));

        return { turnos, total }; 
    } catch (error) {
        throw new Error("Error al buscar turnos: " + error.message);
    }
}

    async resolverIdsMedicoPorFiltros({ medicoId, especialidad, medico: nombreMedicoBuscado }) {
        let ids = null; // null = sin restricción de médico

        if (medicoId) {
            ids = [new mongoose.Types.ObjectId(medicoId)];
        }

        if (especialidad) {
            const medicosEspecialidad = await MedicoModel.find({ "especialidades.nombre": especialidad }, { _id: 1 });
            const idsEspecialidad = medicosEspecialidad.map((m) => m._id);
            ids = ids
                ? ids.filter((id) => idsEspecialidad.some((e) => e.toString() === id.toString()))
                : idsEspecialidad;
        }

        if (nombreMedicoBuscado) {
            const medicosPorNombre = await MedicoModel.find({
                $or: [
                    { nombre: { $regex: nombreMedicoBuscado, $options: 'i' } },
                    { apellido: { $regex: nombreMedicoBuscado, $options: 'i' } }
                ]
            }, { _id: 1 });
            const idsNombre = medicosPorNombre.map((m) => m._id);
            ids = ids
                ? ids.filter((id) => idsNombre.some((n) => n.toString() === id.toString()))
                : idsNombre;
        }

        return ids;
    }

    async buscarMedicosConTurnosDisponibles(filtros) {
        const { sedeId, fecha, page = 1, limit = 5, sortOrder = 'asc' } = filtros;

        try {
            const inicioDia = new Date(fecha);
            const finDia = new Date(inicioDia);
            finDia.setUTCDate(finDia.getUTCDate() + 1);

            const match = {
                estado: 'DISPONIBLE',
                fechaHora: { $gte: inicioDia, $lt: finDia }
            };
            if (sedeId) match.sede = new mongoose.Types.ObjectId(sedeId);

            const idsMedico = await this.resolverIdsMedicoPorFiltros(filtros);
            if (idsMedico !== null) {
                if (idsMedico.length === 0) return { medicos: [], total: 0 };
                match.medico = { $in: idsMedico };
            }

            const direccion = sortOrder === 'desc' ? -1 : 1;

            const pipeline = [
                { $match: match },
                { $lookup: { from: 'sedes', localField: 'sede', foreignField: '_id', as: 'sede' } },
                { $unwind: { path: '$sede', preserveNullAndEmptyArrays: true } },
                { $sort: { fechaHora: 1 } },
                {
                    $group: {
                        _id: '$medico',
                        turnos: { $push: '$$ROOT' },
                        primerHorario: { $min: '$fechaHora' }
                    }
                },
                { $lookup: { from: 'medicos', localField: '_id', foreignField: '_id', as: 'medico' } },
                { $unwind: '$medico' },
                { $sort: { primerHorario: direccion } },
                {
                    $facet: {
                        data: [{ $skip: (page - 1) * limit }, { $limit: Number(limit) }],
                        totalCount: [{ $count: 'count' }]
                    }
                }
            ];

            const [resultado] = await TurnoModel.aggregate(pipeline);
            return {
                medicos: resultado?.data ?? [],
                total: resultado?.totalCount?.[0]?.count ?? 0
            };
        } catch (error) {
            throw new Error("Error al buscar médicos con turnos disponibles: " + error.message);
        }
    }

    async obtenerDiasConTurnosDisponibles(filtros) {
        const { sedeId, diasHorizonte = 7 } = filtros;

        try {
            const hoy = new Date();
            hoy.setUTCHours(0, 0, 0, 0);
            const limite = new Date(hoy);
            limite.setUTCDate(limite.getUTCDate() + diasHorizonte);

            const match = { estado: 'DISPONIBLE', fechaHora: { $gte: hoy, $lt: limite } };
            if (sedeId) match.sede = new mongoose.Types.ObjectId(sedeId);

            const idsMedico = await this.resolverIdsMedicoPorFiltros(filtros);
            if (idsMedico !== null) {
                if (idsMedico.length === 0) return [];
                match.medico = { $in: idsMedico };
            }

            const dias = await TurnoModel.aggregate([
                { $match: match },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$fechaHora' } } } },
                { $sort: { _id: 1 } }
            ]);

            return dias.map((d) => d._id);
        } catch (error) {
            throw new Error("Error al obtener días con turnos disponibles: " + error.message);
        }
    }

    async obtenerHistorialTurnosPaciente(pacienteId) {
        return await TurnoModel.find({ paciente: pacienteId })
            .populate({
                path: 'medico',
                populate: { path: 'usuario', select: 'nombreUsuario' }
            })
            .populate('sede')
            .sort({ fechaHora: -1 });
    }

    async obtenerTurnosDisponibles(idMedico){
        const turnos = await TurnoModel.find({medico: idMedico, estado: 'DISPONIBLE'}).sort({fechaHora: 1})
        return turnos;
    }

    async obtenerTurnosDisponiblesFuturos(idMedico) {
        try {
            const ahora = new Date()

            return await TurnoModel.find({
                medico: idMedico,
                estado: EstadoTurno.DISPONIBLE,
                fechaHora: { $gt: ahora }
            }).sort({ fechaHora: 1 })
        } catch (error) {
            throw new Error("Error al obtener turnos disponibles futuros: " + error.message)
        }
    }

    async eliminarTurnosPorIds(idsTurnos) {
        try {
            return await TurnoModel.deleteMany({
                _id: { $in: idsTurnos }
            })
        } catch (error) {
            throw new Error("Error al eliminar turnos: " + error.message)
        }
    }

    async eliminarTurnosDisponibles(idMedico){
    return await TurnoModel.deleteMany({
        medico: idMedico,
        estado: "DISPONIBLE",
    });
}

    async guardarTurnos(turnos){
        this.validarTurnos(turnos)
        try {
            const fechasTurnos = turnos.map(turno => turno.fechaHora) // con esto consigo las fechas de los turnos
            const medicoId = turnos[0].medico

            const turnosExistentes =
                await TurnoModel.find({
                    medico: medicoId,
                    fechaHora: {
                    $in: fechasTurnos
                }
            })

            const fechasExistentes = new Set(turnosExistentes.map(turno => turno.fechaHora.toISOString()))

            // Filtramos solamente los nuevos
            const turnosNuevos = turnos.filter(turno =>!fechasExistentes.has(turno.fechaHora.toISOString()))

        if (turnosNuevos.length === 0) {
            return []
        }
        return await TurnoModel.insertMany(turnosNuevos, { ordered: false })
    } catch (error) {
            throw new Error("Error al guardar turnos: " + error.message)
        }
    }

    async reservarTurno(turnoId, pacienteId, especialidadId, practicaId, usuarioId) {
        try {
            const turnoReservado = await TurnoModel.findOneAndUpdate(
                { _id: turnoId, estado: EstadoTurno.DISPONIBLE },
                {
                    $set: {
                        estado: EstadoTurno.RESERVADO,
                        paciente: pacienteId,
                        ...(especialidadId && { especialidad: especialidadId }),
                        ...(practicaId && { practica: practicaId }),
                    },
                    $push: {
                        historialEstados: {
                            fechaHoraIngreso: new Date(),
                            estado: EstadoTurno.RESERVADO,
                            usuario: usuarioId,
                        },
                    },
                },
                { returnDocument: "after" }
            );

            if (!turnoReservado) {
                throw new ConflictError("El turno ya no se encuentra disponible");
            }

            return turnoReservado;
        } catch (error) {
            if (error instanceof ConflictError) throw error;
            throw new Error("Error al reservar el turno: " + error.message);
        }
    }

    async actualizarTurno(turno) {
        try {
            return await TurnoModel.findByIdAndUpdate(turno._id, turno, { new: true });
        } catch (error) {
            throw new Error("Error al actualizar el turno en la BD: " + error.message);
        }
    }

    async verificarDisponibilidadParaCambio(medicoId, nuevaFecha) {
        try {
            const turnoConflictivo = await TurnoModel.findOne({
                medico: medicoId,
                $or: [
                    { 
                        fechaHora: nuevaFecha, 
                        estado: { $in: ['RESERVADO'] } 
                    },
                    { 
                        fechaPropuesta: nuevaFecha, 
                        estado: 'PENDIENTE_CONFIRMACION' 
                    }
                ]
            });

            return turnoConflictivo === null;

        } catch (error) {
            throw new Error("Error al verificar la disponibilidad en la base de datos: " + error.message);
        }
    }

/*
-------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------GETTERS--------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

    async obtenerPorId(id) {
        try {
            return await TurnoModel.findById(id);
        } catch (error) {
            throw new Error("Error al buscar el turno en la BD: " + error.message);
        }
    }

    async obtenerTurnoConDetalles(id){
        try{
            return await TurnoModel.findById(id)
                .populate('paciente')
                .populate('medico')
                .populate('practica')
        }
        catch(error){
            throw new Error ("Error al buscar le turno detallado en la db: " + error.message);
        }
    }

    async obtenerTurnosPorRangoDeFechas(fechaInicio, fechaFin) {
        try {
            return await TurnoModel.find({
                fechaHora: {
                    $gte: fechaInicio,
                    $lte: fechaFin
                }
            })
            .populate({path: 'paciente', populate: { path: 'usuario'}}) 
            .populate({ path: 'medico', populate: { path: 'usuario' } })   
            .populate('sede');   
        } catch (error) {
            throw new Error(`Error al buscar turnos por rango de fechas: ${error.message}`);
        }
    }

    async obtenerTurnosPorMedico(medicoId) {
        return await TurnoModel.find({ medico: medicoId, paciente: { $ne: null } })
            .populate('paciente')
            .populate('sede')
            .sort({ fechaHora: -1 });
    }

    async obtenerPacientesPorMedico(medicoId) {
        const pacienteIds = await TurnoModel
        .find({ medico: medicoId, paciente: { $ne: null } })
        .distinct('paciente');
        return await PacienteModel.find({ _id: { $in: pacienteIds } }).populate('usuario');
    }

/*
-------------------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------VALIDACIONES-----------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

    validarTurnos(turnos){
        turnos.forEach(turno => {
            if (!turno instanceof Turno){
                throw new UnprocessableEntityError("Error al guardar en la BD")
            }
        })
    }
}