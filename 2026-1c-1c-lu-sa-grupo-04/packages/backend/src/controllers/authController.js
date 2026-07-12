export class AuthController {
    constructor({ authService } = {}) {
        this.authService = authService;
    }

    login = async (req, res, next) => {
        try {
            const { nombreUsuario, password } = req.body;
            const resultado = await this.authService.login(nombreUsuario, password);
            return res.status(200).json({ status: "success", data: resultado });
        } catch (error) {
            return next(error);
        }
    };
}
