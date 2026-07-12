"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { authService } from "../../services/authService";
import "./Login.css";
import { useNotificaciones } from "../../context/NotificacionesContext";
import { obtenerRutaPorRol } from "../../utils/rolUsuario";

export default function LoginPage({ onLoginSuccess, onError }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { recargar } = useNotificaciones();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.password) {
      setError("Por favor, completá todos los campos.");
      return;
    }

    setLoading(true);
    try {
      const usuario = await authService.login(formData.username, formData.password);
      recargar();
      onLoginSuccess(usuario);
      message.success("¡Bienvenido!");
      router.push(obtenerRutaPorRol(usuario));
    } catch (err) {
      onError(err.message || "Ocurrió un error al intentar ingresar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left-panel">
        <form className="login-form" onSubmit={handleSubmit}>
        
          <h1 className="login-title">Iniciá sesión</h1>

          {error && <p className="error-msg">{error}</p>}

          <div className="input-group">
            <input
              type="text"
              placeholder="Ingresá tu usuario"
              value={formData.username}
              disabled={loading}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Ingresá tu contraseña"
              value={formData.password}
              disabled={loading}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>


          <div className="register-prompt">
            ¿No tenés cuenta?{" "}
            <span 
              className="register-link" 
              onClick={() => router.push("/registro")}
            >
              Registrarme
            </span>
          </div>
        </form>
      </div>

      <div className="login-right-panel"></div>
    </div>
  );
}