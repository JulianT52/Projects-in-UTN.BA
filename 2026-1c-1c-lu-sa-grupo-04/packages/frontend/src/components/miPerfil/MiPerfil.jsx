"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { authService } from "../../services/authService";
import { pacienteService } from "../../services/pacienteService";
import "./MiPerfil.css";

const formatearDni = (dni) => {
  if (!dni) return "—";
  const soloNumeros = dni.replace(/\D/g, "");
  if (soloNumeros.length < 7) return dni;
  return soloNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const ROL_LABELS = {
  PACIENTE: "Paciente",
  MEDICO: "Médico",
};

const CampoDato = ({ etiqueta, valor }) => (
  <div className="mi-perfil-campo">
    <span className="mi-perfil-campo-etiqueta">{etiqueta}</span>
    <strong className="mi-perfil-campo-valor">{valor || "—"}</strong>
  </div>
);

const MiPerfil = () => {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login");
      return;
    }

    const usuarioSesion = authService.getUsuario();

    if (!usuarioSesion) {
      setError("No se encontraron datos de sesión. Iniciá sesión nuevamente.");
      return;
    }

    if (usuarioSesion.rol !== "PACIENTE") {
      router.push(usuarioSesion.rol === "MEDICO" ? "/medico" : "/");
      return;
    }

    const cargarUsuario = async () => {
      let datos = usuarioSesion;

      if (usuarioSesion.pacienteId && !usuarioSesion.dni) {
        try {
          const respuesta = await pacienteService.obtenerPerfil(usuarioSesion.pacienteId);
          datos = {
            ...usuarioSesion,
            dni: respuesta?.data?.dni ?? null,
            obraSocial: respuesta?.data?.obraSocial ?? null,
            plan: respuesta?.data?.plan ?? null,
          };
          localStorage.setItem("usuario", JSON.stringify(datos));
        } catch {
          setError("No se pudieron cargar todos los datos del perfil.");
        }
      }

      setUsuario(datos);
    };

    cargarUsuario();
  }, [router]);

  return (
    <main className="mi-perfil-container">
      <Link href="/paciente" className="mi-perfil-volver">
        <LeftOutlined />
        Volver atrás
      </Link>

      <header className="mi-perfil-header">
        <h1>Mi perfil</h1>
        <p>Acá podés consultar tus datos personales registrados en Sweet Medical.</p>
      </header>

      {error && <Alert type="error" message={error} showIcon />}

      {!error && usuario && (
        <section className="mi-perfil-card">
          <div className="mi-perfil-grid">
            <CampoDato etiqueta="Nombre:" valor={usuario.nombre} />
            <CampoDato etiqueta="Apellido:" valor={usuario.apellido} />
            <CampoDato etiqueta="DNI:" valor={formatearDni(usuario.dni)} />
            <CampoDato etiqueta="Usuario:" valor={usuario.nombreUsuario} />
            <CampoDato etiqueta="Obra social:" valor={usuario.obraSocial} />
            <CampoDato etiqueta="Plan:" valor={usuario.plan} />
            <CampoDato
              etiqueta="Rol:"
              valor={ROL_LABELS[usuario.rol] || usuario.rol}
            />
          </div>
        </section>
      )}
    </main>
  );
};

export default MiPerfil;
