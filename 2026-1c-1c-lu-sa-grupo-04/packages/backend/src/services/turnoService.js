import express from "express"
import { Agenda } from "../domain/agenda.js"
import { TurnoRepository } from "../repositories/TurnoRepository.js";
import { BadRequestError } from "../errors/errores.js";
import { Practica } from "../domain/practica.js";
import { Especialidad } from "../domain/especialidad.js";

export class TurnoService {
    constructor({ turnoRepository, pacienteRepository, notificacionService } = {}) {
        this.turnoRepository = turnoRepository;
        this.pacienteRepository = pacienteRepository;
        this.notificacionService = notificacionService;
    }

    async create(idMedico, disponibilidades) {
        const agendaGeneradora = new Agenda();
        if (disponibilidades == null) return;
        const turnos = await agendaGeneradora.generarTurnos(idMedico, disponibilidades);
        return this.turnoRepository.guardarTurnos(turnos);
    }

    async eliminarTurnosDisponiblesPorDisponibilidad(idMedico, disponibilidad) {
        if (!idMedico) {
            throw new BadRequestError("El id del médico es obligatorio")
        }

        if (!disponibilidad) {
            throw new BadRequestError("La disponibilidad es obligatoria")
        }

        const turnosDisponiblesFuturos = await this.turnoRepository.obtenerTurnosDisponiblesFuturos(idMedico)

        const idsTurnosAEliminar = turnosDisponiblesFuturos
            .filter(turno => this.turnoPerteneceADisponibilidad(turno, disponibilidad))
            .map(turno => turno._id)

        if (idsTurnosAEliminar.length === 0) {
            return { deletedCount: 0 }
        }

        return await this.turnoRepository.eliminarTurnosPorIds(idsTurnosAEliminar)
    }

    async obtenerHistorialTurnosPaciente(pacienteId) {
        if (!pacienteId) {
            throw new Error("El ID del paciente es obligatorio para buscar su historial");
        }

        return await this.turnoRepository.obtenerHistorialTurnosPaciente(pacienteId);
    }

    async verificarDisponibilidadParaCambio(medicoId, nuevaFecha) {

        if (!medicoId) {
            throw new BadRequestError("El ID del médico es obligatorio para verificar la disponibilidad");
        }

        if (!nuevaFecha) {
            throw new BadRequestError("La fecha propuesta es obligatoria para verificar la disponibilidad");
        }

        return await this.turnoRepository.verificarDisponibilidadParaCambio(medicoId, nuevaFecha);
    }

    async obtenerPorId(turnoId) {
        if (!turnoId) {
            throw new Error("El ID del turno es obligatorio");
        }
        const turno = await this.turnoRepository.obtenerPorId(turnoId);
        if (!turno) {
            throw new Error("No se encontró el turno con el ID proporcionado");
        }
        return turno;
    }

    async obtenerTurnoConDetalles(turnoId) {
        if (!turnoId) {
            throw new Error("El ID del turno es obligatorio");
        }
        const turno = await this.turnoRepository.obtenerTurnoConDetalles(turnoId);
        if (!turno) {
            throw new Error("No se encontró el turno con el ID proporcionado");
        }
        return turno;
    }


    async actualizarTurno(turno) {
        return await this.turnoRepository.actualizarTurno(turno);
    }

    turnoPerteneceADisponibilidad(turno, disponibilidad) {
        const fechaTurno = new Date(turno.fechaHora)

        return (
            this.diaSemanaDeFecha(fechaTurno) === disponibilidad.diaSemana &&
            this.minutosDeFecha(fechaTurno) >= this.horaAMinutos(disponibilidad.horaDesde) &&
            this.minutosDeFecha(fechaTurno) < this.horaAMinutos(disponibilidad.horaHasta)
        )
    }

    diaSemanaDeFecha(fecha) {
        const dias = [
            "DOMINGO",
            "LUNES",
            "MARTES",
            "MIERCOLES",
            "JUEVES",
            "VIERNES",
            "SABADO"
        ]

        return dias[fecha.getUTCDay()]
    }

    minutosDeFecha(fecha) {
        return fecha.getUTCHours() * 60 + fecha.getUTCMinutes()
    }

    horaAMinutos(hora) {
        const [horas, minutos] = hora.split(":").map(Number)
        return horas * 60 + minutos
    }


    async buscarTurnosParaPaciente(pacienteId, filtros) {
    const paciente = await this.pacienteRepository.obtenerPorId(pacienteId);
    if (!paciente) {
        throw new Error("No se encontró el paciente");
    }

    const sortBy = filtros.sortBy || 'fechaHora';
    const sortOrder = filtros.sortOrder || 'asc';
    const page = Number(filtros.page) || 1;
    const limit = Number(filtros.limit) || 10;
    let turnos, total;

    if (sortBy === 'costo') {
        const resultado = await this.turnoRepository.buscarTurnosDisponibles({
            ...filtros,
            sortBy: 'fechaHora',
            sortOrder: 'asc',
            page: 1,
            limit: 10000,
        });
        turnos = resultado.turnos;
        total = resultado.total;
    } else {
        const resultado = await this.turnoRepository.buscarTurnosDisponibles(filtros);
        turnos = resultado.turnos;
        total = resultado.total;
    }

    const dataEnriquecida = turnos.map(turnoDoc => this.enriquecerTurno(turnoDoc, paciente));

    let dataFinal = dataEnriquecida;
    if (sortBy === 'costo') {
        const factor = sortOrder === 'desc' ? -1 : 1;
        const sorted = [...dataEnriquecida].sort((a, b) => (a.montoAAbonar - b.montoAAbonar) * factor);
        const skip = (page - 1) * limit;
        dataFinal = sorted.slice(skip, skip + limit);
    }

    return {
        data: dataFinal,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}

    enriquecerTurno(turnoDoc, paciente) {
        let practicaDominio = null;
        let especialidadDominio = null;

        if (turnoDoc.practica && turnoDoc.medico.practicas) {
            const practicaData = turnoDoc.medico.practicas.find(
                p => p._id.toString() === turnoDoc.practica.toString()
            );
            if (practicaData) {
                practicaDominio = Practica.reconstituir(practicaData);
            }
        }

        if (turnoDoc.especialidad && turnoDoc.medico.especialidades) {
            const especialidadData = turnoDoc.medico.especialidades.find(
                e => e._id.toString() === turnoDoc.especialidad.toString()
            );
            if (especialidadData) {
                especialidadDominio = Especialidad.reconstituir(especialidadData);
            }
        }

        const turnoParaCalculo = {
            especialidad: especialidadDominio,
            practica: practicaDominio
        };

        const coberturaInfo = this.calcularCostoYCobertura(turnoParaCalculo, paciente.plan);

        return {
            _id: turnoDoc._id,
            medicoId: turnoDoc.medico._id,
            medicoEspecialidades: turnoDoc.medico.especialidades ?? [],
            profesional: `${turnoDoc.medico.nombre} ${turnoDoc.medico.apellido}`,
            servicio: practicaDominio?.nombre || especialidadDominio?.nombre || "Servicio no definido",
            fecha: turnoDoc.fechaHora,
            sede: turnoDoc.sede?.nombre || "Sede no asignada",
            estado: turnoDoc.estado,
            nivelCobertura: coberturaInfo.nivel,
            montoAAbonar: coberturaInfo.costoFinal
        };
    }

    async buscarMedicosConTurnosParaPaciente(pacienteId, filtros) {
        const paciente = await this.pacienteRepository.obtenerPorId(pacienteId);
        if (!paciente) {
            throw new Error("No se encontró el paciente");
        }

        const sortBy = filtros.sortBy || 'fechaHora';
        const sortOrder = filtros.sortOrder || 'asc';
        const page = Number(filtros.page) || 1;
        const limit = Number(filtros.limit) || 5;

        const paginaRepo = sortBy === 'costo' ? 1 : page;
        const limiteRepo = sortBy === 'costo' ? 10000 : limit;

        const { medicos: grupos, total } = await this.turnoRepository.buscarMedicosConTurnosDisponibles({
            ...filtros,
            page: paginaRepo,
            limit: limiteRepo,
            sortOrder: sortBy === 'costo' ? 'asc' : sortOrder,
        });

        let data = grupos.map(grupo => {
            const turnos = grupo.turnos.map(turnoDoc =>
                this.enriquecerTurno({ ...turnoDoc, medico: grupo.medico }, paciente)
            );

            const especialidades = (grupo.medico.especialidades ?? []).map(esp => {
                const especialidadDominio = Especialidad.reconstituir(esp);
                const coberturaInfo = this.calcularCostoYCobertura({ especialidad: especialidadDominio, practica: null }, paciente.plan);
                return {
                    _id: esp._id,
                    nombre: esp.nombre,
                    practicas: esp.practicas,
                    nivelCobertura: coberturaInfo.nivel,
                    montoAAbonar: coberturaInfo.costoFinal
                };
            });

            const costoMinimoDelDia = especialidades.length > 0
                ? Math.min(...especialidades.map(e => e.montoAAbonar))
                : 0;

            return {
                medicoId: grupo.medico._id,
                profesional: `${grupo.medico.nombre} ${grupo.medico.apellido}`,
                especialidades,
                turnos,
                costoMinimoDelDia
            };
        });

        if (sortBy === 'costo') {
            const factor = sortOrder === 'desc' ? -1 : 1;
            data.sort((a, b) => (a.costoMinimoDelDia - b.costoMinimoDelDia) * factor);
            const skip = (page - 1) * limit;
            data = data.slice(skip, skip + limit);
        }

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async obtenerDiasDisponibles(filtros) {
        return await this.turnoRepository.obtenerDiasConTurnosDisponibles(filtros);
    }

    calcularCostoYCobertura(turno, plan) {
        
        let costoBase = 0;
        if (turno.practica) {
            costoBase = turno.practica.costo ?? 0;
        } else if (turno.especialidad) {
            costoBase = turno.especialidad.costoConsulta
                ?? turno.especialidad.practicas?.[0]?.costo
                ?? 0;
        }

        // Paciente sin obra social o sin plan asignado: tarifa Particular (sin cobertura).
        if (!plan) {
            return { nivel: "PARTICULAR", costoFinal: costoBase };
        }

        let nivel = "NO_CUBIERTA";
        if (turno.practica) {
            nivel = plan.obtenerCoberturaP(turno.practica);
        }
        if (nivel === "NO_CUBIERTA" && turno.especialidad) {
            nivel = plan.obtenerCoberturaE(turno.especialidad);
        }

        let costoFinal = costoBase;

        if (nivel === "TOTAL") {
            costoFinal = 0;
        } else if (nivel === "PARCIAL") {
            costoFinal = costoBase * 0.5;
        }

        return { nivel, costoFinal };
    }

    async reservarTurno(turnoId, pacienteId, especialidadId, practicaId, usuarioId) {
        if (!turnoId || !pacienteId || !usuarioId) {
            throw new Error("turnoId, pacienteId y usuarioId son obligatorios");
        }

        const turnoReservado = await this.turnoRepository.reservarTurno(turnoId, pacienteId, especialidadId, practicaId, usuarioId);

        const turnoConDetalles = await this.turnoRepository.obtenerTurnoConDetalles(turnoReservado._id);

        const { especialidadDominio, practicaDominio } = this.obtenerServicioDominio(turnoConDetalles);
        await this.notificarMedico({
            ...turnoConDetalles.toObject(),
            especialidad: especialidadDominio,
            practica: practicaDominio,
        });

        const paciente = await this.pacienteRepository.obtenerPorId(pacienteId);
        const { nivelCobertura, costoBase, montoAAbonar } = this.calcularCoberturaDeReserva(turnoConDetalles, paciente);

        return {
            ...turnoReservado.toObject(),
            nivelCobertura,
            costoBase,
            montoAAbonar,
        };
    }

    async cotizarTurno(turnoId, pacienteId, especialidadId, practicaId) {
        if (!turnoId || !pacienteId) {
            throw new BadRequestError("turnoId y pacienteId son obligatorios");
        }

        const turnoConDetalles = await this.turnoRepository.obtenerTurnoConDetalles(turnoId);
        if (!turnoConDetalles) {
            throw new BadRequestError("El turno no existe");
        }

        const paciente = await this.pacienteRepository.obtenerPorId(pacienteId);
        const { nivelCobertura, costoBase, montoAAbonar } = this.calcularCoberturaDeReserva(
            { medico: turnoConDetalles.medico, especialidad: especialidadId, practica: practicaId },
            paciente
        );

        return { nivelCobertura, costoBase, montoAAbonar };
    }

    obtenerServicioDominio(turnoConDetalles) {
        const especialidadData = turnoConDetalles.medico.especialidades.find(
            e => e._id.toString() === turnoConDetalles.especialidad?.toString()
        );
        const practicaData = especialidadData?.practicas.find(
            p => p._id.toString() === turnoConDetalles.practica?.toString()
        );

        return {
            especialidadDominio: Especialidad.reconstituir(especialidadData),
            practicaDominio: Practica.reconstituir(practicaData),
        };
    }

    calcularCoberturaDeReserva(turnoConDetalles, paciente) {
        const { especialidadDominio, practicaDominio } = this.obtenerServicioDominio(turnoConDetalles);

        const coberturaInfo = this.calcularCostoYCobertura(
            { especialidad: especialidadDominio, practica: practicaDominio },
            paciente.plan
        );

        return {
            nivelCobertura: coberturaInfo.nivel,
            costoBase: practicaDominio?.costo ?? 0,
            montoAAbonar: coberturaInfo.costoFinal,
        };
    }

    async notificarMedico(turno) {
        const idDestinatario = turno.medico.usuario || turno.medico;
        await this.notificacionService.procesarNotificacionTurno(turno, idDestinatario);
    }

    async obtenerPacientesPorMedico(medicoId) {
    if (!medicoId) {
        throw new BadRequestError("El ID del médico es obligatorio");
    }
    return await this.turnoRepository.obtenerPacientesPorMedico(medicoId);
}
}