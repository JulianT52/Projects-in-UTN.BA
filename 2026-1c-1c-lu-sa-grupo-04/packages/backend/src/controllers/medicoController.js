import { MedicoService } from "../services/medicoService.js";

export class MedicoController {
    constructor({
        medicoService
    } = {}) {
        this.medicoService = medicoService;
    }

    crearMedico = async (req, res, next) => {
        try {
            const medicoCreado = await this.medicoService.create(req.validated)
            return res.status(201).json({ status: "success", data: medicoCreado })
        } catch (error) {
            return next(error)
        }
    }

    buscarPorNombre = async (req, res, next) => {
        try {
            const { nombre } = req.validated;
            const medicos = await this.medicoService.buscarPorNombre(nombre);
            return res.status(200).json({ status: "success", data: medicos });
        } catch (error) {
            return next(error);
        }
    }

    obtenerServicios = async (req, res, next) => {
        try {
            const { id } = req.validated;

            const servicios = await this.medicoService.obtenerServicios(id);

            return res.status(200).json({
                status: "success",
                data: servicios
            });
        } catch (error) {
            return next(error);
        }
    }

    addEspecialidad = async (req, res, next) => {
        try {
            const { id, ...datos } = req.validated
            const medico = await this.medicoService.agregarEspecialidad(id, datos);
            res.status(201).json({ status: "success", data: medico });
        } catch (e) { next(e); }
    }

    updateEspecialidad = async (req, res, next) => {
        try {
            const { id, idEspecialidad, ...datos } = req.validated
            const medico = await this.medicoService.modificarEspecialidad(id, idEspecialidad, datos);
            res.status(200).json({ status: "success", data: medico });
        } catch (e) { next(e); }
    }

    removeEspecialidad = async (req, res, next) => {
        try {
            const { id, idEspecialidad } = req.validated
            const medico = await this.medicoService.quitarEspecialidad(id, idEspecialidad);
            res.status(200).json({ status: "success", data: medico });
        } catch (e) { next(e); }
    }

    addPractica = async (req, res, next) => {
        try {
            const { id, idEspecialidad, ...datos } = req.validated
            const medico = await this.medicoService.agregarPractica(id, idEspecialidad, datos);
            res.status(201).json({ status: "success", data: medico });
        } catch (e) { next(e); }
    }

    updatePractica = async (req, res, next) => {
        try {
            const { id, idEspecialidad, idPractica } = req.params;
            // Los datos validados de la práctica provienen del body
            const datos = req.validated || req.body;

            const medico = await this.medicoService.modificarPractica(id, idEspecialidad, idPractica, datos);
            res.status(200).json({ status: "success", data: medico });
        } catch (e) { next(e); }
    }

    removePractica = async (req, res, next) => {
        try {
            const { id, idEspecialidad, idPractica } = req.params;

            const medico = await this.medicoService.quitarPractica(id, idEspecialidad, idPractica);
            res.status(200).json({ status: "success", data: medico });
        } catch (e) { next(e); }
    }

    marcarTurnoRealizado = async (req, res, next) => {
        try {
            const { id, turnoId } = req.validated;
            const resultado = await this.medicoService.marcarTurnoRealizado(id, turnoId);
            return res.status(200).json({ status: "success", data: resultado });
        } catch (error) {
            return next(error);
        }
    }

    cancelarTurno = async (req, res, next) => {
        try {
            const { id, turnoId, motivo } = req.validated;
            const resultado = await this.medicoService.cancelarTurno(id, turnoId, motivo);
            return res.status(200).json({ status: "success", data: resultado });
        } catch (error) {
            return next(error);
        }
    }

    proponerModificacionFecha = async (req, res, next) => {
        try {
            const { id, turnoId, nuevaFecha, motivo } = req.validated;
            const resultado = await this.medicoService.proponerModificacionFecha(id, turnoId, nuevaFecha, motivo);
            return res.status(200).json({ status: "success", data: resultado });
        } catch (error) {
            return next(error);
        }
    }

    resolverSolicitudCambio = async (req, res, next) => {
        try {
            const { id, turnoId, aceptaCambio } = req.validated;
            const resultado = await this.medicoService.resolverSolicitudCambio(id, turnoId, aceptaCambio);
            return res.status(200).json({ status: "success", data: resultado });
        } catch (error) {
            return next(error);
        }
    }

    async consultarHistorialPaciente(req, res, next) {
        try {
            const { id, pacienteId } = req.validated;

            const historial = await this.medicoService.obtenerHistorialPaciente(id, pacienteId);

            res.status(200).json({
                status: "success",
                message: "Historial del paciente obtenido correctamente",
                data: historial
            });
        } catch (error) {
            next(error);
        }
    }

    obtenerTurnos = async (req, res, next) => {
        try {
            const { id } = req.validated;
            const turnos = await this.medicoService.obtenerTurnosDelMedico(id);
            return res.status(200).json({ status: "success", data: turnos });
        } catch (error) {
            return next(error);
        }
    }

    obtenerPacientes = async (req, res, next) => {
    try {
        const { id } = req.validated;
        const pacientes = await this.medicoService.obtenerPacientesDelMedico(id);
        return res.status(200).json({ status: "success", data: pacientes });
    } catch (error) {
        return next(error);
    }
}

    crearDisponibilidades = async (req, res, next) => {
        try {
            const { idMedico: id, disponibilidades: dataDisponibilidades } = req.validated

            const medicoActualizado = await this.medicoService.definirDisponibilidad(
                id,
                dataDisponibilidades
            )

            return res.status(201).json({
                status: "success",
                data: medicoActualizado
            })
        } catch (error) {
            return next(error)
        }
    }

    actualizarDisponibilidades = async (req, res, next) => {
        try {
            const { idMedico: id, disponibilidades: dataDisponibilidades } = req.validated

            const medicoActualizado = await this.medicoService.actualizarDisponibilidad(
                id,
                dataDisponibilidades
            )

            return res.status(200).json({
                status: "succes",
                data: medicoActualizado
            })
        } catch (error) {
            return next(error)
        }
    }

    eliminarDisponibilidad = async (req, res, next) => {
        try {
            const { idMedico: id, disponibilidad } = req.validated

            const medicoActualizado = await this.medicoService.eliminarDisponibilidad(
                id,
                disponibilidad
            )

            return res.status(200).json({
                status: "success",
                data: medicoActualizado
            })
        } catch (error) {
            return next(error)
        }
    }

    findAll = async(req, res, next) =>{
        try{
            const { idMedico, idServicio } = req.validated
            const disponibilidadesDelServicio = await this.medicoService.findAll(idMedico, idServicio)
            return res.status(200).json({ status: "success", data: disponibilidadesDelServicio });
        } catch(error){
            next(error)
        }
    }
}
