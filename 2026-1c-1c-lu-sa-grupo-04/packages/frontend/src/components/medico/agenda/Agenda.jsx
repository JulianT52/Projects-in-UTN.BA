"use client";
import { useState, useEffect } from "react";
import { Skeleton, Alert, Modal, Input, Select, message } from "antd";
import { InsertRowAboveOutlined } from "@ant-design/icons"
import { medicoService } from "../../../services/medicoService";
import { turnoService } from "../../../services/turnoService";
import { authService } from "../../../services/authService";
import "./Agenda.css";

const TABS = [
  { key: "proximos", label: "Próximos" },
  { key: "realizados", label: "Realizados" },
  { key: "cancelados", label: "Cancelados" },
  { key: "todos", label: "Todos" },
];

const ESTADO_COLORES = {
  RESERVADO: "estado-badge-reservado",
  PENDIENTE_CONFIRMACION: "estado-badge-pendiente",
  REALIZADO: "estado-badge-realizado",
  CANCELADO: "estado-badge-cancelado",
};

const ESTADO_LABELS = {
  RESERVADO: "Reservado",
  PENDIENTE_CONFIRMACION: "Pendiente de confirmación",
  REALIZADO: "Realizado",
  CANCELADO: "Cancelado",
};

const FILTROS_TAB = {
  proximos: (turno) => {
    const ahora = new Date();
    return new Date(turno.fechaHora) >= ahora &&
      (turno.estado === "RESERVADO" || turno.estado === "PENDIENTE_CONFIRMACION");
  },
  realizados: (turno) => turno.estado === "REALIZADO",
  cancelados: (turno) => turno.estado === "CANCELADO",
  todos: () => true,
};

const Agenda = () => {
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [tabActivo, setTabActivo] = useState("proximos");

  const [modalCancelar, setModalCancelar] = useState({ visible: false, turno: null });
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [enviandoCancelacion, setEnviandoCancelacion] = useState(false);

  const [modalReprogramar, setModalReprogramar] = useState({ visible: false, turno: null });
  const [nuevaFecha, setNuevaFecha] = useState(null);
  const [motivoReprogramacion, setMotivoReprogramacion] = useState("");
  const [enviandoReprogramacion, setEnviandoReprogramacion] = useState(false);
  const [medicoId, setMedicoId] = useState(null);
  const [resolviendoCambio, setResolviendoCambio] = useState(false);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  useEffect(() => {
    const usuario = authService.getUsuario();
    const id = usuario?.medicoId;

    if (!id) {
      setErrorCarga("No se pudo identificar al médico. Iniciá sesión nuevamente.");
      setCargando(false);
      return;
    }

    setMedicoId(id);

    const cargarTurnos = async () => {
      try {
        const data = await medicoService.obtenerTurnos(id);
        setTurnos(data);
        setErrorCarga("");
      } catch (error) {
        setErrorCarga(error.message);
      } finally {
        setCargando(false);
      }
    };

    cargarTurnos();
  }, []);

  const recargarTurnos = async () => {
    if (!medicoId) return;
    try {
      setCargando(true);
      const data = await medicoService.obtenerTurnos(medicoId);
      setTurnos(data);
      setErrorCarga("");
    } catch (error) {
      setErrorCarga(error.message);
    } finally {
      setCargando(false);
    }
  };

  const turnosFiltrados = turnos.filter(FILTROS_TAB[tabActivo]);

  const formatFecha = (fecha) =>
    new Date(fecha).toLocaleString("es-AR", { dateStyle: "full", timeStyle: "short", timeZone: "America/Argentina/Buenos_Aires" });

  const handleMarcarRealizado = async (turno) => {
    try {
      await medicoService.marcarTurnoRealizado(medicoId, turno._id);
      message.success("Turno marcado como realizado");
      recargarTurnos();
    } catch (error) {
      message.error(error.message);
    }
  };

  const abrirModalCancelar = (turno) => {
    setModalCancelar({ visible: true, turno });
    setMotivoCancelacion("");
  };

  const confirmarCancelacion = async () => {
    if (!motivoCancelacion.trim()) {
      message.warning("El motivo es obligatorio");
      return;
    }
    setEnviandoCancelacion(true);
    try {
      await medicoService.cancelarTurno(medicoId, modalCancelar.turno._id, motivoCancelacion);
      message.success("Turno cancelado correctamente");
      setModalCancelar({ visible: false, turno: null });
      recargarTurnos();
    } catch (error) {
      message.error(error.message);
    } finally {
      setEnviandoCancelacion(false);
    }
  };

  const cargarHorariosDisponibles = async (turno) => {
    if (!medicoId || !turno.paciente?._id) return;

    setCargandoHorarios(true);
    setHorariosDisponibles([]);
    try {
      const resultado = await turnoService.buscarDisponibles({
        pacienteId: turno.paciente._id,
        medicoId,
        fechaDesde: new Date().toISOString(),
        limit: 100,
      });
      const opciones = resultado.data.map((t) => ({ value: t.fecha, label: formatFecha(t.fecha) }));
      setHorariosDisponibles(opciones);
    } catch (error) {
      message.error("No se pudieron cargar tus horarios disponibles.");
    } finally {
      setCargandoHorarios(false);
    }
  };

  const abrirModalReprogramar = (turno) => {
    setModalReprogramar({ visible: true, turno });
    setNuevaFecha(null);
    setMotivoReprogramacion("");
    setHorariosDisponibles([]);
    cargarHorariosDisponibles(turno);
  };

  const confirmarReprogramacion = async () => {
    if (!nuevaFecha) {
      message.warning("Seleccioná una nueva fecha y hora");
      return;
    }
    if (!motivoReprogramacion.trim()) {
      message.warning("El motivo es obligatorio");
      return;
    }
    setEnviandoReprogramacion(true);
    try {
      await medicoService.proponerCambioFecha(
        medicoId,
        modalReprogramar.turno._id,
        nuevaFecha,
        motivoReprogramacion
      );
      message.success("Propuesta de cambio enviada al paciente");
      setModalReprogramar({ visible: false, turno: null });
      recargarTurnos();
    } catch (error) {
      message.error(error.message);
    } finally {
      setEnviandoReprogramacion(false);
    }
  };

  const resolverPropuesta = async (turno, aceptaCambio) => {
    setResolviendoCambio(true);
    try {
      await medicoService.resolverSolicitudCambio(medicoId, turno._id, aceptaCambio);
      if (aceptaCambio) {
        message.success("Aceptaste la nueva fecha propuesta por el paciente.");
      } else {
        message.info("Rechazaste la propuesta. Se mantiene la fecha original.");
      }
      recargarTurnos();
    } catch (error) {
      message.error(error.message || "No se pudo procesar tu respuesta.");
    } finally {
      setResolviendoCambio(false);
    }
  };

  return (
    <div className="agenda-container">
      <div className="agenda-header">
        <h1>Mi Agenda</h1>
        <p>Gestioná tus turnos: cancelar, reprogramar o marcar como realizados.</p>
      </div>

      <div className="agenda-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`agenda-tab ${tabActivo === tab.key ? "agenda-tab-activo" : ""}`}
            onClick={() => setTabActivo(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {cargando && <Skeleton active paragraph={{ rows: 6 }} />}
      {errorCarga && <Alert type="error" message={errorCarga} showIcon />}

      {!cargando && !errorCarga && turnosFiltrados.length === 0 && (
        <Alert type="info" message="No hay turnos para mostrar en esta categoría." showIcon />
      )}

      {!cargando && !errorCarga && turnosFiltrados.length > 0 && (
        <ul className="agenda-lista">
          {turnosFiltrados.map((turno) => (
            <li key={turno._id} className="agenda-turno-card">
              <div className="agenda-turno-info">
                <h3>
                  {turno.paciente?.nombre} {turno.paciente?.apellido}
                </h3>
                <p className="agenda-detalle agenda-detalle-capitalize">
                  📅 {formatFecha(turno.fechaHora)}
                </p>
                {turno.sede && (
                  <p className="agenda-detalle">📍 {turno.sede.nombre}</p>
                )}
                <p className="agenda-detalle agenda-detalle-estado">
                  Estado:{" "}
                  <span className={`estado-badge ${ESTADO_COLORES[turno.estado]}`}>
                    {ESTADO_LABELS[turno.estado] || turno.estado}
                  </span>
                </p>
                {turno.estado === "PENDIENTE_CONFIRMACION" && turno.fechaPropuesta && (
                  <p className="agenda-detalle agenda-fecha-propuesta">
                    📩 Fecha propuesta: {formatFecha(turno.fechaPropuesta)}
                  </p>
                )}
              </div>

              <div className="agenda-turno-acciones">
                {turno.estado === "RESERVADO" && (
                  <>
                    <button
                      className="btn-agenda btn-realizado"
                      onClick={() => handleMarcarRealizado(turno)}
                    >
                      Marcar Realizado
                    </button>
                    <button
                      className="btn-agenda btn-reprogramar"
                      onClick={() => abrirModalReprogramar(turno)}
                    >
                      Reprogramar
                    </button>
                    <button
                      className="btn-agenda btn-cancelar-turno"
                      onClick={() => abrirModalCancelar(turno)}
                    >
                      Cancelar
                    </button>
                  </>
                )}
                {turno.estado === "PENDIENTE_CONFIRMACION" && (
                  turno.cambioPropuestoPor === "PACIENTE" ? (
                    <>
                      <button
                        className="btn-agenda btn-realizado"
                        onClick={() => resolverPropuesta(turno, true)}
                        disabled={resolviendoCambio}
                      >
                        Aceptar Propuesta
                      </button>
                      <button
                        className="btn-agenda btn-cancelar-turno"
                        onClick={() => resolverPropuesta(turno, false)}
                        disabled={resolviendoCambio}
                      >
                        Rechazar Propuesta
                      </button>
                    </>
                  ) : (
                    <span className="agenda-info-pendiente">
                      ⏳ Esperando confirmación del paciente
                    </span>
                  )
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      
      <Modal
        title="Cancelar turno"
        open={modalCancelar.visible}
        onOk={confirmarCancelacion}
        onCancel={() => setModalCancelar({ visible: false, turno: null })}
        okText="Confirmar cancelación"
        cancelText="Volver"
        okButtonProps={{ style: { backgroundColor: '#c91429', borderColor: '#c91429' } }}
        confirmLoading={enviandoCancelacion}
      >
        <p>
          Paciente: <strong>{modalCancelar.turno?.paciente?.nombre} {modalCancelar.turno?.paciente?.apellido}</strong>
        </p>
        <p>
          Fecha: <strong>{modalCancelar.turno && formatFecha(modalCancelar.turno.fechaHora)}</strong>
        </p>
        <Input.TextArea
          rows={3}
          placeholder="Motivo de la cancelación (obligatorio)"
          value={motivoCancelacion}
          onChange={(evento) => setMotivoCancelacion(evento.target.value)}
        />
      </Modal>

      
      <Modal
        title="Reprogramar turno"
        open={modalReprogramar.visible}
        onOk={confirmarReprogramacion}
        onCancel={() => setModalReprogramar({ visible: false, turno: null })}
        okText="Proponer cambio"
        cancelText="Volver"
        okButtonProps={{ style: { backgroundColor: '#616161', borderColor: '#616161' } }}
        confirmLoading={enviandoReprogramacion}
      >
        <p>
          Paciente: <strong>{modalReprogramar.turno?.paciente?.nombre} {modalReprogramar.turno?.paciente?.apellido}</strong>
        </p>
        <p>
          Fecha actual: <strong>{modalReprogramar.turno && formatFecha(modalReprogramar.turno.fechaHora)}</strong>
        </p>
        <div className="modal-campo">
          <label>Nueva fecha y hora:</label>
          <Select
            showSearch
            placeholder="Seleccioná un horario disponible"
            style={{ width: "100%" }}
            loading={cargandoHorarios}
            value={nuevaFecha}
            onChange={(valor) => setNuevaFecha(valor)}
            options={horariosDisponibles}
            notFoundContent={cargandoHorarios ? "Buscando horarios..." : "No tenés horarios disponibles en este momento"}
            filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
          />
        </div>
        <div className="modal-campo">
          <label>Motivo:</label>
          <Input.TextArea
            rows={3}
            placeholder="Motivo de la reprogramación (obligatorio)"
            value={motivoReprogramacion}
            onChange={(evento) => setMotivoReprogramacion(evento.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Agenda;
