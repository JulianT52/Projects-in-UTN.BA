"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Alert, message } from "antd";
import { authService } from "../../../services/authService";
import { medicoService } from "../../../services/medicoService";
import "./ServiciosMedico.css";

const especialidadId = (especialidad) => especialidad?._id || especialidad?.id;

const practicaId = (practica) => practica?._id || practica?.id;

const normalizarPractica = (practica) => ({
  codigo: practica.codigo,
  nombre: practica.nombre,
  duracionEnMins: Number(practica.duracionEnMins),
  costo: Number(practica.costo),
});

const normalizarEspecialidadParaBackend = (especialidad) => ({
  nombre: especialidad.nombre,
  practicas: (especialidad.practicas || []).map(normalizarPractica),
});

const obtenerEspecialidadesDelMedico = (respuesta) => {
  const especialidades =
    respuesta?.especialidades ||
    respuesta?.data?.especialidades ||
    [];

  return especialidades;
};

export default function ServiciosMedico() {
  const [medicoId, setMedicoId] = useState(null);
  const [especialidades, setEspecialidades] = useState([]);
  const [error, setError] = useState("");
  const [guardandoEspecialidad, setGuardandoEspecialidad] = useState(false);
  const [guardandoPractica, setGuardandoPractica] = useState(false);
  const [editandoEspecialidadId, setEditandoEspecialidadId] = useState(null);
  const [editandoPractica, setEditandoPractica] = useState(null);

  const [formEspecialidad, setFormEspecialidad] = useState({
    nombre: "",
  });

  const [formPractica, setFormPractica] = useState({
    idEspecialidad: "",
    codigo: "",
    nombre: "",
    duracionEnMins: 30,
    costo: 1000,
  });

  useEffect(() => {
    const cargarServicios = async () => {
      const usuarioLogueado = authService.getUsuario();
      const id = usuarioLogueado?.medicoId;

      if (!id) {
        setError("No se pudo identificar al médico. Iniciá sesión nuevamente.");
        return;
      }

      setMedicoId(id);

      try {
        const medico = await medicoService.obtenerServicios(id);
        const especialidadesBackend = obtenerEspecialidadesDelMedico(medico);

        setEspecialidades(especialidadesBackend);

        localStorage.setItem(
          `servicios-medico-${id}`,
          JSON.stringify(especialidadesBackend)
        );

        if (especialidadesBackend.length > 0) {
          setFormPractica((prev) => ({
            ...prev,
            idEspecialidad: especialidadId(especialidadesBackend[0]),
          }));
        }

        return;
      } catch (error) {
        console.warn("No se pudieron cargar los servicios desde backend:", error);
      }

      const guardadas = localStorage.getItem(`servicios-medico-${id}`);

      if (guardadas) {
        try {
          const serviciosParseados = JSON.parse(guardadas);
          setEspecialidades(serviciosParseados);

          if (serviciosParseados.length > 0) {
            setFormPractica((prev) => ({
              ...prev,
              idEspecialidad: especialidadId(serviciosParseados[0]),
            }));
          }
        } catch {
          localStorage.removeItem(`servicios-medico-${id}`);
        }
      }
    };

    cargarServicios();
  }, []);

  const especialidadesOrdenadas = useMemo(() => {
    return [...especialidades].sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
  }, [especialidades]);

  const guardarServiciosLocalmente = (id, nuevasEspecialidades) => {
    setEspecialidades(nuevasEspecialidades);

    localStorage.setItem(
      `servicios-medico-${id}`,
      JSON.stringify(nuevasEspecialidades)
    );

    if (nuevasEspecialidades.length > 0 && !formPractica.idEspecialidad) {
      setFormPractica((prev) => ({
        ...prev,
        idEspecialidad: especialidadId(nuevasEspecialidades[0]),
      }));
    }
  };

  const actualizarDesdeRespuesta = (respuesta, fallback) => {
    const especialidadesActualizadas = obtenerEspecialidadesDelMedico(respuesta);

    guardarServiciosLocalmente(
      medicoId,
      especialidadesActualizadas.length > 0 ? especialidadesActualizadas : fallback
    );
  };

  const handleEspecialidadChange = (e) => {
    const { name, value } = e.target;

    setFormEspecialidad((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePracticaChange = (e) => {
    const { name, value } = e.target;

    setFormPractica((prev) => ({
      ...prev,
      [name]: name === "duracionEnMins" || name === "costo" ? Number(value) : value,
    }));
  };

  const limpiarFormEspecialidad = () => {
    setFormEspecialidad({ nombre: "" });
    setEditandoEspecialidadId(null);
  };

  const limpiarFormPractica = () => {
    setFormPractica((prev) => ({
      idEspecialidad: prev.idEspecialidad,
      codigo: "",
      nombre: "",
      duracionEnMins: 30,
      costo: 1000,
    }));
    setEditandoPractica(null);
  };

  const guardarEspecialidad = async (e) => {
    e.preventDefault();

    if (!formEspecialidad.nombre.trim()) {
      message.warning("Ingresá el nombre de la especialidad.");
      return;
    }

    if (!medicoId) {
      message.error("No se pudo identificar al médico.");
      return;
    }

    setGuardandoEspecialidad(true);
    setError("");

    try {
      if (editandoEspecialidadId) {
        const especialidadActual = especialidades.find(
          (esp) => especialidadId(esp) === editandoEspecialidadId
        );

        const datos = {
          nombre: formEspecialidad.nombre.trim(),
          practicas: (especialidadActual?.practicas || []).map(normalizarPractica),
        };

        const respuesta = await medicoService.modificarEspecialidad(
          medicoId,
          editandoEspecialidadId,
          datos
        );

        const fallback = especialidades.map((esp) =>
          especialidadId(esp) === editandoEspecialidadId
            ? { ...esp, nombre: formEspecialidad.nombre.trim() }
            : esp
        );

        actualizarDesdeRespuesta(respuesta, fallback);
        message.success("Especialidad modificada correctamente.");
      } else {
        const datos = {
          nombre: formEspecialidad.nombre.trim(),
          practicas: [],
        };

        const respuesta = await medicoService.agregarEspecialidad(medicoId, datos);

        const fallback = [
          ...especialidades,
          {
            ...datos,
            _id: crypto.randomUUID(),
          },
        ];

        actualizarDesdeRespuesta(respuesta, fallback);
        message.success("Especialidad agregada correctamente.");
      }

      limpiarFormEspecialidad();
    } catch (e) {
      setError(e.message || "No se pudo guardar la especialidad.");
      message.error(e.message || "No se pudo guardar la especialidad.");
    } finally {
      setGuardandoEspecialidad(false);
    }
  };

  const prepararEdicionEspecialidad = (especialidad) => {
    setEditandoEspecialidadId(especialidadId(especialidad));
    setFormEspecialidad({
      nombre: especialidad.nombre,
    });
  };

  const eliminarEspecialidad = async (especialidad) => {
    if (!medicoId) {
      message.error("No se pudo identificar al médico.");
      return;
    }

    const id = especialidadId(especialidad);

    try {
      const respuesta = await medicoService.eliminarEspecialidad(medicoId, id);

      const fallback = especialidades.filter(
        (esp) => especialidadId(esp) !== id
      );

      actualizarDesdeRespuesta(respuesta, fallback);
      message.success("Especialidad eliminada correctamente.");

      if (formPractica.idEspecialidad === id) {
        setFormPractica((prev) => ({
          ...prev,
          idEspecialidad: fallback[0] ? especialidadId(fallback[0]) : "",
        }));
      }
    } catch (e) {
      setError(e.message || "No se pudo eliminar la especialidad.");
      message.error(e.message || "No se pudo eliminar la especialidad.");
    }
  };

  const guardarPractica = async (e) => {
    e.preventDefault();

    if (!formPractica.idEspecialidad) {
      message.warning("Primero seleccioná una especialidad.");
      return;
    }

    if (!formPractica.codigo.trim() || !formPractica.nombre.trim()) {
      message.warning("Completá código y nombre de la práctica.");
      return;
    }

    if (Number(formPractica.duracionEnMins) <= 0 || Number(formPractica.costo) <= 0) {
      message.warning("Duración y costo deben ser mayores a cero.");
      return;
    }

    if (!medicoId) {
      message.error("No se pudo identificar al médico.");
      return;
    }

    const practicaPayload = {
      codigo: formPractica.codigo.trim(),
      nombre: formPractica.nombre.trim(),
      duracionEnMins: Number(formPractica.duracionEnMins),
      costo: Number(formPractica.costo),
    };

    setGuardandoPractica(true);
    setError("");

    try {
      if (editandoPractica) {
        const respuesta = await medicoService.modificarPractica(
          medicoId,
          editandoPractica.idEspecialidad,
          editandoPractica.idPractica,
          practicaPayload
        );

        const fallback = especialidades.map((esp) => {
          if (especialidadId(esp) !== editandoPractica.idEspecialidad) return esp;

          return {
            ...esp,
            practicas: (esp.practicas || []).map((prac) =>
              practicaId(prac) === editandoPractica.idPractica
                ? { ...prac, ...practicaPayload }
                : prac
            ),
          };
        });

        actualizarDesdeRespuesta(respuesta, fallback);
        message.success("Práctica modificada correctamente.");
      } else {
        const respuesta = await medicoService.agregarPractica(
          medicoId,
          formPractica.idEspecialidad,
          practicaPayload
        );

        const fallback = especialidades.map((esp) => {
          if (especialidadId(esp) !== formPractica.idEspecialidad) return esp;

          return {
            ...esp,
            practicas: [
              ...(esp.practicas || []),
              {
                ...practicaPayload,
                _id: crypto.randomUUID(),
              },
            ],
          };
        });

        actualizarDesdeRespuesta(respuesta, fallback);
        message.success("Práctica agregada correctamente.");
      }

      limpiarFormPractica();
    } catch (e) {
      setError(e.message || "No se pudo guardar la práctica.");
      message.error(e.message || "No se pudo guardar la práctica.");
    } finally {
      setGuardandoPractica(false);
    }
  };

  const prepararEdicionPractica = (especialidad, practica) => {
    setEditandoPractica({
      idEspecialidad: especialidadId(especialidad),
      idPractica: practicaId(practica),
    });

    setFormPractica({
      idEspecialidad: especialidadId(especialidad),
      codigo: practica.codigo || "",
      nombre: practica.nombre || "",
      duracionEnMins: Number(practica.duracionEnMins || 30),
      costo: Number(practica.costo || 1000),
    });
  };

  const eliminarPractica = async (especialidad, practica) => {
    if (!medicoId) {
      message.error("No se pudo identificar al médico.");
      return;
    }

    const idEspecialidad = especialidadId(especialidad);
    const idPractica = practicaId(practica);

    try {
      const respuesta = await medicoService.eliminarPractica(
        medicoId,
        idEspecialidad,
        idPractica
      );

      const fallback = especialidades.map((esp) => {
        if (especialidadId(esp) !== idEspecialidad) return esp;

        return {
          ...esp,
          practicas: (esp.practicas || []).filter(
            (prac) => practicaId(prac) !== idPractica
          ),
        };
      });

      actualizarDesdeRespuesta(respuesta, fallback);
      message.success("Práctica eliminada correctamente.");
    } catch (e) {
      setError(e.message || "No se pudo eliminar la práctica.");
      message.error(e.message || "No se pudo eliminar la práctica.");
    }
  };

  return (
    <main className="servicios-medico-container">
      <section className="servicios-medico-hero">
        <div>
          <p className="servicios-medico-eyebrow">Panel profesional</p>
          <h1>Servicios médicos</h1>
          <p>
            Administrá las especialidades y prácticas que ofrecés para que los
            pacientes puedan encontrarlas al buscar turnos.
          </p>
        </div>

        <Link href="/medico" className="servicios-medico-volver">
          Volver al panel
        </Link>
      </section>

      {error && (
        <div className="servicios-medico-alerta">
          <Alert type="error" message={error} showIcon />
        </div>
      )}

      <section className="servicios-medico-layout">
        <article className="servicios-medico-card">
          <h2>{editandoEspecialidadId ? "Modificar especialidad" : "Agregar especialidad"}</h2>
          <p>
            Cargá una especialidad ofrecida por el médico, por ejemplo
            Cardiología o Dermatología.
          </p>

          <form className="servicios-medico-form" onSubmit={guardarEspecialidad}>
            <label>
              Nombre de la especialidad
              <input
                name="nombre"
                value={formEspecialidad.nombre}
                onChange={handleEspecialidadChange}
                placeholder="Ej: Cardiología"
              />
            </label>

            <div className="servicios-medico-actions">
              <button
                type="submit"
                className="btn-servicios-principal"
                disabled={guardandoEspecialidad}
              >
                {guardandoEspecialidad
                  ? "Guardando..."
                  : editandoEspecialidadId
                  ? "Guardar cambios"
                  : "Agregar especialidad"}
              </button>

              {editandoEspecialidadId && (
                <button
                  type="button"
                  className="btn-servicios-secundario"
                  onClick={limpiarFormEspecialidad}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="servicios-medico-card">
          <h2>{editandoPractica ? "Modificar práctica" : "Agregar práctica"}</h2>
          <p>
            Asociá prácticas a una especialidad, indicando código, duración y
            costo.
          </p>

          <form className="servicios-medico-form" onSubmit={guardarPractica}>
            <label>
              Especialidad
              <select
                name="idEspecialidad"
                value={formPractica.idEspecialidad}
                onChange={handlePracticaChange}
                disabled={especialidadesOrdenadas.length === 0}
              >
                <option value="">Seleccionar especialidad</option>
                {especialidadesOrdenadas.map((esp) => (
                  <option key={especialidadId(esp)} value={especialidadId(esp)}>
                    {esp.nombre}
                  </option>
                ))}
              </select>
            </label>

            <div className="servicios-medico-form-row">
              <label>
                Código
                <input
                  name="codigo"
                  value={formPractica.codigo}
                  onChange={handlePracticaChange}
                  placeholder="Ej: ECG"
                />
              </label>

              <label>
                Duración en minutos
                <input
                  type="number"
                  name="duracionEnMins"
                  value={formPractica.duracionEnMins}
                  onChange={handlePracticaChange}
                  min="1"
                />
              </label>
            </div>

            <label>
              Nombre de la práctica
              <input
                name="nombre"
                value={formPractica.nombre}
                onChange={handlePracticaChange}
                placeholder="Ej: Electrocardiograma"
              />
            </label>

            <label>
              Costo
              <input
                type="number"
                name="costo"
                value={formPractica.costo}
                onChange={handlePracticaChange}
                min="1"
              />
            </label>

            <div className="servicios-medico-actions">
              <button
                type="submit"
                className="btn-servicios-principal"
                disabled={guardandoPractica || especialidadesOrdenadas.length === 0}
              >
                {guardandoPractica
                  ? "Guardando..."
                  : editandoPractica
                  ? "Guardar cambios"
                  : "Agregar práctica"}
              </button>

              {editandoPractica && (
                <button
                  type="button"
                  className="btn-servicios-secundario"
                  onClick={limpiarFormPractica}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </article>
      </section>

      <section className="servicios-medico-card servicios-medico-listado">
        <div className="servicios-medico-section-header">
          <div>
            <h2>Servicios cargados</h2>
            <p>
              Acá se visualizan las especialidades y sus prácticas asociadas.
            </p>
          </div>
        </div>

        {especialidadesOrdenadas.length === 0 ? (
          <div className="servicios-medico-vacio">
            <span>🩺</span>
            <p>Todavía no cargaste especialidades.</p>
          </div>
        ) : (
          <div className="servicios-medico-especialidades">
            {especialidadesOrdenadas.map((esp) => (
              <article key={especialidadId(esp)} className="servicios-medico-especialidad">
                <div className="servicios-medico-especialidad-header">
                  <div>
                    <h3>{esp.nombre}</h3>
                    <p>
                      {(esp.practicas || []).length} práctica
                      {(esp.practicas || []).length === 1 ? "" : "s"} cargada
                      {(esp.practicas || []).length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="servicios-medico-item-actions">
                    <button
                      type="button"
                      className="btn-servicios-editar"
                      onClick={() => prepararEdicionEspecialidad(esp)}
                    >
                      Modificar
                    </button>

                    <button
                      type="button"
                      className="btn-servicios-eliminar"
                      onClick={() => eliminarEspecialidad(esp)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {(esp.practicas || []).length === 0 ? (
                  <p className="servicios-medico-sin-practicas">
                    Esta especialidad todavía no tiene prácticas.
                  </p>
                ) : (
                  <div className="servicios-medico-practicas">
                    {(esp.practicas || []).map((practica) => (
                      <div key={practicaId(practica)} className="servicios-medico-practica">
                        <div>
                          <strong>{practica.nombre}</strong>
                          <p>
                            Código {practica.codigo} · {practica.duracionEnMins} min · ${practica.costo}
                          </p>
                        </div>

                        <div className="servicios-medico-item-actions">
                          <button
                            type="button"
                            className="btn-servicios-editar"
                            onClick={() => prepararEdicionPractica(esp, practica)}
                          >
                            Modificar
                          </button>

                          <button
                            type="button"
                            className="btn-servicios-eliminar"
                            onClick={() => eliminarPractica(esp, practica)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}