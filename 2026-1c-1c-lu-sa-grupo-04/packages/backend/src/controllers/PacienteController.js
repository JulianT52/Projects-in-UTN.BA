export class PacienteController {
    constructor({pacienteService} = {}) {
        this.pacienteService = pacienteService;
    }

    create = async (req, res, next) => {
        try {
            const pacienteCreado = await this.pacienteService.create(req.validated);
            return res.status(201).json({ status: "success", data: pacienteCreado });
        } catch (error) {
            return next(error);
        }
    }

    obtenerPerfil = async (req, res, next) => {
        try {
            const { id } = req.validated;
            const perfil = await this.pacienteService.obtenerPerfil(id, req.usuario);
            return res.status(200).json({ status: "success", data: perfil });
        } catch (error) {
            return next(error);
        }
    }

    obtenerHistorial = async (req, res, next) => {
        try {
            const { id } = req.validated;
            const historial = await this.pacienteService.obtenerHistorialTurnos(id);
            return res.status(200).json({ status: "success", data: historial });
        } catch (error) {
            return next(error);
        }
    }

    cancelarTurno = async (req, res, next) => {
        try {
            const { id, turnoId, motivo } = req.validated;
            const resultado = await this.pacienteService.cancelarTurno(id, turnoId, motivo);
            return res.status(200).json({ status: "success", data: resultado });
        } catch (error) {
            return next(error);
        }
    }

    solicitarCambioFecha = async (req, res, next) => {
        try {
            const { id, turnoId, nuevaFecha, motivo } = req.validated;
            const resultado = await this.pacienteService.solicitarCambioFecha(id, turnoId, nuevaFecha, motivo);
            return res.status(200).json({ status: "success", data: resultado });
        } catch (error) {
            return next(error);
        }
    }

    resolverPropuestaCambio = async (req, res, next) => {
        try {
            const { id, turnoId, aceptaCambio } = req.validated;
            const resultado = await this.pacienteService.resolverPropuestaCambio(id, turnoId, aceptaCambio);
            return res.status(200).json({ status: "success", data: resultado });
        } catch (error) {
            return next(error);
        }
    }

}
