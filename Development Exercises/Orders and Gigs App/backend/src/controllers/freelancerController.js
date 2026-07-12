export class FreelancerController {
    constructor(freelancerService) {
        this.freelancerService = freelancerService
    }

    async iniciarSesion(req, res) {
        try {
            const { email, password } = req.body
            const datosFreelancer = await this.freelancerService.login(email, password)
            
            res.status(200).json({
                success: true,
                message: "Inicio de sesión exitoso",
                data: datosFreelancer
            })
        } catch (error) {
            res.status(401).json({ success: false, message: error.message })
        }
    }

    async registrar(req, res) {
        try {
            const datosFreelancer = await this.freelancerService.registrar(req.body)
            res.status(201).json({
                success: true,
                message: "Registro exitoso",
                data: datosFreelancer
            })
        } catch (error) {
            res.status(400).json({ success: false, message: error.message })
        }
    }
}