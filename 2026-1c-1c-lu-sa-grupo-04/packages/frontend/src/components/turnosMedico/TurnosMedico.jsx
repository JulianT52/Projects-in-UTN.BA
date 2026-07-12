"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton, Alert } from "antd";
import { turnoService } from "../../services/turnoService";
import { sedeService } from "../../services/sedeService";
import ConfirmarTurnoModal from "../modal/ConfirmarTurnoModal";
import "./TurnosMedico.css";

const LIMIT = 5;

const COBERTURA_LABELS = {
  TOTAL: "Cubierto",
  PARCIAL: "Cobertura parcial",
  NO_CUBIERTA: "No cubierto",
  PARTICULAR: "Particular",
};

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const obtenerSemana = () =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

const TurnosMedico = () => {
  const searchParams = useSearchParams();
  const especialidadInicial = searchParams.get("especialidad") || "";
  const medicoIdInicial = searchParams.get("medicoId") || "";

  const [semana] = useState(() => obtenerSemana());
  const [diaSeleccionado, setDiaSeleccionado] = useState(() => formatDateKey(new Date()));
  const [diasDisponibles, setDiasDisponibles] = useState([]);

  const [sedes, setSedes] = useState([]);
  const [filtros, setFiltros] = useState({
    sedeId: "",
    sortBy: "fechaHora",
    sortOrder: "asc",
  });
  const [profesionalInput, setProfesionalInput] = useState("");
  const [profesionalFiltro, setProfesionalFiltro] = useState("");
  const [especialidadElegidaId, setEspecialidadElegidaId] = useState("");

  const [medicos, setMedicos] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [medicoExpandidoId, setMedicoExpandidoId] = useState(null);
  const [turnoAConfirmar, setTurnoAConfirmar] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    sedeService.obtenerSedes()
      .then((res) => setSedes(res.data))
      .catch((err) => console.error("Error cargando sedes:", err));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setProfesionalFiltro(profesionalInput), 400);
    return () => clearTimeout(timeout);
  }, [profesionalInput]);

  useEffect(() => {
    const cargarDias = async () => {
      try {
        const dias = await turnoService.obtenerDiasDisponibles({
          especialidad: !medicoIdInicial ? (especialidadInicial || undefined) : undefined,
          medicoId: medicoIdInicial || undefined,
          sedeId: filtros.sedeId || undefined,
        });
        setDiasDisponibles(dias);
      } catch (err) {
        setDiasDisponibles([]);
      }
    };
    cargarDias();
  }, [especialidadInicial, medicoIdInicial, filtros.sedeId]);

  useEffect(() => {
    if (diasDisponibles.length > 0 && !diasDisponibles.includes(diaSeleccionado)) {
      setDiaSeleccionado(diasDisponibles[0]);
    }
  }, [diasDisponibles]);

  const buscarMedicos = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const resultado = await turnoService.buscarMedicosConTurnos({
        especialidad: !medicoIdInicial ? (especialidadInicial || undefined) : undefined,
        medicoId: medicoIdInicial || undefined,
        medico: !medicoIdInicial ? (profesionalFiltro || undefined) : undefined,
        sedeId: filtros.sedeId || undefined,
        fecha: diaSeleccionado,
        page,
        limit: LIMIT,
        sortBy: filtros.sortBy,
        sortOrder: filtros.sortOrder,
      });
      setMedicos(resultado.data);
      setPagination(resultado.pagination);
    } catch (err) {
      setError(err.message || "Ocurrió un error al buscar médicos.");
      setMedicos([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarMedicos(1);
  }, [diaSeleccionado, filtros.sedeId, filtros.sortBy, filtros.sortOrder, profesionalFiltro]);

  const formatHora = (fecha) =>
    new Date(fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" });

  const especialidadesDelMedico = medicoIdInicial
    ? (medicos[0]?.especialidades ?? []).filter((esp) => esp.practicas.length > 0)
    : [];

  useEffect(() => {
    if (medicoIdInicial && especialidadesDelMedico.length > 0 && !especialidadElegidaId) {
      setEspecialidadElegidaId(especialidadesDelMedico[0]._id);
    }
  }, [medicos]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header turnos-medico-header">
        <div>
          <h1>Turnos disponibles</h1>
          <p>Elegí un día y reservá el horario que te quede mejor.</p>
        </div>
      </div>

      <div className="filtros-panel">
          <div className="form-group">
            <label>Sede</label>
            <select
              value={filtros.sedeId}
              onChange={(e) => setFiltros({ ...filtros, sedeId: e.target.value })}
            >
              <option value="">Cualquier sede</option>
              {sedes.map((sede) => (
                <option key={sede._id} value={sede._id}>{sede.nombre}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ordenar por</label>
            <select
              value={filtros.sortBy}
              onChange={(e) => setFiltros({ ...filtros, sortBy: e.target.value })}
            >
              <option value="fechaHora">Fecha</option>
              <option value="costo">Costo</option>
            </select>
          </div>

          <div className="form-group">
            <label>Orden</label>
            <select
              value={filtros.sortOrder}
              onChange={(e) => setFiltros({ ...filtros, sortOrder: e.target.value })}
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>

          {!medicoIdInicial && (
            <div className="form-group">
              <label>Profesional</label>
              <input
                type="text"
                placeholder="Ej. Garcia"
                value={profesionalInput}
                onChange={(e) => setProfesionalInput(e.target.value)}
              />
            </div>
          )}

          {medicoIdInicial && especialidadesDelMedico.length > 1 && (
            <div className="form-group">
              <label>Especialidad</label>
              <select
                value={especialidadElegidaId}
                onChange={(e) => setEspecialidadElegidaId(e.target.value)}
              >
                {especialidadesDelMedico.map((esp) => (
                  <option key={esp._id} value={esp._id}>{esp.nombre}</option>
                ))}
              </select>
            </div>
          )}
        </div>

      <div className="dias-selector">
        {semana.map((d) => {
          const key = formatDateKey(d);
          const habilitado = diasDisponibles.includes(key);
          return (
            <button
              key={key}
              className={`dia-btn ${diaSeleccionado === key ? "activo" : ""} ${!habilitado ? "deshabilitado" : ""}`}
              disabled={!habilitado}
              onClick={() => setDiaSeleccionado(key)}
            >
              <span className="dia-nombre">{d.toLocaleDateString("es-AR", { weekday: "short" })}</span>
              <span className="dia-fecha">{d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}</span>
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="medicos-turnos-lista" role="status" aria-busy="true">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="medico-turnos-card">
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          ))}
        </div>
      )}

      {error && <Alert type="error" title={error} showIcon style={{ marginTop: "1rem" }} />}

      {!loading && !error && medicos.length === 0 && (
        <Alert type="info" title="No hay médicos con turnos disponibles ese día." showIcon style={{ marginTop: "1rem" }} />
      )}

      {!loading && !error && medicos.length > 0 && (
        <div className="medicos-turnos-lista">
          {medicos.map((m) => {
            const expandido = medicoExpandidoId === m.medicoId || Boolean(medicoIdInicial);
            // Nunca se muestra más de una especialidad a la vez: si la búsqueda fue por
            // especialidad puntual, se usa esa; si fue por médico, la elegida en el filtro.
            const especialidadesAMostrar = especialidadInicial
              ? m.especialidades.filter((esp) => esp.nombre === especialidadInicial)
              : medicoIdInicial
              ? m.especialidades.filter((esp) => esp._id === especialidadElegidaId)
              : m.especialidades;
            return (
              <div key={m.medicoId} className="medico-turnos-card">
                <button
                  className="medico-turnos-card-header"
                  onClick={() => setMedicoExpandidoId((id) => (id === m.medicoId ? null : m.medicoId))}
                  disabled={Boolean(medicoIdInicial)}
                >
                  <div>
                    <h3>Dr/a. {m.profesional}</h3>
                    <div className="medico-especialidades-costos">
                      {especialidadesAMostrar.map((esp) => (
                        <span key={esp._id} className={`especialidad-costo-badge cobertura-${esp.nivelCobertura}`}>
                          <strong>{esp.nombre}</strong>
                          <span className="badge-separador">·</span>
                          {COBERTURA_LABELS[esp.nivelCobertura] || esp.nivelCobertura}
                        </span>
                      ))}
                    </div>
                  </div>
                  {!medicoIdInicial && (
                    <span className="medico-turnos-count">{m.turnos.length} horarios{expandido ? " ▲" : " ▼"}</span>
                  )}
                </button>

                {expandido && (
                  <div className="pills-container">
                    {m.turnos.map((t) => (
                      <button
                        key={t._id}
                        className="turno-pill"
                        onClick={() => setTurnoAConfirmar(t)}
                      >
                        {formatHora(t.fecha)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="paginacion">
          <button onClick={() => buscarMedicos(pagination.page - 1)} disabled={pagination.page <= 1 || loading}>
            ← Anterior
          </button>
          <span>Página {pagination.page} de {pagination.totalPages}</span>
          <button onClick={() => buscarMedicos(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages || loading}>
            Siguiente →
          </button>
        </div>
      )}

      {turnoAConfirmar && (
        <ConfirmarTurnoModal
          turno={turnoAConfirmar}
          especialidadPreseleccionadaId={
            especialidadInicial
              ? turnoAConfirmar.medicoEspecialidades?.find((e) => e.nombre === especialidadInicial)?._id
              : (especialidadElegidaId || undefined)
          }
          onClose={() => setTurnoAConfirmar(null)}
        />
      )}
    </div>
  );
};

export default TurnosMedico;
