export class ClienteController {
    constructor(clienteService) {
        this.clienteService = clienteService
    }

    async iniciarSesion(req, res) {
        try {
            const { email, password } = req.body
            const datosCliente = await this.clienteService.login(email, password)
            
            res.status(200).json({
                success: true,
                message: "Inicio de sesión exitoso",
                data: datosCliente
            })
        } catch (error) {
            // El status 401 es específico para credenciales inválidas/no autorizadas
            res.status(401).json({ success: false, message: error.message })
        }
    }

    async registrar(req, res) {
        try {
            const datosCliente = await this.clienteService.registrar(req.body)
            res.status(201).json({
                success: true,
                message: "Registro exitoso",
                data: datosCliente
            })
        } catch (error) {
            res.status(400).json({ success: false, message: error.message })
        }
    }
}