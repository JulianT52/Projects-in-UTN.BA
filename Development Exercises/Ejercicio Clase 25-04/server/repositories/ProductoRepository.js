import { Producto } from "../domain/Producto.js"
import {
    BadRequestError,
    NotFoundError,
    UnprocessableEntityError
} from "../errors/AppError.js"

export class ProductoRepository {
    constructor() {
        this.productos = {}
        this.nextId = 1
    }

    obtenerTodos() {
        return Object.values(this.productos).filter((producto) => !producto.eliminado)
    }

    obtenerPaginados(numeroPagina, limitePorPagina, filtros = {}) {
        let productos = this.obtenerTodos()

        if (filtros.precioMin !== undefined) {
            productos = productos.filter((p) => p.precio >= filtros.precioMin)
        }
        if (filtros.precioMax !== undefined) {
            productos = productos.filter((p) => p.precio <= filtros.precioMax)
        }
        if (filtros.categoria !== undefined) {
            const categoriaNormalizada = filtros.categoria.trim().toLowerCase()
            productos = productos.filter((p) => p.categoria.trim().toLowerCase() === categoriaNormalizada)
        }

        const inicio = (numeroPagina - 1) * limitePorPagina
        const fin = inicio + limitePorPagina

        return {
            productos: productos.slice(inicio, fin),
            totalProductos: productos.length
        }
    }

    guardar(producto) {
        this.validarProducto(producto)

        const id = producto.id ?? this.nextId++
        producto.id = id
        this.productos[id] = producto

        return producto
    }

    guardarTodos(productos) {
        if (!Array.isArray(productos)) {
            throw new BadRequestError("Debe enviar una lista de productos")
        }

        return productos.map((producto) => this.guardar(producto))
    }

    obtenerPorId(id, { incluirEliminados = false } = {}) {
        this.validarId(id)

        const producto = this.productos[id] ?? null

        if (!producto) {
            return null
        }

        if (!incluirEliminados && producto.eliminado) {
            return null
        }

        return producto
    }

    obtenerPorNombre(nombre, { incluirEliminados = false } = {}) {
        this.validarNombre(nombre)
        const nombreNormalizado = nombre.trim().toLowerCase()

        return (
            Object.values(this.productos).find((producto) => {
                if (!incluirEliminados && producto.eliminado) {
                    return false
                }

                return producto.nombre.trim().toLowerCase() === nombreNormalizado
            }) ?? null
        )
    }

    eliminar(id) {
        this.validarId(id)

        const productoAEliminar = this.productos[id]

        if (!productoAEliminar) {
            throw new NotFoundError("El id no pertenece a un producto")
        }

        delete this.productos[id]
        return productoAEliminar
    }

    validarProducto(producto) {
        if (!(producto instanceof Producto)) {
            throw new UnprocessableEntityError("El producto es inválido")
        }
    }

    validarId(id) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestError("El id no es válido")
        }
    }

    validarNombre(nombre) {
        if (typeof nombre !== "string" || nombre.trim().length === 0) {
            throw new BadRequestError("El nombre del producto es obligatorio")
        }
    }
}