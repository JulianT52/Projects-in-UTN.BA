import { jest } from '@jest/globals';
import * as common from '../../middlewares/validationZod/commonSchema.js';
import * as disponibilidad from '../../middlewares/validationZod/disponibilidadSchema.js';
import * as medico from '../../middlewares/validationZod/medicoSchema.js';
import * as notificacion from '../../middlewares/validationZod/notificacionSchema.js';
import * as obra from '../../middlewares/validationZod/obraSocialSchema.js';
import * as paciente from '../../middlewares/validationZod/pacienteSchema.js';
import * as sede from '../../middlewares/validationZod/sedeSchema.js';
import * as servicio from '../../middlewares/validationZod/servicioSchema.js';
import * as turno from '../../middlewares/validationZod/turnoSchema.js';

describe('Zod validation schemas (comprehensive)', () => {
  test('commonSchema: id and param schemas', () => {
    expect(common.idParamSchema.safeParse({ id: '123' }).success).toBe(true);
    expect(common.idParamSchema.safeParse({ id: '' }).success).toBe(false);

    expect(
      common.medicoPacienteParamsSchema.safeParse({ id: 'm1', pacienteId: 'p1' }).success,
    ).toBe(true);
    expect(
      common.medicoPacienteParamsSchema.safeParse({ id: 'm1', pacienteId: '' }).success,
    ).toBe(false);

    expect(
      common.pacienteTurnoParamsSchema.safeParse({ id: 'p1', turnoId: 't1' }).success,
    ).toBe(true);
    expect(
      common.medicoTurnoParamsSchema.safeParse({ id: 'm1', turnoId: '' }).success,
    ).toBe(false);

    expect(
      common.medicoServicioParamsSchema.safeParse({ id: 'm1', idServicio: 's1' }).success,
    ).toBe(true);
  });

  test('disponibilidadSchema: disponibilidades and validation rules', () => {
    const valid = {
      idMedico: 'm1',
      disponibilidades: [
        { diaSemana: 'LUNES', horaDesde: '09:00', horaHasta: '17:00', sede: 's1' },
      ],
    };
    expect(disponibilidad.disponibilidadesSchema.safeParse(valid).success).toBe(true);

    const invalidTimes = {
      idMedico: 'm1',
      disponibilidades: [
        { diaSemana: 'LUNES', horaDesde: '18:00', horaHasta: '09:00' },
      ],
    };
    expect(disponibilidad.disponibilidadesSchema.safeParse(invalidTimes).success).toBe(false);
  });

  test('medicoSchema: basic required fields and disponibilidadesQuerySchema', () => {
    const validMedico = {
      usuario: { u: 'v' },
      nombre: 'Ana',
      apellido: 'Perez',
      matricula: 'MAT123',
    };
    expect(medico.medicoSchema.safeParse(validMedico).success).toBe(true);
    expect(medico.medicoSchema.safeParse({}).success).toBe(false);

    expect(medico.disponibilidadesQuerySchema.safeParse({ idMedico: 'm1', idServicio: 's1' }).success).toBe(true);
  });

  test('notificacionSchema: required fields', () => {
    expect(notificacion.notificacionSchema.safeParse({ usuario: 'u1', mensaje: 'hola' }).success).toBe(true);
    expect(notificacion.notificacionSchema.safeParse({ usuario: 'u1', mensaje: '' }).success).toBe(false);
  });

  test('obraSocialSchema: nombre required', () => {
    expect(obra.obraSocialSchema.safeParse({ nombre: 'OS Salud' }).success).toBe(true);
    expect(obra.obraSocialSchema.safeParse({ nombre: '' }).success).toBe(false);
  });

  test('pacienteSchema: refine (plan requires obraSocial)', () => {
    const valid = { nombre: 'M', apellido: 'A', dni: '123', usuario: { u: 'v' }, obraSocial: 'os', plan: 'plan1' };
    expect(paciente.pacienteSchema.safeParse(valid).success).toBe(true);

    const invalid = { nombre: 'M', apellido: 'A', dni: '123', usuario: { u: 'v' }, plan: 'plan1' };
    expect(paciente.pacienteSchema.safeParse(invalid).success).toBe(false);
  });

  test('sedeSchema: required string lengths', () => {
    expect(sede.sedeSchema.safeParse({ nombre: 'Centro', direccion: 'Calle 1' }).success).toBe(true);
    expect(sede.sedeSchema.safeParse({ nombre: 'A', direccion: 'C' }).success).toBe(false);
  });

  test('servicioSchema: discriminated unions and query', () => {
    const especialidad = { tipo: 'especialidad', nombre: 'Cardio', duracionTurnoEnMins: 30, costoConsulta: 1500 };
    expect(servicio.addServicioBodySchema.safeParse(especialidad).success).toBe(true);

    const practica = { tipo: 'practica', codigo: 'P1', nombre: 'Eco', duracionEnMins: 20, costo: 800 };
    expect(servicio.addServicioBodySchema.safeParse(practica).success).toBe(true);

    expect(servicio.removeServicioQuerySchema.safeParse({ tipo: 'especialidad' }).success).toBe(true);
  });

  test('turnoSchema: buscarDisponiblesQuerySchema basic and coercions', () => {
    expect(turno.buscarDisponiblesQuerySchema.safeParse({}).success).toBe(true);
    expect(turno.buscarDisponiblesQuerySchema.safeParse({ page: '2' }).success).toBe(true);
    expect(turno.buscarDisponiblesQuerySchema.safeParse({ vista: 'medicos', fecha: '2026-07-06' }).success).toBe(true);
    expect(turno.buscarDisponiblesQuerySchema.safeParse({ vista: 'medicos' }).success).toBe(false);
  });
});
