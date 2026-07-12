import { Producto } from "../domain/Producto.js"
import {
    BadRequestError,
    ConflictError,
    NotFoundError,
    UnprocessableEntityError
} from "../errors/AppError.js"
import { ProductoRepository } from "../repositories/ProductoRepository.js";

export class ProductoService {
    constructor({
        productoRepository = new ProductoRepository()
    } = {}) {
        this.productoRepository = productoRepository;
    }

    // Numero y limite, si no están 1 o 10 respectivamente y si se pasa undefined {}
    obtenerTodos({ numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}) {
        this.validarPaginacion(numeroPagina, limitePorPagina)
        this.validarFiltros(filtros)

        const { productos, totalProductos } = this.productoRepository.obtenerPaginados(
            numeroPagina,
            limitePorPagina,
            filtros
        )

        const totalPaginas = totalProductos === 0 ? 0 : Math.ceil(totalProductos / limitePorPagina)

        return {
            productos,
            numeroPagina,
            limitePorPagina,
            totalPaginas,
            totalProductos
        }
    }

    obtenerPorId(id) {
        this.validarEnteroPositivo(id, "Id")

        const producto = this.productoRepository.obtenerPorId(id)

        if (!producto) {
            throw new NotFoundError("Producto no encontrado")
        }

        return producto
    }

    crear(datosProducto) {
        this.validarDatosProducto(datosProducto)
        this.validarNombreDisponible(datosProducto.nombre)

        const producto = new Producto(
            datosProducto.nombre,
            datosProducto.precio,
            datosProducto.cantidad,
            datosProducto.categoria
        )

        return this.productoRepository.guardar(producto)
    }

    crearVarios(listaProductos) {
        if (!Array.isArray(listaProductos) || listaProductos.length === 0) {
            throw new BadRequestError("Debe enviar una lista de productos no vacía")
        }

        const productos = listaProductos.map((datos) => {
            this.validarDatosProducto(datos)
            this.validarNombreDisponible(datos.nombre)
            return new Producto(datos.nombre, datos.precio, datos.cantidad, datos.categoria)
        })

        return this.productoRepository.guardarTodos(productos)
    }

    actualizar(id, datosProducto) {
        this.validarEnteroPositivo(id, "Id")

        this.validarDatosProducto(datosProducto)

        const productoExistente = this.obtenerPorId(id)
        this.validarNombreDisponible(datosProducto.nombre, id)

        const productoActualizado = new Producto(
            datosProducto.nombre,
            datosProducto.precio,
            datosProducto.cantidad,
            datosProducto.categoria
        )

        productoActualizado.id = productoExistente.id
        return this.productoRepository.guardar(productoActualizado)
    }

    eliminar(id) {
        this.validarEnteroPositivo(id, "Id")
        const producto = this.obtenerPorId(id)

        producto.eliminado = true

        return this.productoRepository.guardar(producto)
    }

    validarDatosProducto(datosProducto) {
        if (!datosProducto || typeof datosProducto !== "object" || Array.isArray(datosProducto)) {
            throw new BadRequestError("Los datos del producto son inválidos")
        }

        const { nombre, precio, cantidad, categoria } = datosProducto

        if (typeof nombre !== "string" || nombre.trim().length < 3) {
            throw new UnprocessableEntityError("El nombre del producto debe tener al menos 3 caracteres")
        }

        if (!Number.isFinite(precio) || precio <= 0) {
            throw new UnprocessableEntityError("El precio debe ser mayor a 0")
        }

        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            throw new UnprocessableEntityError("La cantidad debe ser un entero mayor a 0")
        }

        if (typeof categoria !== "string" || categoria.trim().length < 3) {
            throw new UnprocessableEntityError("La categoría debe tener al menos 3 caracteres")
        }
    }

    validarNombreDisponible(nombre, idActual = null) {
        const productoExistente = this.productoRepository.obtenerPorNombre(nombre)
        const existeProductoConMismoNombre = productoExistente && productoExistente.id !== idActual

        if (existeProductoConMismoNombre) {
            throw new ConflictError("Ya existe un producto con el mismo nombre")
        }
    }

    validarFiltros({ precioMin, precioMax, categoria } = {}) {
        if (precioMin !== undefined && precioMin <= 0) {
            throw new BadRequestError("precioMin debe ser mayor a 0")
        }
        if (precioMax !== undefined && precioMax <= 0) {
            throw new BadRequestError("precioMax debe ser mayor a 0")
        }
        if (precioMin !== undefined && precioMax !== undefined && precioMin > precioMax) {
            throw new BadRequestError("precioMin no puede ser mayor que precioMax")
        }
        if (categoria !== undefined && (typeof categoria !== "string" || categoria.trim().length === 0)) {
            throw new BadRequestError("La categoría debe ser una cadena de texto no vacía")
        }
    }

    validarPaginacion(numeroPagina, limitePorPagina) {
        this.validarEnteroPositivo(numeroPagina, "Numero de página")
        this.validarEnteroPositivo(limitePorPagina, "Límite por página")
    }

    validarEnteroPositivo(numero, parametro) {
        if (!Number.isInteger(numero) || numero <= 0) {
            throw new BadRequestError(`${parametro} debe ser un entero positivo`)
        }
    }
}