import { AppError } from '../errors/errores.js'

export function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    }

    console.error(err)
    return res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
    })
}
