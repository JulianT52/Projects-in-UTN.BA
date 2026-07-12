import { jest } from '@jest/globals';
import { NotificacionService } from '../../services/notificacionService.js';
import { UnprocessableEntityError } from '../../errors/errores.js'; 

describe('NotificacionService - Unit Tests', () => {
    let notificacionService;
    let mockNotificacionRepository;

    const usuarioId = "usr-123";
    const notificacionId = "notif-001";

    const notificacionDB = {
        _id: notificacionId,
        usuario: usuarioId,
        mensaje: "El turno turno-001 fue reservado por Lionel para Cardiología.",
        leida: false,
        createdAt: new Date()
    };

    beforeEach(() => {
        
        mockNotificacionRepository = {
            crear: jest.fn(),
            obtenerSinLeerUsuario: jest.fn(),
            obtenerLeidasUsuario: jest.fn(),
            obtenerPorId: jest.fn(),
            actualizarALeida: jest.fn()
        };

        notificacionService = new NotificacionService({
            notificacionRepository: mockNotificacionRepository
        });
    });

    describe('Obtención de Notificaciones', () => {
        
        test('Debería obtener la lista de notificaciones SIN LEER de un usuario', async () => {
            mockNotificacionRepository.obtenerSinLeerUsuario.mockResolvedValue([notificacionDB]);

            const resultado = await notificacionService.obtenerSinLeer(usuarioId);

            expect(resultado).toBeDefined();
            expect(resultado.length).toBe(1);
            expect(resultado[0].leida).toBe(false);
            expect(mockNotificacionRepository.obtenerSinLeerUsuario).toHaveBeenCalledWith(usuarioId);
        });

        test('Debería obtener la lista de notificaciones LEÍDAS de un usuario', async () => {
            const notificacionLeida = { ...notificacionDB, leida: true };
            mockNotificacionRepository.obtenerLeidasUsuario.mockResolvedValue([notificacionLeida]);

            const resultado = await notificacionService.obtenerLeidas(usuarioId);

            expect(resultado).toBeDefined();
            expect(resultado[0].leida).toBe(true);
            expect(mockNotificacionRepository.obtenerLeidasUsuario).toHaveBeenCalledWith(usuarioId);
        });
    });

    describe('Marcar como leída', () => {
        
        test('Debería marcar una notificación como leida correctamente', async () => {
            mockNotificacionRepository.obtenerPorId.mockResolvedValue(notificacionDB);
            
            const notificacionModificada = { ...notificacionDB, leida: true };
            mockNotificacionRepository.actualizarALeida.mockResolvedValue(notificacionModificada);

            const resultado = await notificacionService.marcarComoLeida(notificacionId);

            expect(resultado.leida).toBe(true);
            expect(mockNotificacionRepository.obtenerPorId).toHaveBeenCalledWith(notificacionId);
            expect(mockNotificacionRepository.actualizarALeida).toHaveBeenCalled();
        });

        test('Debería lanzar UnprocessableEntityError si la notificación a marcar no existe', async () => {
            mockNotificacionRepository.obtenerPorId.mockResolvedValue(null);

            await expect(notificacionService.marcarComoLeida("id-invalido"))
                .rejects.toThrow(UnprocessableEntityError);
            
            expect(mockNotificacionRepository.actualizarALeida).not.toHaveBeenCalled();
        });
    });
});