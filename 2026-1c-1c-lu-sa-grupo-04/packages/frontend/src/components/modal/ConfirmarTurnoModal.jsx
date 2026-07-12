"use client";
import React, { useState } from "react";
import { Alert, Spin } from "antd";
import { turnoService } from "../../services/turnoService";
import { useCarrito } from "../../context/CarritoContext";
import { useRouter } from "next/navigation";
import "./Modal.css";
import "./ConfirmarTurnoModal.css";

const ConfirmarTurnoModal = ({ turno, especialidadPreseleccionadaId, onClose }) => {
  const { agregarAlCarrito } = useCarrito();
  const router = useRouter();

  const especialidades = turno?.medicoEspecialidades ?? [];

  const especialidadInicialId = especialidadPreseleccionadaId
    || (especialidades.length === 1 ? especialidades[0]._id : "");
  const especialidadBloqueada = Boolean(especialidadInicialId);

  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(especialidadInicialId);

  const practicas = especialidadSeleccionada
    ? (especialidades.find((e) => e._id === especialidadSeleccionada)?.practicas ?? [])
    : [];

  const practicaInicialId = practicas.length === 1 ? practicas[0]._id : "";
  const practicaBloqueada = practicas.length === 1;

  const [practicaSeleccionada, setPracticaSeleccionada] = useState(practicaInicialId);
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState(null); // { type: 'warning'|'error', text: string }

  const handleEspecialidadChange = (e) => {
    setEspecialidadSeleccionada(e.target.value);
    setPracticaSeleccionada("");
    setAlerta(null);
  };

  const handleConfirmar = async () => {
    if (!especialidadSeleccionada) {
      setAlerta({ type: "warning", text: "Seleccioná una especialidad antes de confirmar." });
      return;
    }
    if (!practicaSeleccionada) {
      setAlerta({ type: "warning", text: "Seleccioná una práctica antes de confirmar." });
      return;
    }

    setLoading(true);
    setAlerta(null);
    try {
      const respuesta = await turnoService.cotizar(turno._id, {
        especialidadId: especialidadSeleccionada,
        practicaId: practicaSeleccionada,
      });

      const espObj = especialidades.find((e) => e._id === especialidadSeleccionada);
      const pracObj = espObj?.practicas?.find((p) => p._id === practicaSeleccionada);

      agregarAlCarrito({
        ...turno,
        especialidadId: especialidadSeleccionada,
        especialidadNombre: espObj?.nombre,
        practicaId: practicaSeleccionada,
        practicaNombre: pracObj?.nombre,
        servicio: pracObj?.nombre || espObj?.nombre || turno.servicio,
        nivelCobertura: respuesta.data.nivelCobertura,
        costoBase: respuesta.data.costoBase,
        montoAAbonar: respuesta.data.montoAAbonar,
      });

      onClose();
      router.push("/paciente/carrito");
    } catch (err) {
      setAlerta({
        type: "error",
        text: err.message || "Ocurrió un error al calcular el costo del turno. Intentá de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha) =>
    new Date(fecha).toLocaleString("es-AR", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Argentina/Buenos_Aires",
    });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content confirmar-turno-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-titulo">Confirmar turno</h2>

        <div className="turno-resumen">
          <p>
            <strong>Profesional:</strong> {turno.profesional}
          </p>
          <p>
            <strong>Fecha:</strong> {formatFecha(turno.fecha)}
          </p>
          <p>
            <strong>Sede:</strong> {turno.sede}
          </p>
        </div>

        <div className="modal-form">
          {especialidadBloqueada ? (
            <div className="modal-form-group">
              <label>Especialidad</label>
              <p className="modal-valor-fijo">
                {especialidades.find((e) => e._id === especialidadSeleccionada)?.nombre}
              </p>
            </div>
          ) : (
            <div className="modal-form-group">
              <label htmlFor="especialidad-modal">Especialidad</label>
              <select
                id="especialidad-modal"
                value={especialidadSeleccionada}
                onChange={handleEspecialidadChange}
                disabled={loading}
              >
                <option value="">-- Seleccioná una especialidad --</option>
                {especialidades.map((esp) => (
                  <option key={esp._id} value={esp._id}>
                    {esp.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {practicaBloqueada ? (
            <div className="modal-form-group">
              <label>Práctica</label>
              <p className="modal-valor-fijo">
                {practicas[0].nombre} — ${Number(practicas[0].costo).toLocaleString("es-AR")}
              </p>
            </div>
          ) : (
            <div className="modal-form-group">
              <label htmlFor="practica-modal">Práctica</label>
              <select
                id="practica-modal"
                value={practicaSeleccionada}
                onChange={(e) => {
                  setPracticaSeleccionada(e.target.value);
                  setAlerta(null);
                }}
                disabled={!especialidadSeleccionada || loading}
              >
                <option value="">
                  {especialidadSeleccionada
                    ? "-- Seleccioná una práctica --"
                    : "Primero elegí una especialidad"}
                </option>
                {practicas.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.nombre} — ${Number(p.costo).toLocaleString("es-AR")}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {alerta && (
          <Alert
            type={alerta.type}
            title={alerta.text}
            showIcon
            style={{ borderRadius: "6px" }}
          />
        )}

        <div className="modal-acciones">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleConfirmar} disabled={loading}>
            {loading ? <Spin size="small" /> : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarTurnoModal;
