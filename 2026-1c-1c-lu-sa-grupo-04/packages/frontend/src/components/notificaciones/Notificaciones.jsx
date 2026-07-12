"use client";

import { message, Skeleton } from "antd";
import { useNotificaciones } from "../../context/NotificacionesContext";
import { formatearTiempo } from "../../utils/formatearTiempo";
import "./Notificaciones.css";

const Notificaciones = () => {
  const { notificaciones, noLeidas, cargando, marcarComoLeida, marcarTodasComoLeidas } =
    useNotificaciones();

  const noLeidasList = notificaciones.filter((n) => !n.leida);
  const leidasList = notificaciones.filter((n) => n.leida);

  const handleMarcarUna = async (id) => {
    await marcarComoLeida(id);
    message.success("Notificación marcada como leída");
  };

  const handleMarcarTodas = async () => {
    await marcarTodasComoLeidas();
    message.success("Todas marcadas como leídas");
  };

  if (cargando) {
    return (
      <main className="notificaciones-page">
        <div className="notificaciones-header">
          <h1>Notificaciones</h1>
        </div>
        <section className="notif-section">
          <ul className="notif-list" role="status" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="notif-skeleton-wrapper">
                <Skeleton active paragraph={{ rows: 2 }} />
              </li>
            ))}
          </ul>
        </section>
      </main>
    );
  }

  return (
    <main className="notificaciones-page">
      <div className="notificaciones-header">
        <h1>Notificaciones</h1>
        {noLeidas > 0 && (
          <button className="btn-marcar-todas" onClick={handleMarcarTodas}>
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* No leídas */}
      <section className="notif-section">
        <h2>
          No leídas {noLeidas > 0 && <span className="notif-count">({noLeidas})</span>}
        </h2>
        {noLeidasList.length === 0 ? (
          <p className="notif-empty">No tenés notificaciones sin leer. 🎉</p>
        ) : (
          <ul className="notif-list">
            {noLeidasList.map((n) => (
              <li key={n._id} className="notif-item">
                <div>
                  <p className="notif-mensaje">{n.mensaje}</p>
                  <small className="notif-tiempo">{formatearTiempo(n.createdAt)}</small>
                </div>
                <button
                  className="btn-marcar-leida"
                  onClick={() => handleMarcarUna(n._id)}
                >
                  Marcar como leída
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Leídas */}
      <section className="notif-section">
        <h2>Leídas</h2>
        {leidasList.length === 0 ? (
          <p className="notif-empty">Todavía no hay notificaciones leídas.</p>
        ) : (
          <ul className="notif-list">
            {leidasList.map((n) => (
              <li key={n._id} className="notif-item leida">
                <p className="notif-mensaje">{n.mensaje}</p>
                <small className="notif-tiempo">{formatearTiempo(n.createdAt)}</small>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default Notificaciones;