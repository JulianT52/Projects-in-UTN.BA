"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { notificacionService } from "../services/notificacionService";

const NotificacionesContext = createContext();

export function NotificacionesProvider({ children }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const getUsuarioId = () => {
    try {
      const raw = localStorage.getItem("usuario");
      if (!raw) return null;
      const usuario = JSON.parse(raw);
      return usuario?.id || null;
    } catch {
      return null;
    }
  };

  const cargarNotificaciones = useCallback(async () => {
    const usuarioId = getUsuarioId();
    if (!usuarioId) {
      setNotificaciones([]);
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      const [sinLeer, leidas] = await Promise.all([
        notificacionService.obtenerSinLeer(usuarioId),
        notificacionService.obtenerLeidas(usuarioId),
      ]);
      setNotificaciones([...sinLeer, ...leidas]);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error.message);
      setNotificaciones([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarNotificaciones();
  }, [cargarNotificaciones]);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const marcarComoLeida = async (notificacionId) => {
    try {
      await notificacionService.marcarComoLeida(notificacionId);
      setNotificaciones((prev) =>
        prev.map((n) => (n._id === notificacionId ? { ...n, leida: true } : n))
      );
    } catch (error) {
      console.error("Error al marcar como leída:", error.message);
    }
  };

  const marcarTodasComoLeidas = async () => {
    const sinLeer = notificaciones.filter((n) => !n.leida);
    try {
      await Promise.all(
        sinLeer.map((n) => notificacionService.marcarComoLeida(n._id))
      );
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error.message);
    }
  };

  return (
    <NotificacionesContext.Provider
      value={{ notificaciones, noLeidas, cargando, marcarComoLeida, marcarTodasComoLeidas, recargar: cargarNotificaciones }}
    >
      {children}
    </NotificacionesContext.Provider>
  );
}

export const useNotificaciones = () => useContext(NotificacionesContext);