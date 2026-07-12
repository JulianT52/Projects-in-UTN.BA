import {
    AppError,
    BadRequestError,
    ConflictError,
    NotFoundError,
    UnprocessableEntityError
} from "../errors/AppError.js"
import { ProductService } from "../services/ProductService.js";

export class ProductController {
    constructor({
        productoService = new ProductService()
    } = {}) {
        this.productoService = productoService;
    }


    findAll = async (req, res) => {
        try {
            const paginacion = this.extraerPaginacion(req.query)
            const filtros = this.extraerFiltros(req.query)
            const resultado = this.productoService.obtenerTodos({ ...paginacion, filtros })

            return res.status(200).json({
                status: "success",
                data: resultado.productos,
                paginacion: {
                    numeroPagina: resultado.numeroPagina,
                    limitePorPagina: resultado.limitePorPagina,
                    totalPaginas: resultado.totalPaginas,
                    totalProductos: resultado.totalProductos
                }
            })
        } catch (error) {
            return this.manejarError(res, error)
        }
    }

    create = async (req, res) => {
        try {
            const datosProducto = this.extraerYValidarBodyProducto(req.body)
            const productoCreado = this.productoService.crear(datosProducto)

            return res.status(201).json({ status: "success", data: productoCreado })
        } catch (error) {
            return this.manejarError(res, error)
        }
    }

    findById = async (req, res) => {
        try {
            const id = this.parsearId(req.params.id)
            const producto = this.productoService.obtenerPorId(id)

            return res.status(200).json({ status: "success", data: producto })
        } catch (error) {
            return this.manejarError(res, error)
        }
    }

    update = async (req, res) => {
        try {
            const id = this.parsearId(req.params.id)
            const datosProducto = this.extraerYValidarBodyProducto(req.body)
            const productoActualizado = this.productoService.actualizar(id, datosProducto)

            return res.status(200).json({ status: "success", data: productoActualizado })
        } catch (error) {
            return this.manejarError(res, error)
        }
    }

    seed = async (req, res) => {
        const PRODUCTOS_INICIALES = [
            { nombre: "Coca-Cola 1.5L", precio: 2500, cantidad: 50, categoria: "Bebidas" },
            { nombre: "Agua Mineral 500ml", precio: 800, cantidad: 100, categoria: "Bebidas" },
            { nombre: "Cerveza Quilmes 1L", precio: 3500, cantidad: 30, categoria: "Bebidas" },
            { nombre: "Leche Entera 1L", precio: 1500, cantidad: 60, categoria: "Lacteos" },
            { nombre: "Harina 000 1kg", precio: 1200, cantidad: 40, categoria: "Alimentos" },
            { nombre: "Aceite Girasol 1L", precio: 6000, cantidad: 25, categoria: "Alimentos" },
            { nombre: "Fideos Largos 500g", precio: 1000, cantidad: 45, categoria: "Alimentos" },
            { nombre: "Arroz 1kg", precio: 1800, cantidad: 35, categoria: "Alimentos" },
            { nombre: "Azucar 1kg", precio: 2000, cantidad: 30, categoria: "Alimentos" },
            { nombre: "Yerba Mate 500g", precio: 3200, cantidad: 20, categoria: "Alimentos" }
        ]

        try {
            const lista = Array.isArray(req.body) && req.body.length > 0 ? req.body : PRODUCTOS_INICIALES
            const productosCreados = this.productoService.crearVarios(lista)

            return res.status(201).json({ status: "success", data: productosCreados })
        } catch (error) {
            return this.manejarError(res, error)
        }
    }

    delete = async (req, res) => {
        try {
            const id = this.parsearId(req.params.id)
            const productoEliminado = this.productoService.eliminar(id)

            return res.status(200).json({ status: "success", data: productoEliminado })
        } catch (error) {
            return this.manejarError(res, error)
        }
    }

    parsearId(idParam) {
        const id = Number(idParam)

        this.validarEnteroPositivo(id, "id")

        return id
    }

    extraerYValidarBodyProducto(body) {
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            throw new BadRequestError("El cuerpo de la request es inválido")
        }

        const camposPermitidos = ["nombre", "precio", "cantidad", "categoria"]
        const camposBody = Object.keys(body)
        const camposNoPermitidos = camposBody.filter((campo) => !camposPermitidos.includes(campo))

        if (camposNoPermitidos.length > 0) {
            throw new BadRequestError(`Campos no permitidos en la request: ${camposNoPermitidos.join(", ")}`)
        }

        const camposFaltantes = camposPermitidos.filter((campo) => body[campo] === undefined)

        if (camposFaltantes.length > 0) {
            throw new BadRequestError(`Faltan campos obligatorios en la request: ${camposFaltantes.join(", ")}`)
        }

        return {
            nombre: body.nombre,
            precio: body.precio,
            cantidad: body.cantidad,
            categoria: body.categoria
        }
    }

    extraerFiltros(query) {
        const filtros = {}

        if (query.precioMin !== undefined) {
            const precioMin = Number(query.precioMin)
            if (!Number.isFinite(precioMin)) {
                throw new BadRequestError("precioMin debe ser un número válido")
            }
            filtros.precioMin = precioMin
        }

        if (query.precioMax !== undefined) {
            const precioMax = Number(query.precioMax)
            if (!Number.isFinite(precioMax)) {
                throw new BadRequestError("precioMax debe ser un número válido")
            }
            filtros.precioMax = precioMax
        }

        if (query.categoria !== undefined) {
            filtros.categoria = query.categoria
        }

        return filtros
    }

    extraerPaginacion(query) {
        const numeroPagina = query?.page === undefined ? 1 : Number(query.page)
        const limitePorPagina = query?.limit === undefined ? 10 : Number(query.limit)

        this.validarEnteroPositivo(numeroPagina, "page")
        this.validarEnteroPositivo(limitePorPagina, "limit")

        return { numeroPagina, limitePorPagina }
    }

    validarEnteroPositivo(numero, parametro) {
        if (!Number.isInteger(numero) || numero <= 0) {
            throw new BadRequestError(`El parámetro ${parametro} debe ser un entero positivo`)
        }
    }

    manejarError(res, error) {
        const message = error?.message || "Error interno"
        const timestamp = error?.timestamp || new Date().toISOString()

        if (error instanceof NotFoundError) {
            return res.status(404).json({ status: "fail", message, timestamp })
        }

        if (error instanceof ConflictError) {
            return res.status(409).json({ status: "fail", message, timestamp })
        }

        if (error instanceof BadRequestError) {
            return res.status(400).json({ status: "fail", message, timestamp })
        }

        if (error instanceof UnprocessableEntityError || error instanceof AppError) {
            return res.status(422).json({ status: "fail", message, timestamp })
        }

        return res.status(500).json({ status: "error", message: "Error interno del servidor", timestamp })
    }
}