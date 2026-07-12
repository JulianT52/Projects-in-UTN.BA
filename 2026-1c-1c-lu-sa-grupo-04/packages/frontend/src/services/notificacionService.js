import api from "../config/api";

export const notificacionService = {
    
  obtenerSinLeer: async (usuarioId) => {
    const res = await api.get(`/notificacion/usuario/${usuarioId}/sin-leer`);
    return res.data;
  },

  obtenerLeidas: async (usuarioId) => {
    const res = await api.get(`/notificacion/usuario/${usuarioId}/leidas`);
    return res.data;
  },

  marcarComoLeida: async (notificacionId) => {
    const res = await api.patch(`/notificacion/${notificacionId}/leer`);
    return res.data;
  },

  crear: async (datos) => {
    const res = await api.post(`/notificacion/`, datos);
    return res.data;
  },
};