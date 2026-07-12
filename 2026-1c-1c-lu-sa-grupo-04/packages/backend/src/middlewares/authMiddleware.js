import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/errores.js";

export function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return next(new UnauthorizedError("Token no provisto"));
    }

    const token = header.split(" ")[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = payload;
        next();
    } catch {
        return next(new UnauthorizedError("Token inválido o expirado"));
    }
}
