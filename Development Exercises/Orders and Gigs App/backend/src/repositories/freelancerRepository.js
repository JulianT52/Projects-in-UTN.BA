export class FreelancerRepository {
    constructor() {
        this.freelancers = new Map()
        this.idCounter = 1
    }

    crear(freelancer) {
        const id = this.idCounter++
        freelancer.id = id
        this.freelancers.set(id, freelancer)
        return freelancer
    }

    async findByEmail(email) {
        return Array.from(this.freelancers.values()).find(freelancer => freelancer.email === email)
    }
}

export const freelancerRepository = new FreelancerRepository()