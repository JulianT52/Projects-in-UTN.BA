"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, Badge, message } from "antd";
import { UserOutlined, BellOutlined, ShoppingCartOutlined, LogoutOutlined, ProfileOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useNotificaciones } from "../../context/NotificacionesContext";
import { formatearTiempo } from "../../utils/formatearTiempo";
import { useAuth } from "../../app/providers";
import { authService } from "../../services/authService";
import "./Header.css";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);

  const { notificaciones, noLeidas } = useNotificaciones();
  const { logout } = useAuth();
  const recientes = notificaciones.filter((n) => !n.leida).slice(0, 3);

  const isLogged = !!usuario;
  const esMedico = usuario?.rol === "MEDICO";
  const esPaciente = usuario?.rol === "PACIENTE";

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setUsuario(null);
      return;
    }

    setUsuario(authService.getUsuario());
  }, [pathname]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setNotifOpen(false);
  };

  const toggleNotif = () => {
    setNotifOpen(!notifOpen);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUsuario(null);
    setMenuOpen(false);
    setNotifOpen(false);
    message.success("Sesión cerrada");
    router.push("/");
  };

  const irAlInicio = () => {
    if (esMedico) {
      router.push("/medico");
    } else if (esPaciente){
      router.push("/paciente");
    } else {
      router.push("/");
    }
  };

  const irABeneficios = (e) => {
    e.preventDefault();
    if (pathname === "/") {
      document.getElementById("beneficios")?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#beneficios");
    }
  };

  return (
    <header className="landing-header">
      <div className="logo-section" onClick={irAlInicio}>
        <img
          src="/logo.png"
          alt="Sweet Medical Logo"
          className="header-logo"
        />
        <span className="logo-text">
          SWEET <b className="text-gray">MEDICAL</b>
        </span>
      </div>

      <nav className="landing-nav">

        {!esMedico && (
          <>
            <a href="/#beneficios" onClick={irABeneficios}>Beneficios</a>
            <Link href="/nosotros">Nosotros</Link>
          </>
        )}

        {esMedico && (
          <>
            <Link href="/medico/agenda">Mi agenda</Link>
            <Link href="/medico/historialPacientes">Pacientes</Link>
            <Link href="/medico/disponibilidad">Disponibilidad</Link>
            <Link href="/medico/servicios">Servicios</Link>
          </>
        )}

        {isLogged ? (
          <div className="header-actions">
            {esPaciente && (
              <Link
                href="/paciente/carrito"
                className="header-cart-link"
                title="Carrito"
              >
                <ShoppingCartOutlined className="header-icon" />
              </Link>
            )}

            <div className="header-dropdown-wrapper">
              <Badge count={noLeidas} size="small" offset={[-2, 5]}>
                <BellOutlined
                  onClick={toggleNotif}
                  className="header-icon"
                  title="Notificaciones"
                />
              </Badge>

              {notifOpen && (
                <div className="dropdown-notif">
                  <div className="dropdown-notif-header">
                    <strong>Notificaciones</strong>

                    {noLeidas > 0 && (
                      <span className="dropdown-notif-badge">
                        {noLeidas} nuevas
                      </span>
                    )}
                  </div>

                  {recientes.length === 0 ? (
                    <p className="dropdown-empty">
                      No tenés notificaciones nuevas.
                    </p>
                  ) : (
                    recientes.map((n) => (
                      <div key={n._id} className="dropdown-notif-item">
                        <p className="dropdown-notif-text">{n.mensaje}</p>
                        <small>{formatearTiempo(n.createdAt)}</small>
                      </div>
                    ))
                  )}

                  <Link
                    href="/notificaciones"
                    onClick={() => setNotifOpen(false)}
                    className="dropdown-see-all"
                  >
                    Ver todas →
                  </Link>
                </div>
              )}
            </div>

            <div className="header-dropdown-wrapper">
              <div
                onClick={toggleMenu}
                className="header-avatar-button"
                title="Mi perfil"
              >
                <Avatar
                  size="large"
                  icon={<UserOutlined />}
                  className="header-avatar"
                />
              </div>

              {menuOpen && (
                <div className="dropdown-user">
                  <div className="dropdown-user-info">
                    <strong>{usuario?.nombreUsuario}</strong>
                    <span>{esMedico ? "Médico" : "Paciente"}</span>
                  </div>

                  <Link
                    href="/mi-perfil"
                    onClick={() => setMenuOpen(false)}
                    className="dropdown-user-link">
                    <ProfileOutlined /> Mi Perfil
                    </Link>

                  <button onClick={handleLogout} className="dropdown-logout">
                    <LogoutOutlined /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button className="btn-login" onClick={() => router.push("/login")}>
            Iniciar sesión
          </button>
        )}
      </nav>
    </header>
  );
}