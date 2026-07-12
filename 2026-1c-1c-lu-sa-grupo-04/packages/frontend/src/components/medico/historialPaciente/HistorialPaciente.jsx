"use client";
import { useState, useEffect } from "react";
import { Skeleton, Alert } from "antd";
import "./HistorialPaciente.css";
import { medicoService } from "../../../services/medicoService";
import { authService } from "../../../services/authService";


const HistorialPaciente = () => {

    const [pacientes, setPacientes] = useState([]);               
  const [cargandoPacientes, setCargandoPacientes] = useState(true);
  const [errorPacientes, setErrorPacientes] = useState("");

  const [pacienteSel, setPacienteSel] = useState(null);
  const [historial, setHistorial] = useState([]);                
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState("");

  useEffect(() => {
    const cargarPacientes = async () => {
      const usuario = authService.getUsuario();
      const medicoId = usuario?.medicoId;

      if (!medicoId) {
        setErrorPacientes("No se pudo identificar al médico. Iniciá sesión nuevamente.");
        setCargandoPacientes(false);
        return;
      }

      try {
        const data = await medicoService.obtenerPacientes(medicoId);
        setPacientes(data);
      } catch (e) {
        setErrorPacientes(e.message);
      } finally {
        setCargandoPacientes(false);
      }
    };

    cargarPacientes();
  }, []);

  const verHistorial = async (paciente) => {
    setPacienteSel(paciente);
    setCargandoHistorial(true);
    setHistorial([]);
    setErrorHistorial("");

    const usuario = authService.getUsuario();
    const medicoId = usuario?.medicoId;

    try {
      const turnos = await medicoService.obtenerHistorialPaciente(medicoId, paciente._id);
      setHistorial(turnos);
    } catch (error) {
      setErrorHistorial(error.message);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const formatFecha = (f) =>
    new Date(f).toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Argentina/Buenos_Aires" });

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h1>Historial de pacientes</h1>
        <p>Elegí un paciente para ver su historial de turnos.</p>
      </div>

      <div className="historial-layout">
        <section className="pacientes-lista">
          <h2>Mis pacientes</h2>

          {cargandoPacientes && <Skeleton active paragraph={{ rows: 4 }} />}
          {errorPacientes && <Alert type="error" message={errorPacientes} showIcon />}
          
          {!cargandoPacientes && !errorPacientes && pacientes.length === 0 && (
            <Alert type="info" message="Todavía no tenés pacientes con turnos." showIcon />
          )}

          {!cargandoPacientes && pacientes.map((p) => {
            let clase = "paciente-item";
            if (pacienteSel && pacienteSel._id === p._id) {
              clase = "paciente-item activo";
            }
            return (
              <button key={p._id} className={clase} onClick={() => verHistorial(p)}>
                <strong>{p.nombre} {p.apellido}</strong>
                <span>DNI: {p.dni}</span>
              </button>
            );
          })}
        </section>

        <section className="historial-detalle">
          {!pacienteSel && !cargandoPacientes && (
            <p className="mensaje-placeholder">Seleccioná un paciente de la lista para comenzar.</p>
          )}

          {pacienteSel && (
            <>
              <h2>Historial de {pacienteSel.nombre} {pacienteSel.apellido}</h2>

              {cargandoHistorial && <Skeleton active paragraph={{ rows: 3 }} />}
              {errorHistorial && <Alert type="error" message={errorHistorial} showIcon />}
              
              {!cargandoHistorial && !errorHistorial && historial.length === 0 && (
                <Alert type="info" message="Este paciente no tiene turnos registrados." showIcon />
              )}

              {!cargandoHistorial && historial.map((t) => (
                <div key={t._id} className="turno-card">
                  <p>📅 {formatFecha(t.fechaHora)}</p>
                  <p>Estado: <strong>{t.estado}</strong></p>
                </div>
              ))}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default HistorialPaciente;