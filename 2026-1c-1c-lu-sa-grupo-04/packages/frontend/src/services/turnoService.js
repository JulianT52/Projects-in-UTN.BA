import api from "../config/api";

export const turnoService = {
  buscarDisponibles: (filtros) => api.get("/turnos/disponibles", filtros),
  buscarMedicosConTurnos: (filtros) => api.get("/turnos/disponibles", { ...filtros, vista: "medicos" }),
  obtenerDiasDisponibles: (filtros) => api.get("/turnos/disponibles", { ...filtros, vista: "dias" }).then((res) => res.data),
  reservar: (turnoId, body) => api.patch(`/turnos/${turnoId}/reservar`, body),
  cotizar: (turnoId, params) => api.get(`/turnos/${turnoId}/cotizar`, params),
  obtenerMisTurnos: (pacienteId) => api.get(`/paciente/${pacienteId}/turnos`),
  cancelar: (pacienteId, turnoId, motivo) => api.post(`/paciente/${pacienteId}/turnos/${turnoId}/cancelacion`, { motivo }),
  solicitarCambioFecha: (pacienteId, turnoId, nuevaFecha, motivo) => api.post(`/paciente/${pacienteId}/turnos/${turnoId}/solicitud-cambio`, { nuevaFecha, motivo }),
  resolverCambioFecha: (pacienteId, turnoId, aceptaCambio) => api.patch(`/paciente/${pacienteId}/turnos/${turnoId}/solicitud-cambio`, {aceptaCambio}),
};