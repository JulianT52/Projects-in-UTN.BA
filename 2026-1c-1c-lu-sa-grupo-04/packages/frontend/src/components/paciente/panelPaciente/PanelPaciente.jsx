"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Alert, Skeleton } from "antd";
import {
  CalendarOutlined,
  SearchOutlined,
  BellOutlined,
  ShoppingCartOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  RightOutlined
} from "@ant-design/icons"
import { authService } from "../../../services/authService";
import { turnoService } from "../../../services/turnoService";
import Footer from "../../footer/Footer";
import "./PanelPaciente.css";

const FUNCIONES = [
  {
    id: "mis-turnos",
    tag: "Gestioná tus turnos",
    titulo: "Mis turnos",
    descripcion: "Ver, cancelar o reprogramar tus turnos.",
    href: "/paciente/mis-turnos",
    icono: <CalendarOutlined />,
  },
  {
    id: "reservar-turnos",
    tag: "Buscá y reservá",
    titulo: "Reservar turnos",
    descripcion: "Buscar turnos disponibles y reservar.",
    href: "/paciente/nuevoTurno",
    icono: <SearchOutlined />,
  },
  {
    id: "especialidades",
    tag: "Encontrá al profesional indicado",
    titulo: "Especialidades",
    descripcion: "Explorar especialidades y profesionales disponibles.",
    href: "/paciente/especialidades",
    icono: <MedicineBoxOutlined />,
  },
];

const PanelPaciente = () => {
  const [usuario, setUsuario] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const usuarioLogueado = authService.getUsuario();
    setUsuario(usuarioLogueado);

    if (!usuarioLogueado?.pacienteId) {
      setError("No se pudo identificar al paciente. Iniciá sesión nuevamente.");
      setCargando(false);
      return;
    }

    const cargarDatos = async () => {
      try {
        const respuesta = await turnoService.obtenerMisTurnos(usuarioLogueado.pacienteId);
        setTurnos(respuesta?.data || []);
      } catch (e) {
        setError(e.message || "No se pudieron cargar tus turnos.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const resumen = useMemo(() => {
    const ahora = new Date();

    const proximos = turnos.filter((turno) => {
      const fechaTurno = new Date(turno.fechaHora);
      return (
        fechaTurno >= ahora &&
        (turno.estado === "RESERVADO" ||
          turno.estado === "PENDIENTE_CONFIRMACION")
      );
    });

    return {
      proximos: proximos.length,
      reservados: turnos.filter((t) => t.estado === "RESERVADO").length,
      pendientes: turnos.filter((t) => t.estado === "PENDIENTE_CONFIRMACION").length,
      realizados: turnos.filter((t) => t.estado === "REALIZADO").length,
    };
  }, [turnos]);

  const proximosTurnos = useMemo(() => {
    const ahora = new Date();

    return turnos
      .filter((turno) => {
        const fechaTurno = new Date(turno.fechaHora);
        return (
          fechaTurno >= ahora &&
          (turno.estado === "RESERVADO" ||
            turno.estado === "PENDIENTE_CONFIRMACION")
        );
      })
      .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))
      .slice(0, 3);
  }, [turnos]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha sin definir";

    return new Date(fecha).toLocaleString("es-AR", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Argentina/Buenos_Aires",
    });
  };

  return (
    <main className="panel-medico-container">
      <section className="panel-medico-hero">
        <div>
          <h1>
            ¡Hola, {usuario?.nombre ? `${usuario.nombre} ${usuario.apellido}` : "Paciente"}!
          </h1>
          <p>
            Desde acá podés ver y gestionar tus turnos.
          </p>
        </div>

        <Link href="/paciente/mis-turnos" className="panel-medico-boton-principal">
          Ver mis turnos
        </Link>
      </section>

      {cargando && (
        <section className="panel-medico-card">
          <Skeleton active paragraph={{ rows: 4 }} />
        </section>
      )}

      {!cargando && error && (
        <Alert type="error" title={error} showIcon />
      )}

      {!cargando && !error && (
        <>
          <section className="panel-medico-proximos">
            <div className="panel-medico-section-header">
              <h2>Próximos turnos</h2>
              <Link href="/paciente/mis-turnos">Ver todos</Link>
            </div>

            {proximosTurnos.length === 0 ? (
              <div className="panel-medico-vacio-card">
                <p>Todavía no tenés turnos próximos.</p>
                <Link href="/paciente/nuevoTurno" className="panel-medico-vacio-cta">
                  Reservar un turno
                </Link>
              </div>
            ) : (
              <div className="panel-medico-turnos">
                {proximosTurnos.map((turno, indice) => (
                  <article
                    key={turno._id}
                    className={`panel-medico-turno ${
                      indice === 0 ? "panel-medico-turno-destacado" : ""
                    }`}
                  >
                    <div>
                      {indice === 0 && (
                        <span className="panel-medico-turno-etiqueta">
                          Tu próximo turno
                        </span>
                      )}
                      <h3>
                        {turno.medico?.nombre || "Paciente"}{" "}
                        {turno.medico?.apellido || ""}
                      </h3>
                      <p>📅 {formatearFecha(turno.fechaHora)}</p>
                      {turno.sede?.nombre && <p>📍 {turno.sede.nombre}</p>}
                    </div>

                    <span className={`panel-medico-estado estado-${turno.estado}`}>
                      {turno.estado}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="panel-medico-resumen">
            <article className="panel-medico-stat">
              <span className="panel-medico-stat-icono"><CalendarOutlined /></span>
              <div>
                <strong>{resumen.proximos}</strong>
                <p>Próximos turnos</p>
              </div>
            </article>

            <article className="panel-medico-stat">
              <span className="panel-medico-stat-icono"><CheckCircleOutlined /></span>
              <div>
                <strong>{resumen.reservados}</strong>
                <p>Reservados</p>
              </div>
            </article>

            <article className="panel-medico-stat">
              <span className="panel-medico-stat-icono"><ClockCircleOutlined /></span>
              <div>
                <strong>{resumen.pendientes}</strong>
                <p>Pendientes</p>
              </div>
            </article>

            <article className="panel-medico-stat">
              <span className="panel-medico-stat-icono"><MedicineBoxOutlined /></span>
              <div>
                <strong>{resumen.realizados}</strong>
                <p>Realizados</p>
              </div>
            </article>
          </section>

          <section className="panel-medico-funciones">
            <div className="panel-medico-funciones-header">
              <h2>Todo lo que podés hacer desde acá</h2>
              <p>Gestioná tus turnos, tus avisos y tus pagos en un mismo lugar.</p>
            </div>

            {FUNCIONES.map((funcion, indice) => (
              <div
                key={funcion.id}
                className={`panel-medico-feature-row ${
                  indice % 2 === 1 ? "reverse" : ""
                }`}
              >
                <div className="panel-medico-feature-text">
                  <span className="panel-medico-feature-tag">{funcion.tag}</span>
                  <h2>{funcion.titulo}</h2>
                  <p>{funcion.descripcion}</p>
                  <Link href={funcion.href} className="panel-medico-feature-cta">
                    Entrar →
                  </Link>
                </div>

                <div className="panel-medico-feature-illustration">
                  <div className="panel-medico-feature-visual">
                    <span className="pm-blob-1" />
                    <span className="pm-blob-2" />
                    {funcion.icono}
                  </div>
                </div>
              </div>
            ))}
          </section>
          <Footer />
        </>
      )}
    </main>
  );
};

export default PanelPaciente;