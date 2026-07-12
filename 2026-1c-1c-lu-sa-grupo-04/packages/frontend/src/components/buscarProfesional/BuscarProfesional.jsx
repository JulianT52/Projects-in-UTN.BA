"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton, Alert } from "antd";
import { SearchOutlined } from "@ant-design/icons"
import { medicoService } from "../../services/medicoService";
import "./BuscarProfesional.css";

const BuscarProfesional = () => {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarMedicos = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await medicoService.buscarPorNombre("");
        setMedicos(data);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los médicos.");
        setMedicos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarMedicos();
  }, []);

  const medicosFiltrados = medicos.filter((m) => {
    const texto = busqueda.toLowerCase();
    return (
      m.nombre.toLowerCase().includes(texto) ||
      m.apellido.toLowerCase().includes(texto) ||
      (m.especialidades ?? []).some((e) => e.nombre.toLowerCase().includes(texto))
    );
  });

  const irATurnos = (medicoId) => {
    router.push(`/paciente/turnosMedico?medicoId=${medicoId}`);
  };

  return (
    <div className="buscar-profesional-container">
      <div className="buscar-profesional-header">
        <h1>Buscar por Profesional</h1>
        <p>Elegí un médico o buscalo por nombre, apellido o especialidad.</p>

        <div className="search-bar-container">
          <span className="search-icon"><SearchOutlined /></span>
          <input
            type="text"
            placeholder="Ej. Garcia"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading && (
        <div className="medicos-grid" role="status" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="medico-card">
              <Skeleton active avatar paragraph={{ rows: 2 }} />
            </div>
          ))}
        </div>
      )}

      {error && <Alert type="error" message={error} showIcon style={{ marginTop: "1rem" }} />}

      {!loading && !error && medicosFiltrados.length === 0 && (
        <Alert type="info" message="No se encontraron médicos con ese criterio." showIcon style={{ marginTop: "1rem" }} />
      )}

      {!loading && !error && medicosFiltrados.length > 0 && (
        <div className="medicos-grid">
          {medicosFiltrados.map((m) => (
            <div key={m._id} className="medico-card">
              <div className="medico-card-icon">🩺</div>
              <h3>Dr/a. {m.nombre} {m.apellido}</h3>
              <div className="medico-especialidades-tags">
                {(m.especialidades ?? []).map((e) => (
                  <span key={e._id} className="especialidad-tag">{e.nombre}</span>
                ))}
              </div>
              <div className="medico-card-footer">
                <button className="btn-ver-turnos" onClick={() => irATurnos(m._id)}>
                  Ver Turnos ➔
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuscarProfesional;
