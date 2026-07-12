import { z } from 'zod'

export const tipoServicioSchema = z.enum(['especialidad', 'practica'])

export const addServicioBodySchema = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('especialidad'),
    nombre: z.string().min(2).max(50),
    duracionTurnoEnMins: z.number().int().positive(),
    costoConsulta: z.number().positive(),
  }),
  z.object({
    tipo: z.literal('practica'),
    codigo: z.string().min(1),
    nombre: z.string().min(2).max(50),
    duracionEnMins: z.number().int().positive(),
    costo: z.number().positive(),
  }),
])

export const updateServicioBodySchema = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('especialidad'),
    costoConsulta: z.number().positive().optional(),
    duracionTurnoEnMins: z.number().int().positive().optional(),
  }),
  z.object({
    tipo: z.literal('practica'),
    costo: z.number().positive().optional(),
    duracionEnMins: z.number().int().positive().optional(),
  }),
])

export const removeServicioQuerySchema = z.object({
  tipo: tipoServicioSchema,
})
