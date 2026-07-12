import { z } from "zod"

const paqueteSchema = z.object({
    nombre: z.string().min(1, "El nombre del paquete es requerido"),
    precio: z.number().positive("El precio del paquete debe ser mayor a 0"),
    diasDeEntrega: z.number().int().positive("Los días de entrega deben ser un número entero positivo")
})

export const gigSearchSchema = z.object({
    query: z.object({
        q: z.string().min(1, "El texto de búsqueda debe tener al menos un caracter").optional(),
        categoriaId: z.coerce.number().positive("El ID de categoría debe ser un número positivo").optional(),
        orden: z.enum(["precio", "puntaje", "fechaPublicacion"]).optional()
    })
})

export const gigCreateSchema = z.object({
    body: z.object({
        nombre: z.string().min(1, "El nombre del gig es requerido"),
        descripcion: z.string().min(1, "La descripción del gig es requerida"),
        imagen: z.string().url("La imagen debe ser una URL válida"),
        categoria: z.object({
            id: z.coerce.number().positive("El ID de categoría debe ser un número positivo"),
            nombre: z.string().min(1, "El nombre de la categoría es requerido"),
            descripcion: z.string().min(1, "La descripción de la categoría es requerida")
        }),
        vendedor: z.object({
            id: z.coerce.number().positive("El ID del vendedor debe ser un número positivo"),
            nombre: z.string().min(1, "El nombre del vendedor es requerido"),
            apellido: z.string().min(1, "El apellido del vendedor es requerido"),
            email: z.string().email("El email del vendedor es inválido")
        }),
        paquetes: z.array(paqueteSchema).min(1, "Debe incluir al menos un paquete")
    })
})

export const gigIdParamSchema = z.object({
    params: z.object({
        id: z.coerce.number().positive("El ID del gig debe ser un número positivo")
    })
})

export const categoriaIdParamSchema = z.object({
    params: z.object({
        categoriaId: z.coerce.number().positive("El ID de categoría debe ser un número positivo")
    })
})
