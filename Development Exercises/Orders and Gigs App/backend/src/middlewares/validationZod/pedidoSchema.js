import { z } from "zod"
import { EstadoPedido } from "../../domain/estadoPedido.js"

const usuarioSchema = z.object({
    id: z.coerce.number().positive("El ID debe ser un número positivo"),
    nombre: z.string().min(1, "El nombre es requerido"),
    apellido: z.string().min(1, "El apellido es requerido"),
    email: z.string().email("Email inválido")
})

const categoriaSchema = z.object({
    id: z.coerce.number().positive("El ID debe ser un número positivo"),
    nombre: z.string().min(1, "El nombre de categoría es requerido"),
    descripcion: z.string().min(1, "La descripción es requerida")
})

const gigSchema = z.object({
    id: z.coerce.number().positive("El ID debe ser un número positivo"),
    nombre: z.string().min(1, "El nombre del gig es requerido"),
    descripcion: z.string().min(1, "La descripción del gig es requerida"),
    imagen: z.string().url("La imagen debe ser una URL válida"),
    categoria: categoriaSchema,
    vendedor: usuarioSchema,
    paquetes: z.array(z.object({
        nombre: z.string().min(1, "El nombre del paquete es requerido"),
        precio: z.number().positive("El precio debe ser mayor a 0"),
        diasDeEntrega: z.number().int().positive("Los días de entrega deben ser un número entero positivo")
    })).min(1, "El gig debe incluir al menos un paquete")
})

const paqueteSchema = z.object({
    nombre: z.string().min(1, "El nombre del paquete es requerido"),
    precio: z.number().positive("El precio debe ser mayor a 0"),
    diasDeEntrega: z.number().int().positive("Los días de entrega deben ser un número entero positivo")
})

export const pedidoCreateSchema = z.object({
    body: z.object({
        cliente: usuarioSchema,
        gig: gigSchema,
        paquete: paqueteSchema,
        total: z.number().positive("El total debe ser mayor a 0"),
        requerimientos: z.string().optional(),
        estado: z.enum(Object.values(EstadoPedido)).optional()
    })
})

export const opinionPedidoSchema = z.object({
    params: z.object({
        id: z.coerce.number().positive("El ID del pedido debe ser un número positivo")
    }),
    body: z.object({
        usuario: usuarioSchema,
        puntuacion: z.number().int().min(1, "La puntuación debe ser entre 1 y 5").max(5, "La puntuación debe ser entre 1 y 5"),
        comentario: z.string().min(1, "El comentario es requerido")
    })
})

export const cambiarEstadoSchema = z.object({
    params: z.object({
        id: z.coerce.number().positive("El ID debe ser un número positivo")
    }),
    body: z.object({
        nuevoEstado: z.enum(Object.values(EstadoPedido), {
            errorMap: () => ({ message: `El estado debe ser uno de: ${Object.values(EstadoPedido).join(", ")}` })
        })
    })
})

export const idParamSchema = z.object({
    params: z.object({
        id: z.coerce.number().positive("El ID debe ser un número positivo")
    })
})

const mensajeSchema = z.object({
    usuario: usuarioSchema,
    mensaje: z.string().min(1, "El mensaje es requerido")
})

export const clienteIdParamSchema = z.object({
    params: z.object({
        clienteId: z.coerce.number().positive("El ID del cliente debe ser un número positivo")
    })
})

export const gigIdParamSchema = z.object({
    params: z.object({
        gigId: z.coerce.number().positive("El ID del gig debe ser un número positivo")
    })
})

export const mensajePedidoSchema = z.object({
    params: z.object({
        id: z.coerce.number().positive("El ID del pedido debe ser un número positivo")
    }),
    body: mensajeSchema
})
