export class ClienteService {
    constructor(clienteRepository) {
        this.clienteRepository = clienteRepository
    }

    async login(email, password) {
        const cliente = await this.clienteRepository.findByEmail(email)
        
        if (!cliente || cliente.password !== password) {
            throw new Error("Credenciales inválidas")
        }

        return {
            id: cliente.id,
            email: cliente.email,
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            rol: "cliente"
        }
    }

    async registrar(datos) {
        const existente = await this.clienteRepository.findByEmail(datos.email)
        if (existente) {
            throw new Error("El email ya está en uso")
        }

        const nuevoCliente = this.clienteRepository.crear({
            nombre: datos.nombre,
            apellido: datos.apellido,
            email: datos.email,
            password: datos.password
        })

        return {
            id: nuevoCliente.id,
            email: nuevoCliente.email,
            nombre: nuevoCliente.nombre,
            apellido: nuevoCliente.apellido,
            rol: "cliente"
        }
    }
}
