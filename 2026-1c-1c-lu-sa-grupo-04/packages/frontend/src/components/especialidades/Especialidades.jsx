"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton, Alert } from "antd";
import { SearchOutlined, UserOutlined, CloseOutlined } from "@ant-design/icons"
import { especialidadService } from "../../services/especialidadesService.js";
import "./Especialidades.css";

const EMOJIS_ESPECIALIDADES = {
  cardiologia: "🫀",
  dermatologia: "✨",
  pediatria: "🧸",
  ginecologia: "🌸",
  traumatologia: "🦴",
  nutricion: "🍏",
  clinica: "🏥",
  oftalmologia: "👁️",
};

const Especialidades = () => {
  const router = useRouter();
  const [especialidades, setEspecialidades] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarEspecialidades = async () => {
      setLoading(true);
      setError("");
      try {
        const respuesta = await especialidadService.obtenerEspecialidades();
        setEspecialidades(respuesta.data);
      } catch (error) {
        setError(error.message || "No se pudieron cargar las especialidades.");
        setEspecialidades([]);
      } finally {
        setLoading(false);
      }
    };

    cargarEspecialidades();
  }, []);

  const especialidadesFiltradas = especialidades.filter(
    (esp) =>
      esp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      esp.desc.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSeleccionarEspecialidad = (nombre) => {
    router.push(`/paciente/turnosMedico?especialidad=${encodeURIComponent(nombre)}`);
  };

  return (
    <div className="especialidades-container">
      <div className="especialidades-header">
        <h1>Nuestras Especialidades Médicas</h1>
        <p>
          Conocé las áreas de atención de Sweet Medical preparadas para vos.
        </p>

        <div className="search-bar-container">
          <span className="search-icon"><SearchOutlined /></span>
          <input
            type="text"
            placeholder="Buscar especialidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading && (
        <div className="especialidades-grid" role="status" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="especialidad-card">
              <Skeleton active avatar paragraph={{ rows: 3 }} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          style={{ marginTop: "1rem" }}
        />
      )}

      {!loading && !error && (
        <div className="especialidades-grid">
          {especialidadesFiltradas.length > 0 ? (
            especialidadesFiltradas.map((esp) => {
              const emojiAsociado = EMOJIS_ESPECIALIDADES[esp.id] || "🩺";

              return (
                <div key={esp.id} className="especialidad-card">
                  <div className="esp-icon-badge">
                    {emojiAsociado}
                  </div>

                  <h3>{esp.nombre}</h3>

                  <p>{esp.desc}</p>

                  <div className="esp-footer">
                    <span className="medicos-count">
                      <UserOutlined /> {esp.medicos} Profesionales
                    </span>

                    <button
                      className="btn-ver-turnos"
                       onClick={() => handleSeleccionarEspecialidad(esp.nombre)}
                    >
                      Ver Turnos ➔
                    </button>
                  </div>
                </div>
              );
          })
        ) : (
          <div className="no-results">
            <p><CloseOutlined /> No se encontraron especialidades.</p>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default Especialidades;