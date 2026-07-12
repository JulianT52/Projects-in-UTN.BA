import api from "../config/api";

export const authService = {
  login: async (nombreUsuario, password) => {
    const res = await api.post("/auth/login", { nombreUsuario, password });
    const { token, usuario } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));

    return usuario;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  },

  getUsuario: () => {
    const raw = localStorage.getItem("usuario");
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated: () => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem("token") && localStorage.getItem("usuario"));
  },
};
