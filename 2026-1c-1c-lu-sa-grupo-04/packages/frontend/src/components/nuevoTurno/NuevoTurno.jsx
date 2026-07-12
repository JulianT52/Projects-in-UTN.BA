"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { UserOutlined, ForkOutlined } from "@ant-design/icons" 
import "./NuevoTurno.css";

const NuevoTurno = () => {
  const router = useRouter();

  return (
    <div className="nuevo-turno-container">
      <div className="nuevo-turno-header">
        <h1>Nuevo turno</h1>
        <p>¿Cómo querés buscar tu turno?</p>
      </div>

      <div className="nuevo-turno-grid">
        <button
          className="nuevo-turno-card"
          onClick={() => router.push("/paciente/especialidades")}
        >
          <span className="nuevo-turno-icon"><ForkOutlined /></span>
          <h2>Por Especialidad</h2>
          <p>Elegí el área médica y mirá los profesionales disponibles.</p>
        </button>

        <button
          className="nuevo-turno-card"
          onClick={() => router.push("/paciente/buscarProfesional")}
        >
          <span className="nuevo-turno-icon"><UserOutlined /></span>
          <h2>Por Profesional</h2>
          <p>Buscá directamente por nombre o apellido del médico.</p>
        </button>
      </div>
    </div>
  );
};

export default NuevoTurno;
