import { z } from 'zod'

export const sedeSchema = z.object({
  nombre: z.string().trim().min(2).max(50),
  direccion: z.string().trim().min(2).max(100),
})
