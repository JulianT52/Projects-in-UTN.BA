"use client";
import { createContext, useContext, useState, useEffect } from "react";
import Modal from "../components/modal/Modal";
import { authService } from "../services/authService";
import { CarritoProvider } from "../context/CarritoContext";
import { NotificacionesProvider } from "../context/NotificacionesContext";

const AuthContext = createContext(null);

export function Providers({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, message: "" });

  useEffect(() => {
    setUsuario(authService.isAuthenticated() ? authService.getUsuario() : null);
  }, []);

  const showModal = (message) => setModal({ isOpen: true, message });
  const closeModal = () => setModal({ isOpen: false, message: "" });

  const login = (usuarioData) => setUsuario(usuarioData);
  const logout = () => {
    authService.logout();
    setUsuario(null);
  };

  let rol = null;
  if (usuario) {
    rol = usuario.rol;
  }
  const isLoggedIn = authService.isAuthenticated();

  return (
    <AuthContext.Provider value={{ usuario, rol, isLoggedIn, login, logout, showModal }}>
      <CarritoProvider>
      <NotificacionesProvider>
      {modal.isOpen && <Modal message={modal.message} onClose={closeModal} />}
      {children}
      </NotificacionesProvider>
      </CarritoProvider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}