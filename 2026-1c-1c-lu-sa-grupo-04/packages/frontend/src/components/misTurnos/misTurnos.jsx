"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/authService';
import { message, Skeleton, Modal, Input, Select } from 'antd';
import { turnoService } from '../../services/turnoService';
import "./misTurnos.css";

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


const MisTurnos = () => {
  const router = useRouter();

  const [misTurnos, setMisTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarMisTurnos = async () => {
    setLoading(true);
    const usuario = authService.getUsuario();

    if (!usuario || !usuario.pacienteId) {
      setError('Tenés que iniciar sesión para ver tus turnos.');
      setLoading(false);
      return;
    }

    try {
      const res = await turnoService.obtenerMisTurnos(usuario.pacienteId);
      setMisTurnos(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMisTurnos();
  }, []);

  const [modalCancelar, setModalCancelar] = useState({ visible: false, turnoId: null });
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [cancelando, setCancelando] = useState(false);

  const abrirModalCancelar = (turnoId) => {
    setMotivoCancelacion('');
    setModalCancelar({ visible: true, turnoId });
  };

  const cerrarModalCancelar = () => {
    setModalCancelar({ visible: false, turnoId: null });
    setMotivoCancelacion('');
  };

  const confirmarCancelacion = async () => {
    if (!motivoCancelacion.trim()) {
      message.warning('El motivo es obligatorio');
      return;
    }

    const usuario = authService.getUsuario();
    if (!usuario || !usuario.pacienteId) {
      message.error('Tenés que iniciar sesión para cancelar un turno.');
      return;
    }

    setCancelando(true);
    try {
      await turnoService.cancelar(usuario.pacienteId, modalCancelar.turnoId, motivoCancelacion);
      message.success('Turno cancelado correctamente');
      cerrarModalCancelar();
      cargarMisTurnos();
    } catch (error) {
      message.error(error.message || 'No se pudo cancelar el turno.');
    } finally {
      setCancelando(false);
    }
  };

  const [modalModificar, setModalModificar] = useState({ visible: false, turno: null });
  const [nuevaFecha, setNuevaFecha] = useState(null);
  const [motivoModificacion, setMotivoModificacion] = useState('');
  const [modificando, setModificando] = useState(false);
  const [resolviendoCambio, setResolviendoCambio] = useState(false);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  const cargarHorariosDisponibles = async (turno) => {
    const usuario = authService.getUsuario();
    if (!usuario || !usuario.pacienteId || !turno.medico?._id) return;

    setCargandoHorarios(true);
    setHorariosDisponibles([]);
    try {
      const resultado = await turnoService.buscarDisponibles({
        pacienteId: usuario.pacienteId,
        medicoId: turno.medico._id,
        fechaDesde: new Date().toISOString(),
        limit: 100,
      });
      const opciones = resultado.data.map((t) => ({ value: t.fecha, label: formatFecha(t.fecha) }));
      setHorariosDisponibles(opciones);
    } catch (error) {
      message.error('No se pudieron cargar los horarios disponibles del médico.');
    } finally {
      setCargandoHorarios(false);
    }
  };

  const abrirModalModificar = (turno) => {
    if (!puedeReprogramar(turno)) {
      message.warning('Las reprogramaciones deben solicitarse con al menos 1 hora de anticipación.');
      return;
    }
    setNuevaFecha(null);
    setMotivoModificacion('');
    setModalModificar({ visible: true, turno });
    cargarHorariosDisponibles(turno);
  };

  const cerrarModalModificar = () => {
    setModalModificar({ visible: false, turno: null });
    setNuevaFecha(null);
    setMotivoModificacion('');
    setHorariosDisponibles([]);
  };

  const confirmarModificacion = async () => {
    if (!nuevaFecha) {
      message.warning('Seleccioná una nueva fecha y hora');
      return;
    }

    if (!motivoModificacion.trim()) {
      message.warning('El motivo es obligatorio');
      return;
    }

    const usuario = authService.getUsuario();
    if (!usuario || !usuario.pacienteId) {
      message.error('Tenés que iniciar sesión para modificar un turno.');
      return;
    }

    setModificando(true);
    try {
      await turnoService.solicitarCambioFecha(usuario.pacienteId, modalModificar.turno._id, nuevaFecha, motivoModificacion);
      message.success('Solicitud de cambio enviada. Queda pendiente de confirmación del médico.');
      cerrarModalModificar();
      cargarMisTurnos();
    } catch (error) {
      message.error(error.message || 'No se pudo solicitar el cambio de fecha.');
    } finally {
      setModificando(false);
    }
  };

  const resolverPropuesta = async (turnoId, aceptaCambio) => {
    const usuario = authService.getUsuario(); 
    if(!usuario || !usuario.pacienteId){
      message.error('Tenés que iniciar sesión para resolver la propuesta.');
      return;
    }
    setResolviendoCambio(true); 
    try{
      await
      turnoService.resolverCambioFecha(usuario.pacienteId, turnoId, aceptaCambio);
      if(aceptaCambio){
        message.success('Aceptaste la nueva fecha del turno.');
      } else {
        message.info('Rechazaste la propuesta. Se mantiene la fecha original.');
      }
      cargarMisTurnos();
    } catch (error){
      message.error(error.message || 'No se pudo procesar tu respuesta.');
    } finally {
      setResolviendoCambio(false); 
    }
  };

  const formatFecha = (fecha) =>
    new Date(fecha).toLocaleString('es-AR', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'America/Argentina/Buenos_Aires',
    });

  const formatMonto = (monto) =>
    monto === 0 ? 'Sin cargo' : `$${Number(monto).toLocaleString('es-AR')}`;

  const getNombreMedico = (medico) => {
    if (!medico) return 'Médico no asignado';
    return `Dr/a. ${medico.nombre} ${medico.apellido}`;
  };

  const getNombreSede = (sede) => {
    if (!sede) return 'Sin sede';
    return sede.nombre;
  };

  const fuePropuestoMedico = (turno) => {

  }

  const puedeReprogramar = (turno) => {
    const diferenciaEnHoras = (new Date(turno.fechaHora).getTime() - Date.now()) / (1000 * 60 * 60);
    return diferenciaEnHoras >= 1;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Mis Turnos 📅</h1>
          <p>Aquí puedes gestionar tus próximas citas médicas.</p>
        </div>
        <div className="dashboard-content dashboard-content-col">
          <section className="resultados-section resultados-section-full">
            <ul className="turnos-lista" role="status" aria-busy="true">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="turno-card turno-skeleton">
                  <Skeleton active paragraph={{ rows: 3}} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Mis Turnos 📅</h1>
        <p>Aquí puedes gestionar tus próximas citas médicas.</p>
      </div>

      <div className="dashboard-content dashboard-content-col">
        <section className="resultados-section resultados-section-full">
          
          {error && <p className="estado error" role="alert">{error}</p>}

          {!error && misTurnos.length === 0 && (
            <div className="estado estado-empty">
              <h3>No tienes turnos programados</h3>
              <button 
                className="btn-primary btn-primary-mt" 
                onClick={() => router.push('/paciente/nuevoTurno')}
              >
                Buscar un turno nuevo
              </button>
            </div>
          )}

          {!error && misTurnos.length > 0 && (
            <ul className="turnos-lista">
              {misTurnos.map((turno) => (
                <li key={turno._id} className="turno-card">
                  <div className="turno-info">
                    <h3>{getNombreMedico(turno.medico)}</h3>
                    <p className="detalle detalle-capitalize">
                      📅 {formatFecha(turno.fechaHora)}
                    </p>
                    <p className="detalle">📍 {getNombreSede(turno.sede)}</p>
                    <p className="detalle detalle-monto">💲 {formatMonto(turno.costo)}</p>
                    <p className="detalle detalle-estado">
                      Estado:{" "}
                      <span className={`estado-badge ${ESTADO_COLORES[turno.estado]}`}>
                        {ESTADO_LABELS[turno.estado] || turno.estado}
                      </span>
                    </p>
                    {turno.estado === 'PENDIENTE_CONFIRMACION' && turno.fechaPropuesta && (
                      <p className="detalle detalle-capitalize">📩 Fecha propuesta: {formatFecha(turno.fechaPropuesta)}</p>
                    )}
                  </div>

                  <div className="turno-cobertura">
                    {turno.estado === 'RESERVADO' && (
                      <>
                        <button
                          className="btn-modificar"
                          onClick={() => abrirModalModificar(turno)}
                          disabled={!puedeReprogramar(turno)}
                          title={!puedeReprogramar(turno) ? 'Solo se puede reprogramar con al menos 1 hora de anticipación' : undefined}
                        >
                          Reprogramar
                        </button>
                        <button
                          className="btn-cancelar"
                          onClick={() => abrirModalCancelar(turno._id)}
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {turno.estado === 'PENDIENTE_CONFIRMACION' && (
                      turno.cambioPropuestoPor === 'MEDICO' ? (
                        <>
                        <button
                            className="btn-aceptar"
                            onClick={() => resolverPropuesta(turno._id, true)}
                            disabled={resolviendoCambio}
                          >
                            Aceptar Propuesta
                          </button>
                        <button
                            className="btn-cancelar"
                            onClick={() => resolverPropuesta(turno._id, false)}
                            disabled={resolviendoCambio}
                          >
                            Rechazar Propuesta
                          </button>
                        </>
                      ) : (
                        <span className="info-pendiente">
                          ⏳ Esperando confirmación del médico
                        </span>
                      )
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Modal
        title="Cancelar turno"
        open={modalCancelar.visible}
        onOk={confirmarCancelacion}
        onCancel={cerrarModalCancelar}
        okText="Confirmar cancelación"
        cancelText="Volver"
        okButtonProps={{ style: { backgroundColor: '#c91429', borderColor: '#c91429' }, loading: cancelando }}
      >
        <p>Indicá el motivo de la cancelación:</p>
        <Input.TextArea
          rows={3}
          value={motivoCancelacion}
          onChange={(event) => setMotivoCancelacion(event.target.value)}
          placeholder="Ej: Surgió un imprevisto y no puedo asistir"
        />
      </Modal>

      <Modal
        title="Reprogramar turno"
        open={modalModificar.visible}
        onOk={confirmarModificacion}
        onCancel={cerrarModalModificar}
        okText="Solicitar cambio"
        cancelText="Volver"
        okButtonProps={{ style: { backgroundColor: '#616161', borderColor: '#616161' }, loading: modificando }}
      >
        <p>Fecha actual: <strong>{modalModificar.turno && formatFecha(modalModificar.turno.fechaHora)}</strong></p>
        <div className="modal-campo">
          <label>Nueva fecha y hora:</label>
          <Select
            showSearch
            placeholder="Seleccioná un horario disponible"
            style={{ width: '100%' }}
            loading={cargandoHorarios}
            value={nuevaFecha}
            onChange={(valor) => setNuevaFecha(valor)}
            options={horariosDisponibles}
            notFoundContent={cargandoHorarios ? 'Buscando horarios...' : 'El médico no tiene horarios disponibles en este momento'}
            filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
          />
        </div>
        <div className="modal-campo">
          <label>Motivo:</label>
          <Input.TextArea
            rows={3}
            placeholder="Motivo de la solicitud de cambio (obligatorio)"
            value={motivoModificacion}
            onChange={(event) => setMotivoModificacion(event.target.value)}
          />
        </div>
        <p style={{ marginTop: 12, color: '#666', fontSize: '0.85rem' }}>
          El cambio queda pendiente de confirmación del médico.
        </p>
      </Modal>
    </div>
  );
};

export default MisTurnos;