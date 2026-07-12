import express from "express"
import mongoose from "mongoose";
import { UnprocessableEntityError, BadRequestError, ConflictError, NotFoundError } from "../errors/errores.js";
import { Medico } from "../domain/medico.js";
import { DiaSemana, OrdenDiaSemana } from "../domain/diaSemana.js";
import { Especialidad } from "../domain/especialidad.js";
import { Practica } from "../domain/practica.js";
import { DisponibilidadHoraria } from "../domain/disponibilidadHoraria.js";
import { EstadoTurno } from "../domain/estadoTurno.js";


export class MedicoService {
    constructor({
        medicoRepository, usuarioService, turnoService, turnoRepository, servicioRepository, notificacionService, especialidadesService
    } = {}) {
        this.medicoRepository = medicoRepository;
        this.usuarioService = usuarioService;
        this.turnoService = turnoService;
        this.turnoRepository = turnoRepository;
        this.servicioRepository = servicioRepository;
        this.notificacionService = notificacionService; 
        this.especialidadesService = especialidadesService;
    }

/*
-------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------MEDICOS--------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

   async create(datos) {
    await this.validarDatosMedico(datos);
    const usuarioCreado = await this.usuarioService.create(datos.usuario);
    
    const medico = new Medico(usuarioCreado._id, datos.matricula, datos.nombre, datos.apellido);
    
    medico.especialidades = datos.especialidades || [];
    medico.sedes = datos.sedes || [];
    
    return await this.medicoRepository.guardarMedico(medico);
}

    async buscarPorNombre(nombre) {
        if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
            return await this.medicoRepository.findAll();
        }
        return await this.medicoRepository.buscarPorNombreOApellido(nombre.trim());
    }

/*
-------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------TURNOS---------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/
    async cancelarTurno(medicoId, turnoId, motivo) {
        
        if (!motivo || typeof motivo !== 'string' || motivo.trim().length === 0) {
            throw new BadRequestError("Debe indicar un motivo para poder cancelar el turno");
        }

        const medicoDoc = await this.medicoRepository.obtenerPorId(medicoId);
        if (!medicoDoc) {
            throw new NotFoundError("Médico no encontrado");
        }
        const medico = this.convertirMedicoSchemaAObjeto(medicoDoc);

        const turno = await this.turnoService.obtenerTurnoConDetalles(turnoId);
        if (!turno) {
            throw new NotFoundError("Turno no encontrado");
        }
        
        const idMedicoTurno = turno.medico?._id;
        if (idMedicoTurno.toString() !== medicoId.toString()) {
            throw new ConflictError("No tenés permiso para cancelar este turno");
        }

        if (turno.estado !== EstadoTurno.RESERVADO) {
            throw new ConflictError(`El turno no se puede cancelar porque actualmente está: ${turno.estado}`);
        }

        const ahora = new Date();
        const fechaDelTurno = new Date(turno.fechaHora);
        const diferenciaEnMilisegundos = fechaDelTurno.getTime() - ahora.getTime();
        const diferenciaEnHoras = diferenciaEnMilisegundos / (1000 * 60 * 60);

        if (diferenciaEnHoras < 1) {
            throw new ConflictError("Las cancelaciones deben realizarse con al menos 1 hora de anticipación");
        }

        turno.estado = EstadoTurno.CANCELADO;
        turno.historialEstados.push({
            estado: EstadoTurno.CANCELADO,
            usuario: medico.usuario, 
            motivo: motivo
        });

        await this.notificarPaciente(turno);

        return await this.turnoService.actualizarTurno(turno); 
    }

    async proponerModificacionFecha(medicoId, turnoId, nuevaFecha, motivo) {
        
        if (!nuevaFecha) {
            throw new BadRequestError("Se debe indicar la nueva fecha propuesta");
        }

        if (!motivo || typeof motivo !== 'string' || motivo.trim().length === 0) {
            throw new BadRequestError("Debe indicar un motivo para justificar la reprogramación al paciente");
        }

        const nuevaFechaSolicitada = new Date(nuevaFecha);
        const ahora = new Date();
        if (nuevaFechaSolicitada < ahora) {
            throw new BadRequestError("La nueva fecha propuesta no puede ser anterior a la fecha actual");
        }

        const medicoDoc = await this.medicoRepository.obtenerPorId(medicoId);
        if (!medicoDoc) throw new NotFoundError("Médico no encontrado");

        const medico = this.convertirMedicoSchemaAObjeto(medicoDoc);

        const turno = await this.turnoService.obtenerTurnoConDetalles(turnoId);
        if (!turno) throw new NotFoundError("Turno no encontrado");

        const idMedicoTurno = turno.medico?._id;
        if (idMedicoTurno.toString() !== medicoId.toString()) {
            throw new ConflictError("No tenés permiso para modificar este turno");
        }

        if (turno.estado !== EstadoTurno.RESERVADO) {
            throw new ConflictError(`No podés proponer un cambio porque el turno actualmente está: ${turno.estado}`);
        }

        const estaLibre = await this.turnoService.verificarDisponibilidadParaCambio(medicoId, nuevaFechaSolicitada);
        if (!estaLibre) {
            throw new ConflictError("Ya tenés un turno reservado o pendiente en ese horario propuesto");
        }

        turno.estado = EstadoTurno.PENDIENTE_CONFIRMACION;
        turno.fechaPropuesta = nuevaFecha;
        turno.cambioPropuestoPor = "MEDICO";
        turno.historialEstados.push({
            estado: EstadoTurno.PENDIENTE_CONFIRMACION,
            usuario: medico.usuario,
            motivo: motivo
        });

        await this.notificarPaciente(turno);
        
        return await this.turnoService.actualizarTurno(turno);
    }

    async obtenerHistorialPaciente(medicoId, pacienteId) {
        if (!medicoId || !pacienteId) {
            throw new BadRequestError("Los IDs del médico y del paciente son obligatorios");
        }

        const medicoDoc = await this.medicoRepository.obtenerPorId(medicoId);
        if (!medicoDoc) {
            throw new NotFoundError("Médico no encontrado");
        }

        const historial = await this.turnoService.obtenerHistorialTurnosPaciente(pacienteId);

        if (!historial || historial.length === 0) {
             throw new NotFoundError("No se encontraron turnos para este paciente");
        }

        return historial;
    }

    async obtenerTurnosDelMedico(medicoId) {
        if (!medicoId) {
            throw new BadRequestError("El ID del médico es obligatorio");
        }
        const medicoDoc = await this.medicoRepository.obtenerPorId(medicoId);
        if (!medicoDoc) {
            throw new NotFoundError("Médico no encontrado");
        }
        return await this.turnoRepository.obtenerTurnosPorMedico(medicoId);
    }

    async obtenerPacientesDelMedico(medicoId) {
    if (!medicoId) {
        throw new BadRequestError("El ID del médico es obligatorio");
    }
        return await this.turnoService.obtenerPacientesPorMedico(medicoId);
    }

    async resolverSolicitudCambio(medicoId, turnoId, aceptaCambio) {

        const doc = await this.medicoRepository.obtenerPorId(medicoId);
        if (!doc) throw new NotFoundError("Médico no encontrado");
        
        const medico = this.convertirMedicoSchemaAObjeto(doc);

        const turno = await this.turnoService.obtenerTurnoConDetalles(turnoId);
        if (!turno) throw new NotFoundError("Turno no encontrado");

        const idMedicoTurno = turno.medico?._id;
        if (idMedicoTurno.toString() !== medicoId.toString()) {
            throw new ConflictError("Este turno no le pertenece a este médico");
        }

        if (turno.estado !== EstadoTurno.PENDIENTE_CONFIRMACION) {
            throw new ConflictError("El turno no tiene un cambio de fecha pendiente");
        }

        if (turno.cambioPropuestoPor !== "PACIENTE") {
            throw new ConflictError("No podés confirmar tu propia propuesta de cambio. Debe resolverla el paciente.");
        }

        if (aceptaCambio === true) {
            turno.fechaHora = turno.fechaPropuesta;
            turno.estado = EstadoTurno.RESERVADO;

            turno.historialEstados.push({
                estado: EstadoTurno.RESERVADO,
                usuario: medico.usuarioId,
                motivo: "El médico aceptó la reprogramación del turno"
            });
        } else {
            turno.estado = EstadoTurno.RESERVADO; 
            
            turno.historialEstados.push({
                estado: EstadoTurno.RESERVADO,
                usuario: medico.usuarioId,
                motivo: "El médico rechazó la nueva fecha propuesta"
            });
        }

        turno.fechaPropuesta = null;
        turno.cambioPropuestoPor = null;

        await this.notificarPaciente(turno);

        return await this.turnoService.actualizarTurno(turno);
    }

    async marcarTurnoRealizado(medicoId, turnoId) {

        const medicoDoc = await this.medicoRepository.obtenerPorId(medicoId);
        if (!medicoDoc) throw new NotFoundError("Médico no encontrado");

        const medico = this.convertirMedicoSchemaAObjeto(medicoDoc);

        const turno = await this.turnoService.obtenerPorId(turnoId);
        if (!turno) throw new NotFoundError("Turno no encontrado");

        if (turno.medico.toString() !== medicoId.toString()) {
            throw new ConflictError("No tenés permiso para modificar este turno porque no te pertenece");
        }

        if (turno.estado !== EstadoTurno.RESERVADO) {
            throw new ConflictError(`Solo se puede marcar como realizado un turno confirmado. Estado actual: ${turno.estado}`);
        }

        turno.estado = EstadoTurno.REALIZADO;
        turno.historialEstados.push({
            estado: EstadoTurno.REALIZADO,
            usuario: medico.usuario,
            motivo: "El turno fue realizado con éxito"
        });

        return await this.turnoService.actualizarTurno(turno);
    }

/*
-------------------------------------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------DISPONIBILIDADES---------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

    async definirDisponibilidad(id, datosDisponibilidades) {
        return await this.actualizarDisponibilidad(id, datosDisponibilidades)
    }

    async actualizarDisponibilidad(id, datosDisponibilidades) {
        datosDisponibilidades.forEach((disponibilidad, index) => {
            this.validarDatosDisponibilidad(disponibilidad, index)
        })

        const medicoDoc = await this.medicoRepository.obtenerPorId(id)

        if (!medicoDoc) {
            throw new BadRequestError("Médico no encontrado")
        }

        const medico = this.convertirMedicoSchemaAObjeto(medicoDoc)

        const disponibilidadesActuales = medico.disponibilidades || []

        const disponibilidadesNuevas = datosDisponibilidades.map((disponibilidad) => {
            return new DisponibilidadHoraria(
                disponibilidad.diaSemana,
                disponibilidad.horaDesde,
                disponibilidad.horaHasta,
                disponibilidad.sede
            )
        })

        this.validarSinSuperposicionEntreSedes(disponibilidadesActuales, disponibilidadesNuevas)

        const disponibilidadesNormalizadas = this.normalizarDisponibilidades([
            ...disponibilidadesActuales,
            ...disponibilidadesNuevas
        ])

        medico.disponibilidades = disponibilidadesNormalizadas
        medico._id = medicoDoc._id

        const medicoActualizado = await this.medicoRepository.guardarMedico(medico)

        return medicoActualizado
    }

    async eliminarDisponibilidad(id, disponibilidad) {
        this.validarDatosDisponibilidad(disponibilidad, 0)

        const medicoDoc = await this.medicoRepository.obtenerPorId(id)

        if (!medicoDoc) {
            throw new BadRequestError("Médico no encontrado")
        }

        const medico = this.convertirMedicoSchemaAObjeto(medicoDoc)

        const disponibilidadesActuales = medico.disponibilidades || []

        const disponibilidadesActualizadas = this.restarDisponibilidad(
            disponibilidadesActuales,
            disponibilidad
        )

        medico.disponibilidades = disponibilidadesActualizadas
        medico._id = medicoDoc._id

        const medicoActualizado = await this.medicoRepository.guardarMedico(medico)

        // await this.turnoService.eliminarTurnosDisponiblesPorDisponibilidad(id, disponibilidad)

        return medicoActualizado
    }

    async findAll(idMedico, idServicio){
        const medicoDoc = await this.medicoRepository.obtenerPorId(idMedico);
            if (!medicoDoc) {
                throw new BadRequestError("Médico no encontrado");
            }

        const medico = this.convertirMedicoSchemaAObjeto(medicoDoc);

            if(!medico.especialidades.includes(idServicio)){
                throw new BadRequestError("Servicio no encontrado")
            }

        const servicio = await this.servicioRepository.obtenerPorId(idServicio)
            if (!servicio){
                throw new BadRequestError("Servicio no encontrado")
            }

        const disponibilidades = await this.turnoRepository.obtenerTurnosDisponibles(idMedico)
            if(disponibilidades.length <= 0){
                throw new NotFoundError("No se encontraron disponibilidades")
            }

        const cantTurnos = Math.ceil(servicio.duracionTurnoEnMins / 30)
        const turnosDisponibles = this.obtenerTurnosConsecutivos(disponibilidades,cantTurnos)

        return turnosDisponibles
    }


/*
-------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------SERVICIOS------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/
    convertirMedicoSchemaAObjeto(medicoDoc) {
        const data = medicoDoc.toObject ? medicoDoc.toObject() : medicoDoc;
        const medico = new Medico(data.usuario, data.matricula, data.nombre, data.apellido);
        Object.assign(medico, data);
        medico._id = medicoDoc._id;
        return medico;
    }

    async obtenerServicios(idMedico) {
    if (!idMedico) {
        throw new BadRequestError("El ID del médico es obligatorio");
    }

    const medicoDoc = await this.medicoRepository.obtenerPorId(idMedico);

    if (!medicoDoc) {
        throw new BadRequestError("Médico no encontrado");
    }

    return {
        _id: medicoDoc._id,
        nombre: medicoDoc.nombre,
        apellido: medicoDoc.apellido,
        matricula: medicoDoc.matricula,
        especialidades: medicoDoc.especialidades || []
    };
    }

    async agregarEspecialidad(idMedico, datos) {
    const medicoDoc = await this.medicoRepository.obtenerPorId(idMedico);
    if (!medicoDoc)
        throw new BadRequestError("Médico no encontrado");
    const medico = this.convertirMedicoSchemaAObjeto(medicoDoc);

    const normalizar = (str) =>
        str.trim().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

    const yaTieneEspecialidad = medico.especialidades.some(
        esp => normalizar(esp.nombre) === normalizar(datos.nombre)
    );

    if (yaTieneEspecialidad) {
        throw new ConflictError("El médico ya tiene asignada esta especialidad");
    }

    const nuevaEspecialidad = new Especialidad(
        datos.nombre,
        datos.practicas == null ? [] : datos.practicas
    );

    const especialidadCatalogo = await this.especialidadesService.guardarEspecialidad(nuevaEspecialidad);

    nuevaEspecialidad._id = especialidadCatalogo ? especialidadCatalogo._id : new mongoose.Types.ObjectId();
    if (especialidadCatalogo) {
        nuevaEspecialidad.nombre = especialidadCatalogo.nombre;
    }

    medico.agregarEspecialidad(nuevaEspecialidad);
    medico._id = medicoDoc._id;

    return await this.medicoRepository.guardarMedico(medico);
}

    async modificarEspecialidad(idMedico, idEspecialidad, nuevosDatos) {
        const medicoDoc = await this.medicoRepository.obtenerPorId(idMedico);
        if (!medicoDoc) throw new BadRequestError("Médico no encontrado");
        const medico = this.convertirMedicoSchemaAObjeto(medicoDoc);

        medico.modificarEspecialidad(idEspecialidad, nuevosDatos);
        
        medico._id = medicoDoc._id;
        return await this.medicoRepository.guardarMedico(medico);
    }

    async quitarEspecialidad(idMedico, idEspecialidad) {
        const medicoDoc = await this.medicoRepository.obtenerPorId(idMedico);
        if (!medicoDoc) throw new BadRequestError("Médico no encontrado");
        const medico = this.convertirMedicoSchemaAObjeto(medicoDoc);

        medico.quitarEspecialidad(idEspecialidad);
        
        medico._id = medicoDoc._id;
        return await this.medicoRepository.guardarMedico(medico);
    }

    async agregarPractica(idMedico, idEspecialidad, datos) {
        const medicoDoc = await this.medicoRepository.obtenerPorId(idMedico);
        if (!medicoDoc)     
            throw new BadRequestError("Médico no encontrado");
        const medico = this.convertirMedicoSchemaAObjeto(medicoDoc);

        const nuevaPractica = new Practica(
                datos.codigo,    
                datos.nombre,
                datos.duracionEnMins, 
                datos.costo,
                idEspecialidad
        );
        nuevaPractica._id = new mongoose.Types.ObjectId();
        medico.agregarPractica(nuevaPractica);
        medico._id = medicoDoc._id;
        return await this.medicoRepository.guardarMedico(medico);
    }

    async modificarPractica(idMedico, idEspecialidad, idPractica, nuevosDatos) {
        const medicoDoc = await this.medicoRepository.obtenerPorId(idMedico);
        if (!medicoDoc) throw new BadRequestError("Médico no encontrado");
        const medico = this.convertirMedicoSchemaAObjeto(medicoDoc);

        medico.modificarPractica(idEspecialidad, idPractica, nuevosDatos);
        
        medico._id = medicoDoc._id;
        return await this.medicoRepository.guardarMedico(medico);
    }

    async quitarPractica(idMedico, idEspecialidad, idPractica) {
        const medicoDoc = await this.medicoRepository.obtenerPorId(idMedico);
        if (!medicoDoc) throw new BadRequestError("Médico no encontrado");
        const medico = this.convertirMedicoSchemaAObjeto(medicoDoc);

        medico.quitarPractica(idEspecialidad, idPractica);
        
        medico._id = medicoDoc._id;
        return await this.medicoRepository.guardarMedico(medico);
    }

/*
-------------------------------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------VALIDACIONES------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

    async validarDatosMedico(datosMedico){
        if (!datosMedico || typeof datosMedico !== "object" || Array.isArray(datosMedico)) {
            throw new BadRequestError("Los datos del medico son inválidos")
        }

        const { nombre, apellido, usuario, matricula } = datosMedico

        if(!nombre || typeof nombre !== "string" || nombre.trim().length <= 0 ){
            throw new UnprocessableEntityError("El nombre es invalido")
        }

        if(!apellido || typeof apellido !== "string" || apellido.trim().length <= 0 ){
            throw new UnprocessableEntityError("El apellido es invalido")
        }

        if(!usuario){
            throw new UnprocessableEntityError("El usuario es invalido")
        }

        if(!matricula || typeof matricula !== "string" || matricula.trim().length <= 0 ){
            throw new UnprocessableEntityError("La matricula es invalida")
        }
    }

    validarDatosDisponibilidad(disponibilidad, index) {
        if (!disponibilidad || typeof disponibilidad !== "object" || Array.isArray(disponibilidad)) {
            throw new BadRequestError(`La disponibilidad en posición ${index} es inválida`);
        }

        const REGEX_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;
        const { diaSemana, horaDesde, horaHasta } = disponibilidad;

        if (!Object.values(DiaSemana).includes(diaSemana)) {
            throw new UnprocessableEntityError(`El diaSemana no existe en la posicion ${index}`);
        }

        if (!REGEX_HORA.test(horaDesde)) {
            throw new UnprocessableEntityError(`La horaDesde debe tener un formato HH:MM en posición ${index}`);
        }

        if (!REGEX_HORA.test(horaHasta)) {
            throw new UnprocessableEntityError(`La horaHasta debe tener un formato HH:MM en posición ${index}`);
        }

        if (this.horaAMinutos(horaDesde) >= this.horaAMinutos(horaHasta)) {
            throw new UnprocessableEntityError(`La horaDesde debe ser anterior a horaHasta en posición ${index}`);
        }

        if (!disponibilidad.sede) {
            throw new UnprocessableEntityError(`La sede es obligatoria en posición ${index}`);
        }
    }

    validarSinSuperposicionEntreSedes(disponibilidadesActuales, disponibilidadesNuevas) {
        const yaCargadas = disponibilidadesActuales.map(d => this.disponibilidadPlano(d))

        disponibilidadesNuevas.forEach((nueva) => {
            const conflicto = yaCargadas.find((existente) =>
                existente.diaSemana === nueva.diaSemana &&
                existente.sede !== nueva.sede &&
                this.horaAMinutos(nueva.horaDesde) < this.horaAMinutos(existente.horaHasta) &&
                this.horaAMinutos(existente.horaDesde) < this.horaAMinutos(nueva.horaHasta)
            )

            if (conflicto) {
                throw new UnprocessableEntityError(
                    `El médico ya tiene disponibilidad el ${nueva.diaSemana} de ${conflicto.horaDesde} a ${conflicto.horaHasta} en otra sede — no puede atender en dos sedes a la vez`
                )
            }

            yaCargadas.push(this.disponibilidadPlano(nueva))
        })
    }


/*
-------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------FUNCIONES------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

    disponibilidadPlano(disponibilidad) {
        return {
            diaSemana: disponibilidad.diaSemana,
            horaDesde: disponibilidad.horaDesde,
            horaHasta: disponibilidad.horaHasta,
            sede: disponibilidad.sede?.toString()
        }
    }

    horaAMinutos(hora) {
        const [horas, minutos] = hora.split(":").map(Number)
        return horas * 60 + minutos
    }

    minutosAHora(minutosTotales) {
        const horas = Math.floor(minutosTotales / 60)
        const minutos = minutosTotales % 60

        return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`
    }
        
    // Deja las disponibilidades ordenadas por dia, sede y hora (agrupa por sede
    // para que la unificación de franjas adyacentes solo compare bloques de la misma sede)
    ordenarDisponibilidades(disponibilidades) {
        return disponibilidades
            .map(disponibilidad => this.disponibilidadPlano(disponibilidad))
            .sort((a, b) => {
                if (OrdenDiaSemana[a.diaSemana] !== OrdenDiaSemana[b.diaSemana]) {
                    return OrdenDiaSemana[a.diaSemana] - OrdenDiaSemana[b.diaSemana]
                }

                if (a.sede !== b.sede) {
                    return a.sede < b.sede ? -1 : 1
                }

                return this.horaAMinutos(a.horaDesde) - this.horaAMinutos(b.horaDesde)
            })
    }

    // Une disponibilidades que se pisan o son consecutivas
    normalizarDisponibilidades(disponibilidades) {
        const disponibilidadesOrdenadas = this.ordenarDisponibilidades(disponibilidades)
        const disponibilidadesNormalizadas = []

        disponibilidadesOrdenadas.forEach(disponibilidad => {
            const ultima = disponibilidadesNormalizadas[disponibilidadesNormalizadas.length - 1]

            const sePuedeUnificar =
                ultima &&
                ultima.diaSemana === disponibilidad.diaSemana &&
                ultima.sede === disponibilidad.sede &&
                this.horaAMinutos(disponibilidad.horaDesde) <= this.horaAMinutos(ultima.horaHasta)

            if (sePuedeUnificar) {
                const horaHastaMayor = Math.max(
                    this.horaAMinutos(ultima.horaHasta),
                    this.horaAMinutos(disponibilidad.horaHasta)
                )

                ultima.horaHasta = this.minutosAHora(horaHastaMayor)
            } else {
                disponibilidadesNormalizadas.push({ ...disponibilidad })
            }
        })

        return disponibilidadesNormalizadas.map(disponibilidad => {
            return new DisponibilidadHoraria(
                disponibilidad.diaSemana,
                disponibilidad.horaDesde,
                disponibilidad.horaHasta,
                disponibilidad.sede
            )
        })
    }

    restarDisponibilidad(disponibilidadesActuales, disponibilidadABorrar) {
        const disponibilidadBorrada = this.disponibilidadPlano(disponibilidadABorrar)

        const inicioBorrado = this.horaAMinutos(disponibilidadBorrada.horaDesde)
        const finBorrado = this.horaAMinutos(disponibilidadBorrada.horaHasta)

        const disponibilidadesRestantes = []

        disponibilidadesActuales.forEach(disponibilidadActual => {
            const actual = this.disponibilidadPlano(disponibilidadActual)

            if (actual.diaSemana !== disponibilidadBorrada.diaSemana || actual.sede !== disponibilidadBorrada.sede) {
                disponibilidadesRestantes.push(actual)
                return
            }

            const inicioActual = this.horaAMinutos(actual.horaDesde)
            const finActual = this.horaAMinutos(actual.horaHasta)

            const noSeSuperponen =
                finBorrado <= inicioActual ||
                inicioBorrado >= finActual

            if (noSeSuperponen) {
                disponibilidadesRestantes.push(actual)
                return
            }

            if (inicioBorrado > inicioActual) {
                disponibilidadesRestantes.push({
                    diaSemana: actual.diaSemana,
                    horaDesde: actual.horaDesde,
                    horaHasta: this.minutosAHora(inicioBorrado),
                    sede: actual.sede
                })
            }

            if (finBorrado < finActual) {
                disponibilidadesRestantes.push({
                    diaSemana: actual.diaSemana,
                    horaDesde: this.minutosAHora(finBorrado),
                    horaHasta: actual.horaHasta,
                    sede: actual.sede
                })
            }
        })

        return this.normalizarDisponibilidades(disponibilidadesRestantes)
    }

    obtenerBloquesConsecutivos(turnosDisponibles, slotsNecesarios){
        const turnos = []
        for (let i = 0; i <= turnosDisponibles.length - slotsNecesarios; i++){
            let turnoValido = true
                for (let j = 0; j < slotsNecesarios - 1; j++){
                    const actual = turnosDisponibles[i + j]
                    const siguiente = turnosDisponibles[i + j + 1]          
                    const diferencia = (siguiente.fechaHora - actual.fechaHora) / (1000 * 60)

                    if (diferencia !== 30){
                        turnoValido = false
                        break;
                    }
                }
            if (turnoValido){
                turnos.push(turnosDisponibles[i])
            }
        }
        return turnos
    }

    async notificarPaciente(turno) {
        const idDestinatario = turno.paciente.usuario || turno.paciente;
        await this.notificacionService.procesarNotificacionTurno(turno, idDestinatario);
    }
    
}

