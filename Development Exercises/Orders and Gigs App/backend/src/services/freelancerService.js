export class FreelancerService {
    constructor(freelancerRepository) {
        this.freelancerRepository = freelancerRepository
    }

    async login(email, password) {
        const freelancer = await this.freelancerRepository.findByEmail(email)
        
        if (!freelancer || freelancer.password !== password) {
            throw new Error("Credenciales inválidas")
        }

        return {
            id: freelancer.id,
            email: freelancer.email,
            nombre: freelancer.nombre,
            apellido: freelancer.apellido,
            rol: "freelancer"
        }
    }

    async registrar(datos) {
        const existente = await this.freelancerRepository.findByEmail(datos.email)
        if (existente) {
            throw new Error("El email ya está en uso")
        }

        const nuevoFreelancer = this.freelancerRepository.crear({
            nombre: datos.nombre,
            apellido: datos.apellido,
            email: datos.email,
            password: datos.password
        })

        return {
            id: nuevoFreelancer.id,
            email: nuevoFreelancer.email,
            nombre: nuevoFreelancer.nombre,
            apellido: nuevoFreelancer.apellido,
            rol: "freelancer"
        }
    }
}
