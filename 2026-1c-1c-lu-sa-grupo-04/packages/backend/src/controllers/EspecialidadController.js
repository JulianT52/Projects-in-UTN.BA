export class EspecialidadesController {
    constructor({ especialidadesService } = {}) {
        this.especialidadesService = especialidadesService;
    }

    findAll = async (req, res, next) => {
        try {
            const especialidades = await this.especialidadesService.findAll();
            return res.status(200).json({ status: "success", data: especialidades });
        } catch (error) {
            next(error);
        }
    }

    obtenerEspecialidades = async (req, res, next) => {
        try {
            const especialidades = await this.especialidadesService.obtenerResumenEspecialidades();
            res.status(200).json({ status: "success", data: especialidades });
        } catch (error) {
            next(error); 
        }
    }
}