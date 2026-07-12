export class ObraSocialController {
    constructor({ obraSocialService } = {}) {
        this.obraSocialService = obraSocialService;
    }
    crear = async (req, res, next) => {
        try {
            const resultado = await this.obraSocialService.crearObraSocial(req.validated);
            res.status(201).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    obtenerObrasSociales = async (req, res, next) => {
        try {
            const obrasSociales = await this.obraSocialService.obtenerObrasSociales();
            res.status(200).json({ status: "success", data: obrasSociales });
        } catch (error) {
            next(error);
        }
    }
}
