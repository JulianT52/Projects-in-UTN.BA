"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import "./Register.css";
import {
  UserOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { obraSocialService } from "../../services/obraSocialService";
import { pacienteService } from "../../services/pacienteService";
import { medicoService } from "../../services/medicoService";

export default function RegisterPage({ onError }) {
  const router = useRouter();
  const [tipoUsuario, setTipoUsuario] = useState("paciente");
  const [obrasSociales, setObrasSociales] = useState([]);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    obraSocial: "",
    plan: "",
    matricula: "",
    username: "",
    contrasena: "",
    confirmarContrasena: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    obraSocialService
      .obtenerObrasSociales()
      .then(setObrasSociales)
      .catch(() => setObrasSociales([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleObraSocialChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, obraSocial: value, plan: "" }));
  };

  const obraSocialSeleccionada = obrasSociales.find(
    (os) => os._id === formData.obraSocial
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const requiredFields =
      tipoUsuario === "paciente"
        ? [
            "nombre",
            "apellido",
            "dni",
            "username",
            "contrasena",
            "confirmarContrasena",
          ]
        : [
            "nombre",
            "apellido",
            "matricula",
            "username",
            "contrasena",
            "confirmarContrasena",
          ];

    const hayVacios = requiredFields.some(
      (campo) => !formData[campo]?.trim()
    );

    if (hayVacios) {
      setError("Por favor completá todos los campos.");
      return;
    }

    if (formData.contrasena !== formData.confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const usuario = { nombreUsuario: formData.username, password: formData.contrasena };

      if (tipoUsuario === "paciente") {
        const datosPaciente = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          dni: formData.dni,
          usuario,
        };
        if (formData.obraSocial) datosPaciente.obraSocial = formData.obraSocial;
        if (formData.plan) datosPaciente.plan = formData.plan;

        await pacienteService.crearPaciente(datosPaciente);
      } else {
        await medicoService.crearMedico({
          nombre: formData.nombre,
          apellido: formData.apellido,
          matricula: formData.matricula,
          usuario,
        });
      }

      message.success("Registro exitoso. Iniciá sesión para continuar.");
      router.push("/login");
    } catch (err) {
      const msg = err?.message || "Ocurrió un error al registrarse.";
      setError(msg);

      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-left-panel">
        <form className="register-form" onSubmit={handleSubmit}>

          <div className="register-type-section">

  <div className="type-cards-row">

    <div
      className={`type-card-small ${
        tipoUsuario === "paciente" ? "selected" : ""
      }`}
      onClick={() => setTipoUsuario("paciente")}
    >
      <div className="type-icon">
        <UserOutlined />
      </div>

      <span>Soy paciente</span>
    </div>

    <div
      className={`type-card-small ${
        tipoUsuario === "medico" ? "selected" : ""
      }`}
      onClick={() => setTipoUsuario("medico")}
    >
      <div className="type-icon">
        <MedicineBoxOutlined />
      </div>

      <span>Soy médico</span>
    </div>

  </div>
</div>

          <h2 className="register-title">
            Ingresá tus datos para registrarte
          </h2>

          {error && (
            <p className="error-msg">
              {error}
            </p>
          )}

          <div className="form-row">
            <div className="input-group">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                disabled={loading}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={formData.apellido}
                disabled={loading}
                onChange={handleChange}
              />
            </div>
          </div>

          {tipoUsuario === "paciente" ? (
            <>
              <div className="input-group">
                <input
                  type="text"
                  name="dni"
                  placeholder="DNI"
                  value={formData.dni}
                  disabled={loading}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <select
                    name="obraSocial"
                    value={formData.obraSocial}
                    disabled={loading}
                    onChange={handleObraSocialChange}
                  >
                    <option value="">Sin obra social</option>
                    {obrasSociales.map((os) => (
                      <option key={os._id} value={os._id}>
                        {os.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <select
                    name="plan"
                    value={formData.plan}
                    disabled={loading || !obraSocialSeleccionada}
                    onChange={handleChange}
                  >
                    <option value="">Sin plan</option>
                    {obraSocialSeleccionada?.planes.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <div className="input-group">
              <input
                type="text"
                name="matricula"
                placeholder="Matrícula"
                value={formData.matricula}
                disabled={loading}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="input-group">
            <input
              type="text"
              name="username"
              placeholder="Nombre de usuario"
              value={formData.username}
              disabled={loading}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="contrasena"
              placeholder="Contraseña"
              value={formData.contrasena}
              disabled={loading}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="confirmarContrasena"
              placeholder="Confirmar contraseña"
              value={formData.confirmarContrasena}
              disabled={loading}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Registrar"}
          </button>

        </form>
      </div>

      <div className="register-right-panel"></div>
    </div>
  );
}