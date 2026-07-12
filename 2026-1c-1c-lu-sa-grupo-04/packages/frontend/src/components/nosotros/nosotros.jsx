"use client";

import React from "react";
import Footer from "../footer/Footer";
import {
  SearchOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import "./nosotros.css";

const pilares = [
  {
    icon: <SearchOutlined />,
    title: "Acceso inteligente",
    description: "Encontrá profesionales según tu cobertura, especialidad o ubicación.",
  },
  {
    icon: <CalendarOutlined />,
    title: "Gestión simple",
    description: "Administrá turnos y agendas de forma ordenada y sin procesos manuales.",
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: "Cobertura transparente",
    description: "Consultá cartillas médicas y coberturas con información clara y actualizada.",
  },
  {
    icon: <MedicineBoxOutlined />,
    title: "Tecnología para la salud",
    description: "Una plataforma moderna que conecta pacientes, médicos y obras sociales.",
  },
];

export default function Nosotros() {
  return (
    <>
      <main className="nosotros-page">
        <div className="nosotros-container">
          
          <h1>Quiénes somos</h1>

          <div className="nosotros-content">
            <p>
              En Sweet Medical creemos que acceder a la atención médica debería ser simple, rápido y 
              transparente. Por eso desarrollamos una plataforma que conecta pacientes, profesionales 
              de la salud y obras sociales en un único lugar, brindando una experiencia ágil y segura 
              para la gestión de turnos médicos.
            </p>
            <p>
              Nuestra misión es simplificar cada etapa del proceso de atención mediante una solución 
              intuitiva que permite encontrar profesionales según la cobertura, especialidad o ubicación, 
              gestionar turnos de manera eficiente y acceder a información actualizada en todo momento.
            </p>
            <p>
              Impulsamos la transformación digital del sistema de salud con una plataforma moderna, 
              confiable y escalable, diseñada para mejorar la experiencia de los pacientes y brindar a 
              los profesionales una herramienta eficiente para organizar su práctica diaria.
            </p>
          </div>

          <div className="nosotros-cards">
            {pilares.map((pilar) => (
              <div key={pilar.title} className="nosotros-card">
                <div className="nosotros-card-icon">{pilar.icon}</div>
                <h3>{pilar.title}</h3>
                <p>{pilar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
