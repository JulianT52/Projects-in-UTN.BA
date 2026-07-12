import { UnauthorizedError } from "../errors/errores.js";

export function checkRol(rolesPermitidos) {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return next(new UnauthorizedError("No tienes permisos suficientes para realizar esta acción"));
        }
        next();
    };
}
