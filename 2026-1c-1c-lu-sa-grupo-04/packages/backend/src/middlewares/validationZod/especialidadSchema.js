import { z } from "zod"
import mongoose from "mongoose"
import { practicaSchema } from "./practicaSchema.js"

export const idEspecialidadQuerySchema = z.object({
  idEspecialidad : z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: "ID de Especialidad inválido",
          })
})

export const especialidadSchema = z.object({
  nombre: z.string().min(2).max(40),
  practicas: z.array(practicaSchema).default([]),
})