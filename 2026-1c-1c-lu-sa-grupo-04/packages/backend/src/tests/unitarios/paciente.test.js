import { jest } from '@jest/globals';
import { PacienteService } from '../../services/pacienteService.js';
import { EstadoTurno } from '../../domain/estadoTurno.js';
import { ConflictError, NotFoundError, BadRequestError, UnprocessableEntityError } from '../../errors/errores.js';

describe('PacienteService - Unit Tests', () => {
    let pacienteService;
    let mockPacienteRepository;
    let mockUsuarioService;
    let mockTurnoService;
    let mockNotificacionService; 
    let mockFactoryNotificacion;

    const pacienteId = "pac-001";
    const turnoId = "turno-001";

    const pacienteDB = {
        _id: pacienteId,
        nombre: "María",
        apellido: "López",
        dni: "33445566",
        usuario: { nombre: "maria", password: "pass123" },
        plan: { _id: "plan-001" },
        obraSocial: { _id: "os-001" }
    };

    const pacienteEnTurno = {
        _id: pacienteId,
        usuario: "usuario-paciente-001",
        nombre: "María",
        apellido: "López"
    };

    const otroPacienteEnTurno = {
        _id: "otro-paciente",
        usuario: "usuario-otro-paciente",
        nombre: "Otro",
        apellido: "Paciente"
    };

    const medicoEnTurno = {
        _id: "medico-001",
        usuario: "usuario-medico-001",
        nombre: "Dr. Pérez"
    };

    const turnoDisponibleDB = {
        _id: turnoId,
        estado: EstadoTurno.DISPONIBLE,
        paciente: null,
        fechaHora: new Date(Date.now() + 2 * 60 * 60 * 1000),
        historialEstados: [],
        medico: medicoEnTurno
    };

    beforeEach(() => {
        mockPacienteRepository = {
            obtenerPorId: jest.fn(),
            obtenerPorDni: jest.fn(),
            guardarPaciente: jest.fn()
        };

        mockUsuarioService = {
            create: jest.fn().mockResolvedValue({ _id: "usuario-123" })
        };

        mockTurnoService = {
            obtenerTurnoConDetalles: jest.fn(),
            calcularCostoYCobertura: jest.fn().mockReturnValue({ costoFinal: 3000 }),
            actualizarTurno: jest.fn().mockImplementation(t => Promise.resolve(t)),
            verificarDisponibilidadParaCambio: jest.fn(),
            obtenerHistorialTurnosPaciente: jest.fn()
        };

        mockFactoryNotificacion = {
            crearSegunEstadoTurno: jest.fn().mockReturnValue({
                mensaje: "Notificación generada: El estado del turno ha sido actualizado." 
            })
        };

        mockNotificacionService = {
            create: jest.fn().mockResolvedValue(true),
            procesarNotificacionTurno: jest.fn().mockResolvedValue(undefined)
        };

        pacienteService = new PacienteService({
            pacienteRepository: mockPacienteRepository,
            usuarioService: mockUsuarioService,
            turnoService: mockTurnoService,
            factoryNotificacion: mockFactoryNotificacion,
            notificacionService: mockNotificacionService
        });
    });

    describe('Alta de Paciente (create)', () => {

        test('Debería crear un paciente correctamente con datos válidos', async () => {
            const datosInput = {
                nombre: "María",
                apellido: "López",
                dni: "33445566",
                usuario: { nombre: "maria", contraseña: "pass123" },
                obraSocial: "os-001",
                plan: "plan-001"
            };

            mockPacienteRepository.obtenerPorDni.mockResolvedValue(null);
            mockPacienteRepository.guardarPaciente.mockImplementation(p => Promise.resolve(p));

            const resultado = await pacienteService.create(datosInput);

            expect(resultado).toBeDefined();
            expect(mockUsuarioService.create).toHaveBeenCalled();
            expect(mockPacienteRepository.guardarPaciente).toHaveBeenCalled();
        });

        test('Debería lanzar ConflictError si el DNI ya está registrado', async () => {
            const datosInput = {
                nombre: "María",
                apellido: "López",
                dni: "33445566",
                usuario: { nombre: "maria", contraseña: "pass123" }
            };

            mockPacienteRepository.obtenerPorDni.mockResolvedValue(pacienteDB);

            await expect(pacienteService.create(datosInput))
                .rejects.toThrow(ConflictError);
        });

        test('Debería lanzar UnprocessableEntityError si el nombre está vacío', async () => {
            const datosInvalidos = {
                nombre: "",
                apellido: "López",
                dni: "33445566",
                usuario: { nombre: "maria", contraseña: "pass123" }
            };

            await expect(pacienteService.create(datosInvalidos))
                .rejects.toThrow(UnprocessableEntityError);
        });

        test('Debería lanzar UnprocessableEntityError si se asigna plan sin obra social', async () => {
            const datosInvalidos = {
                nombre: "María",
                apellido: "López",
                dni: "33445566",
                usuario: { nombre: "maria", contraseña: "pass123" },
                plan: "plan-001"
            };

            await expect(pacienteService.create(datosInvalidos))
                .rejects.toThrow(UnprocessableEntityError);
        });
    });

    describe('Cancelar Turno', () => {

        test('Debería cancelar un turno propio correctamente con más de 1 hora de anticipación', async () => {
            const turnoReservado = {
                ...turnoDisponibleDB,
                estado: EstadoTurno.RESERVADO,
                paciente: pacienteEnTurno,
                fechaHora: new Date(Date.now() + 2 * 60 * 60 * 1000),
                historialEstados: []
            };

            mockPacienteRepository.obtenerPorId.mockResolvedValue(pacienteDB);
            mockTurnoService.obtenerTurnoConDetalles.mockResolvedValue(turnoReservado);

            const resultado = await pacienteService.cancelarTurno(
                pacienteId,
                turnoId,
                "No puedo asistir"
            );

            expect(resultado.estado).toBe(EstadoTurno.CANCELADO);
            expect(resultado.historialEstados).toHaveLength(1);
            expect(resultado.historialEstados[0].estado).toBe(EstadoTurno.CANCELADO);
            expect(resultado.historialEstados[0].motivo).toBe("No puedo asistir");
            expect(mockTurnoService.actualizarTurno).toHaveBeenCalled();
            expect(mockNotificacionService.procesarNotificacionTurno).toHaveBeenCalled();
        });

        test('Debería lanzar BadRequestError si no se informa motivo', async () => {
            await expect(pacienteService.cancelarTurno(pacienteId, turnoId, ""))
                .rejects.toThrow(BadRequestError);
        });

        test('Debería lanzar NotFoundError si el paciente no existe', async () => {
            mockPacienteRepository.obtenerPorId.mockResolvedValue(null);

            await expect(pacienteService.cancelarTurno(pacienteId, turnoId, "Motivo válido"))
                .rejects.toThrow(NotFoundError);
        });

        test('Debería lanzar NotFoundError si el turno no existe', async () => {
            mockPacienteRepository.obtenerPorId.mockResolvedValue(pacienteDB);
            mockTurnoService.obtenerTurnoConDetalles.mockResolvedValue(null);

            await expect(pacienteService.cancelarTurno(pacienteId, turnoId, "Motivo válido"))
                .rejects.toThrow(NotFoundError);
        });

        test('Debería lanzar ConflictError si el turno pertenece a otro paciente', async () => {
            const turnoDeOtroPaciente = {
                ...turnoDisponibleDB,
                estado: EstadoTurno.RESERVADO,
                paciente: otroPacienteEnTurno,
                historialEstados: []
            };

            mockPacienteRepository.obtenerPorId.mockResolvedValue(pacienteDB);
            mockTurnoService.obtenerTurnoConDetalles.mockResolvedValue(turnoDeOtroPaciente);

            await expect(pacienteService.cancelarTurno(pacienteId, turnoId, "Motivo válido"))
                .rejects.toThrow(ConflictError);
        });

        test('Debería lanzar ConflictError si el turno no está reservado ni confirmado', async () => {
            const turnoDisponible = {
                ...turnoDisponibleDB,
                estado: EstadoTurno.DISPONIBLE,
                paciente: pacienteEnTurno,
                historialEstados: []
            };

            mockPacienteRepository.obtenerPorId.mockResolvedValue(pacienteDB);
            mockTurnoService.obtenerTurnoConDetalles.mockResolvedValue(turnoDisponible);

            await expect(pacienteService.cancelarTurno(pacienteId, turnoId, "Motivo válido"))
                .rejects.toThrow(ConflictError);
        });

        test('Debería lanzar ConflictError si falta menos de 1 hora para el turno', async () => {
            const turnoProximo = {
                ...turnoDisponibleDB,
                estado: EstadoTurno.RESERVADO,
                paciente: pacienteEnTurno,
                fechaHora: new Date(Date.now() + 30 * 60 * 1000),
                historialEstados: []
            };

            mockPacienteRepository.obtenerPorId.mockResolvedValue(pacienteDB);
            mockTurnoService.obtenerTurnoConDetalles.mockResolvedValue(turnoProximo);

            await expect(pacienteService.cancelarTurno(pacienteId, turnoId, "Motivo válido"))
                .rejects.toThrow(ConflictError);
        });

    });

    describe('Solicitar Cambio de Fecha', () => {

        test('Debería solicitar un cambio de fecha correctamente', async () => {
            const nuevaFecha = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

            const turnoReservado = {
                ...turnoDisponibleDB,
                estado: EstadoTurno.RESERVADO,
                paciente: pacienteEnTurno,
                historialEstados: []
            };

            mockPacienteRepository.obtenerPorId.mockResolvedValue(pacienteDB);
            mockTurnoService.obtenerTurnoConDetalles.mockResolvedValue(turnoReservado);
            mockTurnoService.verificarDisponibilidadParaCambio.mockResolvedValue(true);

            const resultado = await pacienteService.solicitarCambioFecha(
                pacienteId,
                turnoId,
                nuevaFecha,
                "Motivo válido"
            );

            expect(resultado.estado).toBe(EstadoTurno.PENDIENTE_CONFIRMACION);
            expect(resultado.fechaPropuesta).toBe(nuevaFecha);
            expect(resultado.historialEstados[0].estado).toBe(EstadoTurno.PENDIENTE_CONFIRMACION);
            expect(mockTurnoService.actualizarTurno).toHaveBeenCalled();
            expect(mockNotificacionService.procesarNotificacionTurno).toHaveBeenCalled();
        });

        test('Debería lanzar BadRequestError si no se indica nueva fecha', async () => {
            await expect(pacienteService.solicitarCambioFecha(pacienteId, turnoId, null))
                .rejects.toThrow(BadRequestError);
        });

        test('Debería lanzar BadRequestError si la nueva fecha es pasada', async () => {
            const fechaPasada = new Date(Date.now() - 60 * 60 * 1000).toISOString();

            await expect(pacienteService.solicitarCambioFecha(pacienteId, turnoId, fechaPasada))
                .rejects.toThrow(BadRequestError);
        });

        test('Debería lanzar NotFoundError si el paciente no existe', async () => {
            const nuevaFecha = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

            mockPacienteRepository.obtenerPorId.mockResolvedValue(null);

            await expect(pacienteService.solicitarCambioFecha(pacienteId, turnoId, nuevaFecha, "Motivo válido"))
                .rejects.toThrow(NotFoundError);
        });

        test('Debería lanzar NotFoundError si el turno no existe', async () => {
            const nuevaFecha = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

            mockPacienteRepository.obtenerPorId.mockResolvedValue(pacienteDB);
            mockTurnoService.obtenerTurnoConDetalles.mockResolvedValue(null);

            await expect(pacienteService.solicitarCambioFecha(pacienteId, turnoId, nuevaFecha, "Motivo válido"))
                .rejects.toThrow(NotFoundError);
        });

        test('Debería lanzar ConflictError si el turno pertenece a otro paciente', async () => {
            const nuevaFecha = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

            const turnoDeOtroPaciente = {
                ...turnoDisponibleDB,
                estado: EstadoTurno.RESERVADO,
                paciente: otroPacienteEnTurno,
                historialEstados: []
            };

            mockPacienteRepository.obtenerPorId.mockResolvedValue(pacienteDB);
            mockTurnoService.obtenerTurnoConDetalles.mockResolvedValue(turnoDeOtroPaciente);

            await expect(pacienteService.solicitarCambioFecha(pacienteId, turnoId, nuevaFecha, "Motivo válido"))
                .rejects.toThrow(ConflictError);
        });

        test('Debería lanzar ConflictError si el turno no está reservado ni confirmado', async () => {
            const nuevaFecha = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

            const turnoDisponible = {
                ...turnoDisponibleDB,
                estado: EstadoTurno.DISPONIBLE,
                paciente: pacienteEnTurno,
                historialEstados: []
            };

            mockPacienteRepository.obtenerPorId.mockResolvedValue(pacienteDB);
            mockTurnoService.obtenerTurnoConDetalles.mockResolvedValue(turnoDisponible);

            await expect(pacienteService.solicitarCambioFecha(pacienteId, turnoId, nuevaFecha, "Motivo válido"))
                .rejects.toThrow(ConflictError);
        });

        test('Debería lanzar ConflictError si el horario propuesto está ocupado', async () => {
            const nuevaFecha = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

            const turnoReservado = {
                ...turnoDisponibleDB,
                estado: EstadoTurno.RESERVADO,
                paciente: pacienteEnTurno,
                historialEstados: []
            };

            mockPacienteRepository.obtenerPorId.mockResolvedValue(pacienteDB);
            mockTurnoService.obtenerTurnoConDetalles.mockResolvedValue(turnoReservado);
            mockTurnoService.verificarDisponibilidadParaCambio.mockResolvedValue(false);

            await expect(pacienteService.solicitarCambioFecha(pacienteId, turnoId, nuevaFecha, "Motivo válido"))
                .rejects.toThrow(ConflictError);
        });

    });
            
    describe('Historial de Turnos', () => {

        test('Debería obtener el historial de turnos del paciente', async () => {
            const historialMock = [
                {
                    _id: "turno-001",
                    estado: EstadoTurno.RESERVADO
                },
                {
                    _id: "turno-002",
                    estado: EstadoTurno.CANCELADO
                }
            ];

            mockPacienteRepository.obtenerPorId.mockResolvedValue(pacienteDB);
            mockTurnoService.obtenerHistorialTurnosPaciente.mockResolvedValue(historialMock);

            const resultado = await pacienteService.obtenerHistorialTurnos(pacienteId);

            expect(resultado).toEqual(historialMock);
            expect(mockTurnoService.obtenerHistorialTurnosPaciente).toHaveBeenCalledWith(pacienteId);
        });

        test('Debería lanzar BadRequestError si no se informa pacienteId', async () => {
            await expect(pacienteService.obtenerHistorialTurnos(null))
                .rejects.toThrow(BadRequestError);
        });

        test('Debería lanzar NotFoundError si el paciente no existe', async () => {
            mockPacienteRepository.obtenerPorId.mockResolvedValue(null);

            await expect(pacienteService.obtenerHistorialTurnos(pacienteId))
                .rejects.toThrow(NotFoundError);
        });

    });

    describe('Resolver Propuesta de Cambio', () => {

        test('Debería aceptar una propuesta de cambio de fecha', async () => {
            const fechaOriginal = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
            const fechaPropuesta = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

            const turnoPendiente = {
                ...turnoDisponibleDB,
                estado: EstadoTurno.PENDIENTE_CONFIRMACION,
                paciente: pacienteEnTurno,
                fechaHora: fechaOriginal,
                fechaPropuesta,
                cambioPropuestoPor: "MEDICO",
                historialEstados: []
            };

            mockPacienteRepository.obtenerPorId.mockResolvedValue(pacienteDB);
            mockTurnoService.obtenerTurnoConDetalles.mockResolvedValue(turnoPendiente);

            const resultado = await pacienteService.resolverPropuestaCambio(
                pacienteId,
                turnoId,
                true
            );

            expect(resultado.estado).toBe(EstadoTurno.RESERVADO);
            expect(resultado.fechaHora).toBe(fechaPropuesta);
            expect(resultado.fechaPropuesta).toBeNull();
            expect(resultado.historialEstados[0].motivo).toContain("aceptó");
            expect(mockTurnoService.actualizarTurno).toHaveBeenCalled();
            expect(mockNotificacionService.procesarNotificacionTurno).toHaveBeenCalled();
        });

        test('Debería rechazar una propuesta de cambio de fecha', async () => {
            const fechaOriginal = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
            const fechaPropuesta = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

            const turnoPendiente = {
                ...turnoDisponibleDB,
                estado: EstadoTurno.PENDIENTE_CONFIRMACION,
                paciente: pacienteEnTurno,
                fechaHora: fechaOriginal,
                fechaPropuesta,
                cambioPropuestoPor: "MEDICO",
                historialEstados: []
            };

            mockPacienteRepository.obtenerPorId.mockResolvedValue(pacienteDB);
            mockTurnoService.obtenerTurnoConDetalles.mockResolvedValue(turnoPendiente);

            const resultado = await pacienteService.resolverPropuestaCambio(
                pacienteId,
                turnoId,
                false
            );

            expect(resultado.estado).toBe(EstadoTurno.RESERVADO);
            expect(resultado.fechaHora).toBe(fechaOriginal);
            expect(resultado.fechaPropuesta).toBeNull();
            expect(resultado.historialEstados[0].motivo).toContain("rechazó");
            expect(mockNotificacionService.procesarNotificacionTurno).toHaveBeenCalled();
        });

        test('Debería lanzar NotFoundError si el paciente no existe', async () => {
            mockPacienteRepository.obtenerPorId.mockResolvedValue(null);

            await expect(pacienteService.resolverPropuestaCambio(pacienteId, turnoId, true))
                .rejects.toThrow(NotFoundError);
        });

        test('Debería lanzar NotFoundError si el turno no existe', async () => {
            mockPacienteRepository.obtenerPorId.mockResolvedValue(pacienteDB);
            mockTurnoService.obtenerTurnoConDetalles.mockResolvedValue(null);

            await expect(pacienteService.resolverPropuestaCambio(pacienteId, turnoId, true))
                .rejects.toThrow(NotFoundError);
        });

        test('Debería lanzar ConflictError si el turno pertenece a otro paciente', async () => {
            const turnoPendiente = {
                ...turnoDisponibleDB,
                estado: EstadoTurno.PENDIENTE_CONFIRMACION,
                paciente: otroPacienteEnTurno,
                fechaPropuesta: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
                historialEstados: []
            };

            mockPacienteRepository.obtenerPorId.mockResolvedValue(pacienteDB);
            mockTurnoService.obtenerTurnoConDetalles.mockResolvedValue(turnoPendiente);

            await expect(pacienteService.resolverPropuestaCambio(pacienteId, turnoId, true))
                .rejects.toThrow(ConflictError);
        });

        test('Debería lanzar ConflictError si el turno no tiene cambio pendiente', async () => {
            const turnoReservado = {
                ...turnoDisponibleDB,
                estado: EstadoTurno.RESERVADO,
                paciente: pacienteEnTurno,
                historialEstados: []
            };

            mockPacienteRepository.obtenerPorId.mockResolvedValue(pacienteDB);
            mockTurnoService.obtenerTurnoConDetalles.mockResolvedValue(turnoReservado);

            await expect(pacienteService.resolverPropuestaCambio(pacienteId, turnoId, true))
                .rejects.toThrow(ConflictError);
        });

    });



});
