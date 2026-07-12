import { TurnoService } from "../services/turnoService.js";

export class TurnoController{
    constructor({ turnosService } = {}) {
        this.turnosService = turnosService;
    }

    obtenerHistorial = async (req, res, next) => {
        try {
            const { id } = req.validated;
            const historial = await this.turnosService.obtenerHistorialTurnos(id);

            return res.status(200).json({ status: "success", data: historial });
            
        } catch (error) {
            return next(error);
        }
    }

    obtenerPorId = async (req, res, next) => {
        try {
            const { id } = req.validated;
            const turno = await this.turnosService.obtenerPorId(id);
            return res.status(200).json({ status: "success", data: turno });
        } catch (error) {
            return next(error);
        }
    }

    buscarDisponibles = async (req, res, next) => {
        try {
            const { vista, ...filtros } = req.validated;
            const pacienteId = req.usuario.pacienteId;

            let resultado;
            if (vista === 'medicos') {
                resultado = await this.turnosService.buscarMedicosConTurnosParaPaciente(pacienteId, filtros);
            } else if (vista === 'dias') {
                resultado = { data: await this.turnosService.obtenerDiasDisponibles(filtros) };
            } else {
                resultado = await this.turnosService.buscarTurnosParaPaciente(pacienteId, filtros);
            }

            return res.status(200).json(resultado);
        } catch (error) {
            return next(error);
        }
    }

    reservarTurno = async (req, res, next) => {
        try {
            const { turnoId } = req.params;
            const { especialidadId, practicaId } = req.validated;
            const { pacienteId, usuarioId } = req.usuario;

            const turno = await this.turnosService.reservarTurno(
                turnoId, pacienteId, especialidadId, practicaId, usuarioId
            );
            return res.status(200).json({ status: "success", data: turno });
        } catch (error) {
            return next(error);
        }
    }

    cotizarTurno = async (req, res, next) => {
        try {
            const { turnoId } = req.params;
            const { especialidadId, practicaId } = req.validated;
            const { pacienteId } = req.usuario;

            const cotizacion = await this.turnosService.cotizarTurno(
                turnoId, pacienteId, especialidadId, practicaId
            );
            return res.status(200).json({ status: "success", data: cotizacion });
        } catch (error) {
            return next(error);
        }
    }

}
