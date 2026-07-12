import { jest } from '@jest/globals';
import { MedicoService } from '../../services/medicoService.js';
import { Medico } from '../../domain/medico.js';
import { Especialidad } from '../../domain/especialidad.js';
import { Practica } from '../../domain/practica.js';
import { DiaSemana } from '../../domain/diaSemana.js';
import { UnprocessableEntityError } from '../../errors/errores.js';
import { TurnoService } from '../../services/turnoService.js';

describe('MedicoService - Unit Tests', () => {
    let medicoService;
    let mockRepository;
    let mockUsuarioService;
    let mockTurnoService;
    let mockNotificacionService;
    let mockFactoryNotificacion;
    let mockEspecialidadesService;

    const medicoId = "69fcd7a658851878998e36e5";
    const mockUsuarioId = "user-123";

    const medicoDB = {
            _id: medicoId,
            usuario: {
                "nombre": "user-123",
                "password": "123capo"
            },
            matricula: "MN-123",
            nombre: "Juan",
            apellido: "Perez",
            especialidades: [],
            practicas: [],
            toObject: function() { return this; }
        };

    beforeEach(() => {
        mockRepository = {
            guardarMedico: jest.fn(),
            obtenerPorId: jest.fn(),
            obtenerPorUsuarioId: jest.fn(),
            guardarDisponibilidades: jest.fn()
        };

        mockUsuarioService = {
            create: jest.fn().mockResolvedValue({ _id: mockUsuarioId })
        };

        mockTurnoService = {}

        mockFactoryNotificacion = {
            crearSegunEstadoTurno: jest.fn().mockReturnValue({
                mensaje: "Notificación generada: El estado del turno ha sido actualizado." 
            })
        };

        mockNotificacionService = {
            create: jest.fn().mockResolvedValue(true)
        };

        mockEspecialidadesService = {
            guardarEspecialidad: jest.fn().mockResolvedValue(null)
        };

        medicoService = new MedicoService({
            medicoRepository: mockRepository,
            turnoService: mockTurnoService,
            usuarioService: mockUsuarioService,
            especialidadesService: mockEspecialidadesService
        });
    });

    describe('Alta de Médico (create)', () => {
        test('Debería crear un médico correctamente si los datos son válidos', async () => {
            const datosInput = {
                nombre: "Juan",
                apellido: "Perez",
                matricula: "MN-123",
                usuario: 
                { nombre: "juan", contraseña: "123" }
            };

            mockRepository.obtenerPorUsuarioId.mockResolvedValue(datosInput);
            mockRepository.guardarMedico.mockImplementation(m => Promise.resolve(m));

            const resultado = await medicoService.create(medicoDB);

            expect(resultado).toBeDefined();
            expect(mockUsuarioService.create).toHaveBeenCalled();
            expect(mockRepository.guardarMedico).toHaveBeenCalled();
        });
    });

    describe('Gestión de Servicios', () => {
        test('Debería agregar una especialidad correctamente', async () => {
            mockRepository.obtenerPorId.mockResolvedValue(medicoDB);
            mockRepository.guardarMedico.mockImplementation(m => Promise.resolve(m));

            const datosServicio = { nombre: "Infectología", duracionTurnoEnMins: 45, costoConsulta: 6000 };
            const resultado = await medicoService.agregarEspecialidad(medicoId, datosServicio);

            expect(resultado.especialidades).toHaveLength(1);
            expect(resultado.especialidades[0].nombre).toBe("Infectología");
        });

        test('Debería lanzar error si el médico ya tiene la especialidad', async () => {
            const medicoConEspecialidad = {
                ...medicoDB,
                especialidades: [{ nombre: "Cardiología", id: "uuid-999" }]
            };
            mockRepository.obtenerPorId.mockResolvedValue(medicoConEspecialidad);

            const datosDuplicados = { nombre: "Cardiología" };

            await expect(medicoService.agregarEspecialidad(medicoId, datosDuplicados))
                .rejects.toThrow(/ya tiene asignada esta especialidad/);
            });
        });

        test('Debería guardar disponibilidades si el formato es correcto', async () => {
            const diaValido = Object.values(DiaSemana)[0];
            const datosDispo = [
                {
                    diaSemana: diaValido,
                    horaDesde: "08:00",
                    horaHasta: "12:00",
                    sede: "69fcd7a658851878998e3700"
                }
            ];

            mockRepository.obtenerPorId.mockResolvedValue(medicoDB);

            mockRepository.guardarMedico.mockImplementation(medico => Promise.resolve(medico));

            const resultado = await medicoService.definirDisponibilidad(medicoId, datosDispo);

            expect(mockRepository.guardarMedico).toHaveBeenCalled();
            expect(resultado).toBeDefined();
            expect(resultado.disponibilidades).toHaveLength(1);
        
            expect(resultado.disponibilidades[0].horaDesde)
                .toBe("08:00");

            expect(resultado.disponibilidades[0].horaHasta)
                .toBe("12:00");

            expect(resultado.disponibilidades[0].diaSemana)
                .toBe(diaValido);
        });

        test('Debería fusionar disponibilidades existentes', async () => {

            const medicoConDisponibilidad = {...medicoDB,
            disponibilidades: [
                {
                    diaSemana: "LUNES",
                    horaDesde: "08:00",
                    horaHasta: "12:00",
                    sede: "69fcd7a658851878998e3700"
                }
            ]
            };

            mockRepository.obtenerPorId.mockResolvedValue(medicoConDisponibilidad);
            mockRepository.guardarMedico.mockImplementation(medico => Promise.resolve(medico));

            const nuevasDisponibilidades = [
            {
                diaSemana: "LUNES",
                horaDesde: "09:00",
                horaHasta: "13:00",
                sede: "69fcd7a658851878998e3700"
            }
            ];

            const resultado = await medicoService.definirDisponibilidad(medicoId, nuevasDisponibilidades);

            expect(resultado.disponibilidades).toHaveLength(1);

            expect(resultado.disponibilidades[0].horaDesde)
                .toBe("08:00");

            expect(resultado.disponibilidades[0].horaHasta)
                .toBe("13:00");
        });

        test('Debería eliminar una disponibilidad', async () => {

            const medicoConDisponibilidad = {...medicoDB,
                disponibilidades: [
                    {
                        diaSemana: "LUNES",
                        horaDesde: "08:00",
                        horaHasta: "12:00",
                        sede: "69fcd7a658851878998e3700"
                    }
                ]
            };

            mockRepository.obtenerPorId.mockResolvedValue(medicoConDisponibilidad);

            mockRepository.guardarMedico.mockImplementation(medico => Promise.resolve(medico));

            const resultado = await medicoService.eliminarDisponibilidad(
                medicoId,
                    {
                        diaSemana: "LUNES",
                        horaDesde: "08:00",
                        horaHasta: "12:00",
                        sede: "69fcd7a658851878998e3700"
                    }
            );

            expect(resultado.disponibilidades)
                .toHaveLength(0);
        });

        test('Debería fallar si el formato de hora es inválido (Regex)', () => {
            const diaValido = Object.values(DiaSemana)[0];
            const datosInvalidos = [
                { diaSemana: diaValido, horaDesde: "8:00", horaHasta: "99:99" }
            ];

            expect(() => medicoService.definirDisponibilidad(medicoId, datosInvalidos))
                .rejects.toThrow(UnprocessableEntityError);
        });

    describe('Baja y Modificación de Servicios', () => {
        const medicoConDatos = {
            _id: medicoId,
            usuario: {
                "nombre": "user-123",
                "password": "123capo"
            },
            matricula: "MN-123",
            nombre: "Gregory",
            apellido: "House",
            especialidades: [{ id: "esp-123", nombre: "Infectología" }],
            practicas: [],
            toObject: function() { return this; }
        };

        test('Debería actualizar el nombre de una especialidad', async () => {
            mockRepository.obtenerPorId.mockResolvedValue(medicoConDatos);
            mockRepository.guardarMedico.mockImplementation(m => Promise.resolve(m));

            const nuevosDatos = { nombre: "Cardiología" };
            const resultado = await medicoService.modificarEspecialidad(medicoId, "esp-123", nuevosDatos);

            expect(resultado.especialidades[0].nombre).toBe("Cardiología");
        });

        test('Debería quitar una especialidad correctamente', async () => {
            mockRepository.obtenerPorId.mockResolvedValue(medicoConDatos);
            mockRepository.guardarMedico.mockImplementation(m => Promise.resolve(m));

            const resultado = await medicoService.quitarEspecialidad(medicoId, "esp-123");

            expect(resultado.especialidades).toHaveLength(0);
        });
    });



}); 