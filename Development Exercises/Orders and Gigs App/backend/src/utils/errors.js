export class BadRequestError extends Error {
    constructor(message = 'Solicitud inválida') {
        super(message)
        this.name = 'BadRequestError'
        this.statusCode = 400
    }
}

export class UnprocessableEntityError extends Error {
    constructor(message = 'Entidad no procesable') {
        super(message)
        this.name = 'UnprocessableEntityError'
        this.statusCode = 422
    }
}

export class NotFoundError extends Error {
    constructor(message = 'Recurso no encontrado') {
        super(message)
        this.name = 'NotFoundError'
        this.statusCode = 404
    }
}

export class ConflictError extends Error {
    constructor(message = 'Conflicto en la solicitud') {
        super(message)
        this.name = 'ConflictError'
        this.statusCode = 409
    }
}

export class InternalServerError extends Error {
    constructor(message = 'Error interno del servidor') {
        super(message)
        this.name = 'InternalServerError'
        this.statusCode = 500
    }
}
