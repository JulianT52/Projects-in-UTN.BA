"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EnvironmentOutlined } from "@ant-design/icons"
import { Alert, message } from "antd";
import { authService } from "../../../services/authService";
import { medicoService } from "../../../services/medicoService";
import { sedeService } from "../../../services/sedeService";
import "./DisponibilidadMedico.css";

const DIAS = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
];

const ORDEN_DIAS = {
  LUNES: 1,
  MARTES: 2,
  MIERCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
  SABADO: 6,
  DOMINGO: 7,
};

const HORAS = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

const horaAMinutos = (hora) => {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
};

const ordenarDisponibilidades = (disponibilidades) => {
  return [...disponibilidades].sort((a, b) => {
    if (ORDEN_DIAS[a.diaSemana] !== ORDEN_DIAS[b.diaSemana]) {
      return ORDEN_DIAS[a.diaSemana] - ORDEN_DIAS[b.diaSemana];
    }

    if (a.sede !== b.sede) {
      return String(a.sede) < String(b.sede) ? -1 : 1;
    }

    return horaAMinutos(a.horaDesde) - horaAMinutos(b.horaDesde);
  });
};

const limpiarDisponibilidad = (disponibilidad) => ({
  diaSemana: disponibilidad.diaSemana,
  horaDesde: disponibilidad.horaDesde,
  horaHasta: disponibilidad.horaHasta,
  sede: disponibilidad.sede,
});

const obtenerDisponibilidadesDelMedico = (medico) => {
  const disponibilidades =
    medico?.disponibilidades || medico?.data?.disponibilidades || [];

  return ordenarDisponibilidades(disponibilidades.map(limpiarDisponibilidad));
};

export default function DisponibilidadMedico() {
  const [usuario, setUsuario] = useState(null);
  const [medicoId, setMedicoId] = useState(null);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState("");

  const [sedes, setSedes] = useState([]);

  const [form, setForm] = useState({
    diaSemana: "LUNES",
    horaDesde: "09:00",
    horaHasta: "13:00",
    sede: "",
  });

  useEffect(() => {
    const usuarioLogueado = authService.getUsuario();
    setUsuario(usuarioLogueado);

    const id = usuarioLogueado?.medicoId;

    if (!id) {
      setError("No se pudo identificar al médico. Iniciá sesión nuevamente.");
      return;
    }

    setMedicoId(id);

    const guardadas = localStorage.getItem(`disponibilidades-medico-${id}`);

    if (guardadas) {
      try {
        setDisponibilidades(JSON.parse(guardadas));
      } catch {
        localStorage.removeItem(`disponibilidades-medico-${id}`);
      }
    }
  }, []);

  useEffect(() => {
    sedeService.obtenerSedes()
      .then((res) => {
        setSedes(res.data);
        if (res.data.length > 0) {
          setForm((prev) => (prev.sede ? prev : { ...prev, sede: res.data[0]._id }));
        }
      })
      .catch(() => message.error("No se pudieron cargar las sedes."));
  }, []);

  const nombreSede = (sedeId) => sedes.find((s) => s._id === sedeId)?.nombre || "Sede desconocida";

  const disponibilidadesOrdenadas = useMemo(() => {
    return ordenarDisponibilidades(disponibilidades);
  }, [disponibilidades]);

  const guardarEnEstadoYLocalStorage = (id, nuevasDisponibilidades) => {
    const ordenadas = ordenarDisponibilidades(nuevasDisponibilidades);

    setDisponibilidades(ordenadas);

    localStorage.setItem(
      `disponibilidades-medico-${id}`,
      JSON.stringify(ordenadas)
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validarFormulario = () => {
    if (horaAMinutos(form.horaDesde) >= horaAMinutos(form.horaHasta)) {
      message.warning("La hora desde debe ser anterior a la hora hasta.");
      return false;
    }

    if (!form.sede) {
      message.warning("Seleccioná una sede.");
      return false;
    }

    return true;
  };

  const agregarDisponibilidad = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    if (!medicoId) {
      message.error("No se pudo identificar al médico.");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      const disponibilidadNueva = limpiarDisponibilidad(form);

      const medicoActualizado = await medicoService.definirDisponibilidades(
        medicoId,
        [disponibilidadNueva]
      );

      const disponibilidadesActualizadas =
        obtenerDisponibilidadesDelMedico(medicoActualizado);

      guardarEnEstadoYLocalStorage(
        medicoId,
        disponibilidadesActualizadas.length > 0
          ? disponibilidadesActualizadas
          : [...disponibilidades, disponibilidadNueva]
      );

      message.success("Disponibilidad guardada correctamente.");
    } catch (e) {
      message.error(e.message || "No se pudo guardar la disponibilidad.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarDisponibilidad = async (disponibilidad) => {
    if (!medicoId) {
      message.error("No se pudo identificar al médico.");
      return;
    }

    const disponibilidadLimpia = limpiarDisponibilidad(disponibilidad);
    const claveEliminando = `${disponibilidadLimpia.diaSemana}-${disponibilidadLimpia.horaDesde}-${disponibilidadLimpia.horaHasta}-${disponibilidadLimpia.sede}`;

    setEliminando(claveEliminando);
    setError("");

    try {
      const medicoActualizado = await medicoService.eliminarDisponibilidad(
        medicoId,
        disponibilidadLimpia
      );

      const disponibilidadesActualizadas =
        obtenerDisponibilidadesDelMedico(medicoActualizado);

      guardarEnEstadoYLocalStorage(medicoId, disponibilidadesActualizadas);

      message.success("Disponibilidad eliminada correctamente.");
    } catch (e) {
      message.error(e.message || "No se pudo eliminar la disponibilidad.");
    } finally {
      setEliminando("");
    }
  };

  return (
    <main className="disponibilidad-container">
      <section className="disponibilidad-hero">
        <div>
          <p className="disponibilidad-eyebrow">Panel profesional</p>
          <h1>Disponibilidad horaria</h1>
          <p>
            Definí los días y horarios en los que vas a atender pacientes.
            Después el sistema puede usar esa disponibilidad para generar turnos.
          </p>
        </div>

        <Link href="/medico" className="disponibilidad-volver">
          Volver al panel
        </Link>
      </section>

      {error && (
        <div className="disponibilidad-alerta">
          <Alert type="error" message={error} showIcon />
        </div>
      )}

      <section className="disponibilidad-layout">
        <article className="disponibilidad-card">
          <h2>Agregar horario</h2>
          <p>
            Seleccioná el día y la franja horaria en la que el médico estará
            disponible para atender.
          </p>

          <form className="disponibilidad-form" onSubmit={agregarDisponibilidad}>
            <label>
              Día de atención
              <select
                name="diaSemana"
                value={form.diaSemana}
                onChange={handleChange}
              >
                {DIAS.map((dia) => (
                  <option key={dia} value={dia}>
                    {dia}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Sede
              <select
                name="sede"
                value={form.sede}
                onChange={handleChange}
              >
                {sedes.length === 0 && <option value="">Cargando sedes...</option>}
                {sedes.map((sede) => (
                  <option key={sede._id} value={sede._id}>
                    {sede.nombre}
                  </option>
                ))}
              </select>
            </label>

            <div className="disponibilidad-form-row">
              <label>
                Desde
                <select
                  name="horaDesde"
                  value={form.horaDesde}
                  onChange={handleChange}
                >
                  {HORAS.map((hora) => (
                    <option key={hora} value={hora}>
                      {hora}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Hasta
                <select
                  name="horaHasta"
                  value={form.horaHasta}
                  onChange={handleChange}
                >
                  {HORAS.map((hora) => (
                    <option key={hora} value={hora}>
                      {hora}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="submit"
              className="btn-disponibilidad-principal"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar disponibilidad"}
            </button>
          </form>
        </article>

        <article className="disponibilidad-card">
          <div className="disponibilidad-card-header">
            <div>
              <h2>Horarios cargados</h2>
              <p>
                Para modificar un horario, eliminá la franja incorrecta y cargá
                una nueva.
              </p>
            </div>
          </div>

          {disponibilidadesOrdenadas.length === 0 ? (
            <div className="disponibilidad-vacia">
              <span>📅</span>
              <p>Todavía no tenés horarios cargados.</p>
            </div>
          ) : (
            <div className="disponibilidad-lista">
              {disponibilidadesOrdenadas.map((disponibilidad, index) => {
                const clave = `${disponibilidad.diaSemana}-${disponibilidad.horaDesde}-${disponibilidad.horaHasta}-${disponibilidad.sede}`;

                return (
                  <div key={`${clave}-${index}`} className="disponibilidad-item">
                    <div>
                      <strong>{disponibilidad.diaSemana}</strong>
                      <p>
                        {disponibilidad.horaDesde} a{" "}
                        {disponibilidad.horaHasta} hs
                      </p>
                      <p className="disponibilidad-item-sede">
                        <EnvironmentOutlined /> {nombreSede(disponibilidad.sede)}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn-disponibilidad-eliminar"
                      disabled={eliminando === clave}
                      onClick={() => eliminarDisponibilidad(disponibilidad)}
                    >
                      {eliminando === clave ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}