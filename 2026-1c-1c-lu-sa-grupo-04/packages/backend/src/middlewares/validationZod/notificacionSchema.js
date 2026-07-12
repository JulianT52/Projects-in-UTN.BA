import { z } from 'zod'

export const notificacionSchema = z.object({
  usuario: z.string().min(1),
  mensaje: z.string().min(1)
})
