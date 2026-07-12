import api from "../config/api";

export const especialidadService = {
  obtenerEspecialidades: () => api.get("/especialidades"),
};
