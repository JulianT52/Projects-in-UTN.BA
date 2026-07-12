import api from "../config/api";

export const obraSocialService = {
  obtenerObrasSociales: async () => {
    const res = await api.get("/obraSocial");
    return res.data;
  },
};
