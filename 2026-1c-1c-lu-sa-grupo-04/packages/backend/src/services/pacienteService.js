import { UnprocessableEntityError, BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../errors/errores.js";
import { PacienteRepository } from "../repositories/PacienteRepository.js";
import { UsuarioService } from "./UsuarioService.js";
import { Paciente } from "../domain/paciente.js";
import { EstadoTurno } from "../domain/estadoTurno.js";

export class PacienteService {

    constructor({pacienteRepository, usuarioService, turnoService, notificacionService} = {}) {
        this.pacienteRepository = pacienteRepository;
        this.usuarioService = usuarioService;
        this.turnoService = turnoService;
        this.notificacionService = notificacionService;
    }

    async create(datos) {
        await this.validarDatosPaciente(datos);
        const dniExistente = await this.pacienteRepository.obtenerPorDni(datos.dni);
        if (dniExistente) {
            throw new ConflictError("Ya existe un paciente registrado con ese DNI");
        }

        const usuarioCreado = await this.usuarioService.create(datos.usuario);
        const paciente = new Paciente(usuarioCreado._id, datos.dni, datos.nombre, datos.apellido, datos.obraSocial, datos.plan);
        return await this.pacienteRepository.guardarPaciente(paciente);
    }

    async obtenerPerfil(pacienteId, usuarioAuth) {
        if (!pacienteId) {
            throw new BadRequestError("El identificador del paciente es obligatorio");
        }

        if (
            usuarioAuth?.rol === "PACIENTE" &&
            usuarioAuth.pacienteId?.toString() !== pacienteId.toString()
        ) {
            throw new UnauthorizedError("No tenés permiso para ver este perfil");
        }

        const perfil = await this.pacienteRepository.obtenerPerfilPorId(pacienteId);
        if (!perfil) {
            throw new NotFoundError("Paciente no encontrado");
        }

        return perfil;
    }

/*
-------------------------------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------TURNOS------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/
     async cancelarTurno(pacienteId, turnoId, motivo) {
        
        if (!motivo || typeof motivo !== 'string' || motivo.trim().length === 0) {
            throw new BadRequestError("Debe indicar un motivo para poder cancelar el turno.");
        }

        const paciente = await this.pacienteRepository.obtenerPorId(pacienteId);
        if (!paciente) {
            throw new NotFoundError("Paciente no encontrado");
        }

        const turno = await this.turnoService.obtenerTurnoConDetalles(turnoId);
        if (!turno) {
            throw new NotFoundError("Turno no encontrado");
        }

        const idPacienteTurno = turno.paciente._id;
        if (!idPacienteTurno || idPacienteTurno.toString() !== paciente._id.toString()) {
            throw new ConflictError("No tenés permiso para cancelar este turno porque no te pertenece.");
        }

        if (turno.estado !== EstadoTurno.RESERVADO) {
            throw new ConflictError(`El turno no se puede cancelar porque actualmente está: ${turno.estado}`);
        }

        const ahora = new Date();
        const fechaDelTurno = new Date(turno.fechaHora);
        
        const diferenciaEnMilisegundos = fechaDelTurno.getTime() - ahora.getTime();
        const diferenciaEnHoras = diferenciaEnMilisegundos / (1000 * 60 * 60);

        if (diferenciaEnHoras < 1) {
            throw new ConflictError("Las cancelaciones deben realizarse con al menos 1 hora de anticipación.");
        }

        turno.estado = EstadoTurno.CANCELADO;
        
        turno.historialEstados.push({
            estado: EstadoTurno.CANCELADO,
            usuario: paciente.usuario, 
            motivo: motivo
        });

        await this.notificarMedico(turno);
        
        return await this.turnoService.actualizarTurno(turno);
    }

    async solicitarCambioFecha(pacienteId, turnoId, nuevaFecha, motivo) {

        if (!nuevaFecha) {
            throw new BadRequestError("Se debe indicar la nueva fecha");
        }

        if (!motivo || typeof motivo !== 'string' || motivo.trim().length === 0) {
            throw new BadRequestError("Debe indicar un motivo para justificar la solicitud de cambio");
        }

        const nuevaFechaSolicitada = new Date(nuevaFecha);
        const ahora = new Date();

        if (nuevaFechaSolicitada < ahora) {
            throw new BadRequestError("La nueva fecha propuesta no puede ser anterior a la fecha actual");
        }

        const paciente = await this.pacienteRepository.obtenerPorId(pacienteId);
        if (!paciente) {
            throw new NotFoundError("Paciente no encontrado");
        }

        const turno = await this.turnoService.obtenerTurnoConDetalles(turnoId);
        if (!turno) {
            throw new NotFoundError("Turno no encontrado");
        }

        const idPacienteTurno = turno.paciente._id;
        if (!idPacienteTurno || idPacienteTurno.toString() !== pacienteId.toString()) {
            throw new ConflictError("No se puede modificar el turno de otro paciente");
        }

        if (turno.estado !== EstadoTurno.RESERVADO) {
            throw new ConflictError(`No podés proponer un cambio porque el turno actualmente está: ${turno.estado}`);
        }

        const fechaDelTurno = new Date(turno.fechaHora);
        const diferenciaEnHoras = (fechaDelTurno.getTime() - ahora.getTime()) / (1000 * 60 * 60);

        if (diferenciaEnHoras < 1) {
            throw new ConflictError("Las reprogramaciones deben solicitarse con al menos 1 hora de anticipación.");
        }

        const estaLibre = await this.turnoService.verificarDisponibilidadParaCambio(turno.medico, nuevaFechaSolicitada);
        if (!estaLibre) {
            throw new ConflictError("El horario propuesto ya se encuentra ocupado por otra persona");
        }

        turno.estado = EstadoTurno.PENDIENTE_CONFIRMACION;
        turno.fechaPropuesta = nuevaFecha;
        turno.cambioPropuestoPor = "PACIENTE";

        turno.historialEstados.push({
            estado: EstadoTurno.PENDIENTE_CONFIRMACION,
            usuario: paciente.usuario,
            motivo: motivo
        });

        await this.notificarMedico(turno);

        return await this.turnoService.actualizarTurno(turno);
    }

    async obtenerHistorialTurnos(pacienteId) {
        if (!pacienteId) {
            throw new BadRequestError("El ID del paciente es obligatorio para buscar su historial"); 
        }

        const paciente = await this.pacienteRepository.obtenerPorId(pacienteId);
        
        if (!paciente) {
            throw new NotFoundError("No se encontró ningún paciente con el ID proporcionado");
        }

        const historial = await this.turnoService.obtenerHistorialTurnosPaciente(pacienteId);

        return historial;
    }

    async resolverPropuestaCambio(pacienteId, turnoId, aceptaCambio) {
        
        const paciente = await this.pacienteRepository.obtenerPorId(pacienteId);
        if (!paciente) throw new NotFoundError("Paciente no encontrado");

        const turno = await this.turnoService.obtenerTurnoConDetalles(turnoId);
        if (!turno) throw new NotFoundError("Turno no encontrado");

        const idPacienteTurno = turno.paciente._id;
        if (!idPacienteTurno || idPacienteTurno.toString() !== pacienteId.toString()) {
            throw new ConflictError("Este turno no le pertenece a este paciente");
        }

        if (turno.estado !== EstadoTurno.PENDIENTE_CONFIRMACION) {
            throw new ConflictError("El turno no tiene un cambio de fecha pendiente");
        }

        if (turno.cambioPropuestoPor !== "MEDICO") {
            throw new ConflictError("No podés confirmar tu propia solicitud de cambio. Debe resolverla el médico.");
        }

        if (aceptaCambio === true) {
            turno.fechaHora = turno.fechaPropuesta;
            turno.estado = EstadoTurno.RESERVADO;

            turno.historialEstados.push({
                estado: EstadoTurno.RESERVADO,
                usuario: paciente.usuario,
                motivo: "El paciente aceptó la reprogramación propuesta por el médico"
            });
        } else {
            turno.estado = EstadoTurno.RESERVADO;
            turno.historialEstados.push({
                estado: EstadoTurno.RESERVADO,
                usuario: paciente.usuario,
                motivo: "El paciente rechazó la nueva fecha, se mantiene el horario original"
            });
        }

        turno.fechaPropuesta = null;
        turno.cambioPropuestoPor = null;

        await this.notificarMedico(turno);

        return await this.turnoService.actualizarTurno(turno);
    }


    async notificarMedico(turno) {
        const idDestinatario = turno.medico.usuario || turno.medico; 
        await this.notificacionService.procesarNotificacionTurno(turno, idDestinatario);
    }

/*
-------------------------------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------VALIDACIONES------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/    

    async validarDatosPaciente(datosPaciente) {
        if (!datosPaciente || typeof datosPaciente !== "object" || Array.isArray(datosPaciente)) {
            throw new BadRequestError("Los datos del paciente son inválidos");
        }

        const { nombre, apellido, dni, usuario, obraSocial, plan } = datosPaciente;

        if (!nombre || typeof nombre !== "string" || nombre.trim().length <= 0) {
            throw new UnprocessableEntityError("El nombre es inválido u obligatorio");
        }

        if (!apellido || typeof apellido !== "string" || apellido.trim().length <= 0) {
            throw new UnprocessableEntityError("El apellido es inválido u obligatorio");
        }

        if (!dni || typeof dni !== "string" || dni.trim().length <= 0) {
            throw new UnprocessableEntityError("El DNI es inválido u obligatorio");
        }

        if (!usuario) {
            throw new UnprocessableEntityError("Los datos de cuenta (usuario) son obligatorios");
        }

        if (plan && !obraSocial) {
            throw new UnprocessableEntityError("No se puede asignar un plan sin una obra social asociada");
        }
    }
}