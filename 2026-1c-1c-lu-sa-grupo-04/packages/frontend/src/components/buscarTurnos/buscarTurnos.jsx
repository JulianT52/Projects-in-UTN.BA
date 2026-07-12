"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { turnoService } from '../../services/turnoService';
import { especialidadService } from '../../services/especialidadesService';
import { sedeService } from '../../services/sedeService';
import { authService } from '../../services/authService';
import { useCarrito } from '../../context/CarritoContext';
import { Skeleton, Alert } from 'antd';
import ConfirmarTurnoModal from '../modal/ConfirmarTurnoModal';
import './buscarTurnos.css';

const LIMIT = 5;

const BuscarTurnos = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { agregarAlCarrito } = useCarrito();

  const [turnoAConfirmar, setTurnoAConfirmar] = useState(null);

  const [filtros, setFiltros] = useState({
    especialidad: searchParams.get('especialidad') || '',
    medico: '',
    sede: '',
    fechaDesde: '',
    fechaHasta: '',
    sortBy: 'fechaHora',
    sortOrder: 'asc',
  });

  const [especialidades, setEspecialidades] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [yaBusco, setYaBusco] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);
const usuario = authService.getUsuario();
  const buscar = async (page = 1) => {
    
    if (!usuario || !usuario.pacienteId) {
      setError('Tenés que iniciar sesión para buscar turnos.');
      setYaBusco(true);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await turnoService.buscarDisponibles({
        pacienteId: usuario.pacienteId,
        especialidad: filtros.especialidad || undefined,
        medico: filtros.medico || undefined,
        sedeId: filtros.sede || undefined,
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta,
        sortBy: filtros.sortBy,
        sortOrder: filtros.sortOrder,
        page,
        limit: LIMIT,
      });
      setResultados(res.data);
      setPagination(res.pagination);
      setYaBusco(true);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al buscar turnos.');
      setResultados([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscar(1);
    especialidadService.obtenerEspecialidades()
      .then(res => setEspecialidades(res.data))
      .catch(err => console.error('Error cargando especialidades:', err));
    sedeService.obtenerSedes()
      .then(res => setSedes(res.data))
      .catch(err => console.error('Error cargando sedes:', err));
  }, []);

  const handleChange = (e) =>
    setFiltros({ ...filtros, [e.target.name]: e.target.value });

  const handleSearch = (e) => {
    e.preventDefault();
    buscar(1);
  };

  const handlePreseleccionar = (turno) => {
    setTurnoAConfirmar(turno);
  };

  const formatFecha = (fecha) =>
    new Date(fecha).toLocaleString('es-AR', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Argentina/Buenos_Aires',
    });

  const formatMonto = (monto) =>
    monto === 0 ? 'Sin cargo' : `$${Number(monto).toLocaleString('es-AR')}`;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Hola, {usuario?.nombre} 👋</h1>
        <p>¿Qué turno estás buscando hoy?</p>
      </div>

      <div className="dashboard-content">
        {/* Módulo Principal: Buscador de Turnos */}
        <section className="search-section">
          <h2>Buscador de Turnos</h2>
          <form className="search-form" onSubmit={handleSearch}>
            <div className="form-group">
              <label htmlFor="especialidad">Especialidad / Práctica</label>
              <select id="especialidad" name="especialidad" value={filtros.especialidad} onChange={handleChange}>
                <option value="">Todas las especialidades</option>
                {especialidades.map(esp => (
                  <option key={esp.id} value={esp.nombre}>{esp.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="medico">Profesional (Opcional)</label>
              <input
                id="medico"
                name="medico"
                type="text"
                placeholder="Ej. Dr. Pérez"
                value={filtros.medico}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="sede">Sede</label>
              <select id="sede" name="sede" value={filtros.sede} onChange={handleChange}>
                <option value="">Cualquier sede</option>
                {sedes.map(sede => (
                  <option key={sede._id} value={sede._id}>{sede.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fechaDesde">Desde</label>
              <input type="date" id="fechaDesde" name="fechaDesde" value={filtros.fechaDesde} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="fechaHasta">Hasta</label>
              <input type="date" id="fechaHasta" name="fechaHasta" value={filtros.fechaHasta} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="sortBy">Ordenar por</label>
              <select id="sortBy" name="sortBy" value={filtros.sortBy} onChange={handleChange}>
                <option value="fechaHora">Fecha</option>
                <option value="costo">Costo</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="sortOrder">Orden</label>
              <select id="sortOrder" name="sortOrder" value={filtros.sortOrder} onChange={handleChange}>
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>
            </div>

            <button type="submit" className="btn-primary btn-search" disabled={loading}>
              {loading ? 'Buscando...' : '🔍 Buscar Turnos'}
            </button>
          </form>
        </section>
      </div>
      <section className="resultados-section">
        {loading && (
          <ul className="turnos-lista" role="status" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="turno-card">
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </li>
            ))}
          </ul>
        )}
        {error && (
          <Alert
            type="error"
            title={error}
            showIcon
            style={{ marginBottom: '1rem' }}
          />
        )}

        {!loading && !error && yaBusco && resultados.length === 0 && (
          <Alert
            type="info"
            title="No se encontraron turnos con esos criterios."
            showIcon
          />
        )}

        {!loading && !error && resultados.length > 0 && (
          <>
            <ul className="turnos-lista">
              {resultados.map((turno) => (
                <li key={turno._id} className="turno-card">
                  <div className="turno-info">
                    <h3>{turno.profesional}</h3>
                    <p className="servicio">{turno.servicio}</p>
                    <p className="detalle">📅 {formatFecha(turno.fecha)}</p>
                    <p className="detalle">📍 {turno.sede}</p>
                  </div>
                  <div className="turno-cobertura">
                    <span className={`cobertura-badge ${turno.nivelCobertura}`}>
                      {turno.nivelCobertura}
                    </span>
                    <p className="monto">{formatMonto(turno.montoAAbonar)}</p>
                    <button
                      className="btn-primary"
                      style={{ marginTop: '15px', width: '100%' }}
                      onClick={() => handlePreseleccionar(turno)}
                    >
                      Seleccionar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {pagination && pagination.totalPages > 1 && (
              <div className="paginacion">
                <button onClick={() => buscar(pagination.page - 1)} disabled={pagination.page <= 1 || loading}>
                  ← Anterior
                </button>
                <span>Página {pagination.page} de {pagination.totalPages}</span>
                <button onClick={() => buscar(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages || loading}>
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {turnoAConfirmar && (
        <ConfirmarTurnoModal
          turno={turnoAConfirmar}
          onClose={() => setTurnoAConfirmar(null)}
        />
      )}
    </div>
  );
};

export default BuscarTurnos;
