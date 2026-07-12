import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="logo-text">SWEET <b className="text-red">MEDICAL</b></span>
          <p>Plataforma Integral de Gestión de Cobertura y Turnos Médicos.</p>
        </div>
        <div className="footer-info">
          <p>&copy; {new Date().getFullYear()} Sweet Medical. Todos los derechos reservados.</p>
          <p className="academic-tag">Trabajo Práctico Integrador - Cátedra Desarrollo de Software - UTN.BA</p>
        </div>
      </div>
    </footer>
  );
}