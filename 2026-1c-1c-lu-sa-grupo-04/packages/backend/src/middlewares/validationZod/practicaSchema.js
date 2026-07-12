import { z } from "zod"

export const practicaSchema = z.object({
  codigo: z.string().min(1),
  nombre: z.string().min(2).max(40),
  duracionEnMins: z.number().int().positive(),
  costo: z.number().positive()
})
      
    
