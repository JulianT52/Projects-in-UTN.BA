import { z } from 'zod'

export const pacienteSchema = z
  .object({
    nombre: z.string().trim().min(1),
    apellido: z.string().trim().min(1),
    dni: z.string().trim().min(1),
    usuario: z.record(z.string(), z.unknown()),
    obraSocial: z.string().optional(),
    plan: z.string().optional(),
  })
  .strict()
  .refine((data) => !(data.plan && !data.obraSocial), {
    message: 'No se puede asignar un plan sin una obra social asociada',
    path: ['plan'],
  })
