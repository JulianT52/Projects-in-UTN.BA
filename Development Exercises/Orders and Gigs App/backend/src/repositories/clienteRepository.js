export class ClienteRepository {
    constructor() {
        this.clientes = new Map()
        this.idCounter = 1
    }

    crear(cliente) {
        const id = this.idCounter++
        cliente.id = id
        this.clientes.set(id, cliente)
        return cliente
    }

    async findByEmail(email) {
        return Array.from(this.clientes.values()).find(cliente => cliente.email === email)
    }
}

export const clienteRepository = new ClienteRepository()