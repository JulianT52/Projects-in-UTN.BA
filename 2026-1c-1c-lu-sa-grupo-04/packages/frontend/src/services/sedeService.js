import api from "../config/api";

export const sedeService = {
  obtenerSedes: () => api.get("/sede"),
};
