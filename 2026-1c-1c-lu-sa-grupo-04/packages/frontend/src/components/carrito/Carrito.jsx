"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCarrito } from '../../context/CarritoContext';
import { turnoService } from '../../services/turnoService';
import { message, Modal, Spin } from 'antd';
import './Carrito.css';

const formatMoney = (amount) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
};

const formatDate = (dateString) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('es-AR', options);
};

const COBERTURA_LABELS = {
  TOTAL: 'Cubierto',
  PARCIAL: 'Cobertura parcial',
  NO_CUBIERTA: 'No cubierto',
  PARTICULAR: 'Particular',
};

export default function Carrito() {
  const router = useRouter();

  const { turnosPreseleccionados, eliminarDelCarrito } = useCarrito();
  const [turnoAQuitar, setTurnoAQuitar] = useState(null);
  const [pagando, setPagando] = useState(false);

  const subtotal = turnosPreseleccionados.reduce((sum, turno) => sum + (turno.costoBase ?? turno.montoAAbonar ?? 0), 0);
  const total = turnosPreseleccionados.reduce((sum, turno) => sum + (turno.montoAAbonar ?? 0), 0);
  const descuento = subtotal - total;

  const handleIntentoQuitar = (idABorrar) => {
    setTurnoAQuitar(idABorrar);
  };

  const confirmarQuitar = () => {
    eliminarDelCarrito(turnoAQuitar);
    message.info('Turno quitado del carrito');
    setTurnoAQuitar(null);
  };

  const cancelarQuitar = () =>{
    setTurnoAQuitar(null);
  };

  const handlePagar = async () => {
    setPagando(true);

    const resultados = await Promise.allSettled(
      turnosPreseleccionados.map((turno) =>
        turnoService.reservar(turno._id, {
          especialidadId: turno.especialidadId,
          practicaId: turno.practicaId,
        })
      )
    );

    const exitosos = [];
    const fallidos = [];
    resultados.forEach((resultado, index) => {
      const turno = turnosPreseleccionados[index];
      if (resultado.status === 'fulfilled') {
        exitosos.push(turno);
      } else {
        fallidos.push(turno);
      }
    });

    [...exitosos, ...fallidos].forEach((turno) => eliminarDelCarrito(turno._id));

    setPagando(false);

    if (fallidos.length === 0) {
      message.success('¡Reserva confirmada con éxito!');
      router.push('/paciente/mis-turnos');
      return;
    }

    if (exitosos.length === 0) {
      message.error('Ninguno de los turnos pudo reservarse: ya no estaban disponibles.');
      return;
    }

    message.warning(
      `Se reservaron ${exitosos.length} turno(s). ${fallidos.length} turno(s) ya no estaban disponibles y se quitaron del carrito.`
    );
    router.push('/paciente/mis-turnos');
  };

  return (
    <main className="carrito-main">

      <button className="btn-volver" onClick={() => router.push('/paciente/nuevoTurno')}>
        ← Volver a buscar
      </button>

      <h1 className="carrito-titulo">Resumen de tu Carrito</h1>

      {turnosPreseleccionados.length === 0 ? (
        <div className="carrito-vacio">
          <h2>No tenés turnos en tu carrito.</h2>
          <button className="btn-buscar" onClick={() => router.push('/paciente/nuevoTurno')}>
            Buscar turnos
          </button>
        </div>
      ) : (
        <div className="carrito-grid">

          <div className="carrito-lista">
            {turnosPreseleccionados.map((turno) => (
              <div key={turno._id} className="turno-card">
                <div>
                  <h3 className="turno-profesional">{turno.profesional}</h3>
                  <p className="turno-especialidad">{turno.servicio}</p>
                  <p className="turno-detalle">📅 {formatDate(turno.fecha)}</p>
                  <p className="turno-detalle">📍 {turno.sede}</p>
                </div>
                <div className="turno-acciones">
                  <span className="turno-precio">
                    {formatMoney(turno.costoBase ?? turno.montoAAbonar ?? 0)}
                  </span>
                  {turno.nivelCobertura && (
                    <span className="turno-cobertura">
                      {COBERTURA_LABELS[turno.nivelCobertura] || turno.nivelCobertura}
                    </span>
                  )}
                  <button className="btn-quitar" onClick={() => handleIntentoQuitar(turno._id)}>
                    🗑️ Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="resumen-box">
            <h2 className="resumen-titulo">Resumen</h2>

            <div className="resumen-fila">
              <span>Turnos ({turnosPreseleccionados.length})</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            {descuento > 0 && (
              <div className="resumen-fila">
                <span>Descuento por cobertura</span>
                <span className="bonificado">-{formatMoney(descuento)}</span>
              </div>
            )}
            <div className="resumen-fila">
              <span>Gastos administrativos</span>
              <span className="bonificado">Bonificado</span>
            </div>

            <hr className="resumen-separador" />

            <div className="resumen-total">
              <span>Total:</span>
              <span>{formatMoney(total)}</span>
            </div>

            <button className="btn-pagar" onClick={handlePagar} disabled={pagando}>
              {pagando ? <Spin size="small" /> : 'Proceder a Pagar'}
            </button>
            <p className="pago-seguro">Pago seguro.</p>
          </div>

        </div>
      )}

      <Modal
        title="Quitar Turno"
        open={!!turnoAQuitar}
        onOk={confirmarQuitar}
        onCancel={cancelarQuitar}
        okText="Aceptar"
        cancelText="Cancelar"
        centered
        okButtonProps={{style: { backgroundColor: '#c91429', borderColor: '#c91429' } }}
        >
          <p>¿Estás seguro de que querés quitar este turno de tu carrito?</p>
        </Modal>
    </main>
  );
}
