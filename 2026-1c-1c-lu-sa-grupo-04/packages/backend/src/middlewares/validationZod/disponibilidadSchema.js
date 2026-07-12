import { z } from 'zod'

const disponibilidad = z.object({
  diaSemana: z.enum(["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"]),
        horaDesde: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/), // Formato HH:mm
        horaHasta: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),// Formato HH:mm
        sede: z.string().min(1, "La sede es obligatoria"),
}).refine(d => {
  const toMin = s => {
    const [h,m] = s.split(':').map(Number);
    return h*60 + m;
  };
  return toMin(d.horaDesde) < toMin(d.horaHasta);
}, { message: 'la hora de inicio debe ser anterior a la hora de finalización'});

//duda deberia sacar la validacion de medicoSchema y solo importar esta clase?
export const disponibilidadesSchema = z.object({
  idMedico: z.string().min(1),
  disponibilidades: z.array(disponibilidad).min(1)
})

export const eliminarDisponibilidadSchema = z.object({
  idMedico: z.string().min(1),
  disponibilidad: disponibilidad
})