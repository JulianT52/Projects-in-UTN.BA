import { z } from 'zod'
import mongoose from 'mongoose';
import { especialidadSchema } from './especialidadSchema.js'

const disponibilidadEnMedicoSchema = z.object({
  diaSemana: z.enum(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']),
  horaDesde: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  horaHasta: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
})

export const medicoSchema = z
  .object({
    usuario: z.record(z.string(), z.unknown()),
    nombre: z.string().trim().min(1).max(40),
    apellido: z.string().trim().min(1).max(40),
    matricula: z.string().trim().min(1).max(20),
    especialidades: z.array(especialidadSchema).optional(),
    sedes: z
      .array(
        z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
          message: "ID de sede inválido",
        })
      )
      .optional(),
    disponibilidades: z.array(disponibilidadEnMedicoSchema).optional(),
  })
  .strict();

export const disponibilidadesQuerySchema = z.object({
  idMedico: z.string().min(1),
  idServicio: z.string().min(1),
})

export const buscarMedicoQuerySchema = z.object({
  nombre: z.string().trim().optional(),
})
