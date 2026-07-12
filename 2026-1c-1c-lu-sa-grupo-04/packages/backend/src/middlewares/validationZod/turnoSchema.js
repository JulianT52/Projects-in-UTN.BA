import { z } from 'zod'
import { EstadoTurno } from '../../domain/estadoTurno.js'

const motivoSchema = z.string().trim().min(1)
const nuevaFechaSchema = z.union([z.string().min(1), z.coerce.date()])

export const propuestaCambioBodySchema = z.object({
  nuevaFecha: nuevaFechaSchema,
  motivo: motivoSchema,
})

export const cancelacionBodySchema = z.object({
  motivo: motivoSchema,
})

export const solicitarCambioBodySchema = z.object({
  nuevaFecha: nuevaFechaSchema,
  motivo: motivoSchema,
})

export const resolverCambioBodySchema = z.object({
  aceptaCambio: z.boolean(),
})

export const reservarTurnoBodySchema = z.object({
  especialidadId: z.string().min(1, "La especialidad es obligatoria"),
  practicaId: z.string().min(1, "La práctica es obligatoria"),
})

export const cotizarTurnoQuerySchema = z.object({
  especialidadId: z.string().min(1, "La especialidad es obligatoria"),
  practicaId: z.string().min(1, "La práctica es obligatoria"),
})

export const buscarDisponiblesQuerySchema = z.object({
  vista: z.enum(['turnos', 'medicos', 'dias']).optional().default('turnos'),
  medicoId: z.string().optional(),
  medico: z.string().optional(),
  especialidadId: z.string().optional(),
  especialidad: z.string().optional(),
  practicaId: z.string().optional(),
  sedeId: z.string().optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)").optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  sortBy: z.enum(['fechaHora', 'costo']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
}).superRefine((data, ctx) => {
  if (data.vista === 'medicos' && !data.fecha) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['fecha'],
      message: "La fecha es obligatoria para vista=medicos (formato YYYY-MM-DD)",
    });
  }
});
