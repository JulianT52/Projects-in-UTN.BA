"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Alert, Skeleton } from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  BellOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import Footer from "../../footer/Footer";

import { authService } from "../../../services/authService";
import { medicoService } from "../../../services/medicoService";

import "./PanelMedico.css";

const FUNCIONES = [
  {
    id: "agenda",
    tag: "Gestioná tus turnos",
    titulo: "Mi agenda",
    descripcion: "Ver turnos, cancelar, reprogramar o marcar como realizados.",
    href: "/medico/agenda",
    icono: <CalendarOutlined />,
  },
  {
    id: "historial-pacientes",
    tag: "Consultá tus pacientes",
    titulo: "Historial de pacientes",
    descripcion: "Revisar pacientes atendidos y consultar su historial de turnos.",
    href: "/medico/historialPacientes",
    icono: <TeamOutlined />,
  },
  {
    id: "disponibilidad",
    tag: "Organizá tus horarios",
    titulo: "Disponibilidad",
    descripcion: "Definir días, horarios y sedes de atención.",
    href: "/medico/disponibilidad",
    icono: <ClockCircleOutlined />,
  },
  {
    id: "servicios",
    tag: "Configurá tus prestaciones",
    titulo: "Servicios",
    descripcion: "Administrar especialidades y prácticas ofrecidas.",
    href: "/medico/servicios",
    icono: <MedicineBoxOutlined />,
  },
];

const PanelMedico = () => {
  const [usuario, setUsuario] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const usuarioLogueado = authService.getUsuario();
    setUsuario(usuarioLogueado);

    const medicoId = usuarioLogueado?.medicoId;

    if (!medicoId) {
      setError("No se pudo identificar al médico. Iniciá sesión nuevamente.");
      setCargando(false);
      return;
    }

    const cargarDatos = async () => {
      try {
        const turnosDelMedico = await medicoService.obtenerTurnos(medicoId);
        setTurnos(turnosDelMedico || []);
      } catch (e) {
        setError(e.message || "No se pudieron cargar los datos del médico.");
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
      pendientes: turnos.filter((t) => t.estado === "PENDIENTE_CONFIRMACION")
        .length,
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
          <p className="panel-medico-eyebrow">Panel profesional</p>

          <h1>
            Hola, Dr/a.{" "}
            {usuario?.nombre
              ? `${usuario.nombre} ${usuario.apellido || ""}`
              : "Médico"}
          </h1>

          <p>
            Desde acá podés revisar tu agenda, consultar pacientes y gestionar
            tus turnos.
          </p>
        </div>

        <Link href="/medico/agenda" className="panel-medico-boton-principal">
          Ver mi agenda
        </Link>
      </section>

      {cargando && (
        <section className="panel-medico-card">
          <Skeleton active paragraph={{ rows: 4 }} />
        </section>
      )}

      {!cargando && error && <Alert type="error" message={error} showIcon />}

      {!cargando && !error && (
        <>
          <section className="panel-medico-proximos">
            <div className="panel-medico-section-header">
              <h2>Próximos turnos</h2>
              <Link href="/medico/agenda">Ver todos</Link>
            </div>

            {proximosTurnos.length === 0 ? (
              <div className="panel-medico-vacio-card">
                <p>Todavía no tenés turnos próximos.</p>

                <Link href="/medico/agenda" className="panel-medico-vacio-cta">
                  Ver agenda
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
                        {turno.paciente?.nombre || "Paciente"}{" "}
                        {turno.paciente?.apellido || ""}
                      </h3>

                      <p><CalendarOutlined /> {formatearFecha(turno.fechaHora)}</p>

                      {turno.sede?.nombre && <p><EnvironmentOutlined /> {turno.sede.nombre}</p>}
                    </div>

                    <span
                      className={`panel-medico-estado estado-${turno.estado}`}
                    >
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
              <h2>Todo lo que podés gestionar desde acá</h2>
              <p>
                Organizá tu agenda, revisá pacientes y configurá tu atención en
                un mismo lugar.
              </p>
            </div>

            {FUNCIONES.map((funcion, indice) => (
              <div
                key={funcion.id}
                className={`panel-medico-feature-row ${
                  indice % 2 === 1 ? "reverse" : ""
                }`}
              >
                <div className="panel-medico-feature-text">
                  <span className="panel-medico-feature-tag">
                    {funcion.tag}
                  </span>

                  <h2>{funcion.titulo}</h2>
                  <p>{funcion.descripcion}</p>

                  <Link
                    href={funcion.href}
                    className="panel-medico-feature-cta"
                  >
                    Entrar <RightOutlined />
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

export default PanelMedico;