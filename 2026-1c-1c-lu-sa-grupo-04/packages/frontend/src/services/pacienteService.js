import api from "../config/api";

export const pacienteService = {
  crearPaciente: async (datos) => {
    const res = await api.post("/paciente", datos);
    return res.data;
  },

  obtenerPerfil: async (pacienteId) => {
    const res = await api.get(`/paciente/${pacienteId}`);
    return res.data;
  },
};
