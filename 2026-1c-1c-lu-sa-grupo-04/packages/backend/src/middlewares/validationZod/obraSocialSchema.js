import { z } from 'zod'
import { NivelCobertura } from '../../domain/nivelCobertura.js'

const coberturaEspecialidadSchema = z.object({
  especialidad: z.string().min(1),
  nivel: z.enum(Object.values(NivelCobertura)),
})

const coberturaPracticaSchema = z.object({
  practica: z.string().min(1),
  nivel: z.enum(Object.values(NivelCobertura)),
})

const planSchema = z.object({
  nombre: z.string().trim().min(1),
  coberturasEspecialidad: z.array(coberturaEspecialidadSchema).optional(),
  coberturasPractica: z.array(coberturaPracticaSchema).optional(),
})

export const obraSocialSchema = z.object({
  nombre: z.string().trim().min(1),
  planes: z.array(planSchema).optional(),
})
