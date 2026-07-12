import { z } from 'zod'

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export const medicoPacienteParamsSchema = z.object({
  id: z.string().min(1),
  pacienteId: z.string().min(1),
})

export const pacienteTurnoParamsSchema = z.object({
  id: z.string().min(1),
  turnoId: z.string().min(1),
})

export const medicoTurnoParamsSchema = z.object({
  id: z.string().min(1),
  turnoId: z.string().min(1),
})

export const medicoServicioParamsSchema = z.object({
  id: z.string().min(1),
  idServicio: z.string().min(1),
})

export const medicoEspecialidadParamsSchema = z.object({
  id: z.string().min(1),
  idEspecialidad: z.string().min(1),
})
