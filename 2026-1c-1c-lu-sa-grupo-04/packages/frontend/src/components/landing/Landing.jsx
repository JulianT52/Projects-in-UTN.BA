"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "../footer/Footer";

import {
  CalendarOutlined,
  MedicineBoxOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  LockOutlined,
  HeartOutlined,
  DollarOutlined,
  BellOutlined
} from "@ant-design/icons";

import "./Landing.css";
import { authService } from "../../services/authService";

export default function LandingPage() {
  const router = useRouter();

  const handleBuscarTurnos = () => {
    if (authService.isAuthenticated()) {
      router.push("/turnos");
    } else {
      router.push("/login");
    }
  };

  useEffect(() => {
    if (window.location.hash === "#beneficios") {
      const timer = setTimeout(() => {
        document.getElementById("beneficios")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <div className="landing-container">
        <section className="hero-section">
          <div className="hero-left">
            <div className="hero-badge">
              ❤️ Tu salud, nuestra prioridad
            </div>

            <h1>
              Gestioná tu salud
              <br />
              de forma simple y
              <span> eficiente</span>
            </h1>

            <p>
              Reservá turnos en línea, consultá cartillas médicas
              y coordiná tu atención médica en pocos clics.
            </p>

            <div className="hero-buttons">
              <button
                className="btn-primary"
                onClick={handleBuscarTurnos}
              >
                <CalendarOutlined />
                Buscar Turnos
              </button>

              <button
                className="btn-secondary"
                onClick={() => router.push("/paciente/especialidades")}
              >
                <MedicineBoxOutlined />
                Ver Especialidades
              </button>
            </div>

            <div className="hero-tags">
              <div className="hero-tag">
                <SafetyCertificateOutlined />
                Seguro y confiable
              </div>
              <div className="hero-tag">
                <ClockCircleOutlined />
                Disponible 24/7
              </div>
              <div className="hero-tag">
                <LockOutlined />
                Datos protegidos
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="circle-bg"></div>
            
            <div className="hero-images-container">
              <img
                src="/medicos.jpeg"
                alt="Médico"
                className="hover-image image-1"
              />
              <img
                src="/clinica.jpeg"
                alt="Clínica"
                className="hover-image image-2"
              />
              <img
                src="/familia.jpeg"
                alt="Salud"
                className="hover-image image-3"
              />
            </div>
          </div>
        </section>


        <section className="partners">
          <p>Con la confianza de miles de pacientes</p>
          <div className="partners-grid">
            <span>SWISS MEDICAL</span>
            <span>OSDE</span>
            <span>GALENO</span>
            <span>MEDIFÉ</span>
            <span>OMINT</span>
          </div>
        </section>


        <section id="beneficios" className="benefits">
          <span className="section-tag">BENEFICIOS</span>
          <h2>¿Por qué elegir Sweet Medical?</h2>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <CalendarOutlined />
              </div>
              <h3>Gestión Online</h3>
              <p>Buscá y reservá turnos según tu disponibilidad.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <DollarOutlined />
              </div>
              <h3>Costos Claros</h3>
              <p>Visualizá el costo estimado antes de reservar.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <BellOutlined />
              </div>
              <h3>Recordatorios</h3>
              <p>Recibí alertas antes de cada turno.</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <div className="cta-left">
              <div className="cta-icon">
                <HeartOutlined />
              </div>
              <div>
                <h3>Cuidar tu salud nunca fue tan fácil</h3>
                <p>Unite a Sweet Medical y empezá a gestionar tus turnos hoy mismo.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}