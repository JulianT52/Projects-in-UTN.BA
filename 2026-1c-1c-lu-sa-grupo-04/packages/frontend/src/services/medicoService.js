import api from "../config/api";

export const medicoService = {
  crearMedico: async (datos) => {
    const res = await api.post("/medico", datos);
    return res.data;
  },

  buscarPorNombre: async (nombre) => {
    const res = await api.get("/medico", { nombre });
    return res.data;
  },

  obtenerPacientes: async (medicoId) => {
    const res = await api.get(`/medico/${medicoId}/historialPacientes`);
    return res.data;
  },

  obtenerTurnos: async (medicoId) => {
    const res = await api.get(`/medico/${medicoId}/turnos`);
    return res.data;
  },

  cancelarTurno: async (medicoId, turnoId, motivo) => {
    const res = await api.post(`/medico/${medicoId}/turnos/${turnoId}/cancelacion`, {
      motivo,
    });
    return res.data;
  },

  marcarTurnoRealizado: async (medicoId, turnoId) => {
    const res = await api.post(`/medico/${medicoId}/turnos/${turnoId}/realizacion`);
    return res.data;
  },

  proponerCambioFecha: async (medicoId, turnoId, nuevaFecha, motivo) => {
    const res = await api.post(`/medico/${medicoId}/turnos/${turnoId}/propuesta-cambio`, { nuevaFecha, motivo });
    return res.data;
  },

  resolverSolicitudCambio: async (medicoId, turnoId, aceptaCambio) => {
    const res = await api.patch(`/medico/${medicoId}/turnos/${turnoId}/propuesta-cambio`, { aceptaCambio });
    return res.data;
  },

  obtenerHistorialPaciente: async (medicoId, pacienteId) => {
    try {
      const res = await api.get(`/medico/${medicoId}/pacientes/${pacienteId}/historial`);
      return res.data;
    } catch (error) {
      if (error.message.includes("No se encontraron turnos")) return [];
      throw error;
    }
  },

  definirDisponibilidades: async (medicoId, disponibilidades) => {
    const res = await api.post("/medico/disponibilidades", {
      idMedico: medicoId,
      disponibilidades,
    });

    return res.data;
  },

  actualizarDisponibilidades: async (medicoId, disponibilidades) => {
    const res = await api.patch("/medico/disponibilidades", {
      idMedico: medicoId,
      disponibilidades,
    });

    return res.data;
  },

  eliminarDisponibilidad: async (medicoId, disponibilidad) => {
    const res = await api.del("/medico/disponibilidades", {
      idMedico: medicoId,
      disponibilidad,
    });

    return res.data;
  },

  obtenerServicios: async (medicoId) => {
    const res = await api.get(`/medico/${medicoId}/servicios`);
    return res.data;
  },

  agregarEspecialidad: async (medicoId, especialidad) => {
    const res = await api.post(`/medico/${medicoId}/especialidades`, especialidad);
    return res.data;
  },

  modificarEspecialidad: async (medicoId, idEspecialidad, especialidad) => {
    const res = await api.patch(
      `/medico/${medicoId}/especialidades?idEspecialidad=${idEspecialidad}`,
      especialidad
    );

    return res.data;
  },

  eliminarEspecialidad: async (medicoId, idEspecialidad) => {
    const res = await api.del(
      `/medico/${medicoId}/especialidades?idEspecialidad=${idEspecialidad}`
    );

    return res.data;
  },

  agregarPractica: async (medicoId, idEspecialidad, practica) => {
    const res = await api.post(
      `/medico/${medicoId}/especialidades/${idEspecialidad}/practicas`,
      practica
    );

    return res.data;
  },

  modificarPractica: async (medicoId, idEspecialidad, idPractica, practica) => {
    const res = await api.patch(
      `/medico/${medicoId}/especialidades/${idEspecialidad}/practicas/${idPractica}`,
      practica
    );

    return res.data;
  },

  eliminarPractica: async (medicoId, idEspecialidad, idPractica) => {
    const res = await api.del(
      `/medico/${medicoId}/especialidades/${idEspecialidad}/practicas/${idPractica}`
    );

    return res.data;
  },
};