import { EstadoTurno } from './estadoTurno.js';
import { Notificacion } from './notificacion.js';

export class FactoryNotificacion {
  
  crearSegunEstadoTurno(turno) {
    const ultimoCambio = turno.historialEstados[turno.historialEstados.length - 1];
    const servicio = turno.practica?.nombre || turno.especialidad?.nombre;
    const nombrePaciente = turno.paciente.nombre;
    const nombreMedico = turno.medico.nombre;
    let nombreQuienCancelo;

    const idUsuarioModificador = ultimoCambio.usuario?._id?.toString() || ultimoCambio.usuario?.toString();
    const idUsuarioPaciente = turno.paciente?.usuario?._id?.toString() || turno.paciente?.usuario?.toString();
    const idUsuarioMedico = turno.medico?.usuario?._id?.toString() || turno.medico?.usuario?.toString();

    if (idUsuarioModificador === idUsuarioPaciente) {
        nombreQuienCancelo = nombrePaciente;
    } else if (idUsuarioModificador === idUsuarioMedico) {
        nombreQuienCancelo = nombreMedico;
    }

    const accion = {
      [EstadoTurno.DISPONIBLE]: () => 'está disponible',
      [EstadoTurno.RESERVADO]: () => `fue reservado por ${nombrePaciente} para ${servicio}`,
      [EstadoTurno.CANCELADO]: () => `fue cancelado por ${nombreQuienCancelo}`,
      [EstadoTurno.REALIZADO]: () => `fue realizado para el servicio ${servicio}`,
      [EstadoTurno.PENDIENTE_CONFIRMACION]: () => `con el profesional ${nombreMedico} está pendiente de confirmación`
    };

    const idPaciente = turno.paciente.usuario;
    const idMedico = turno.medico.usuario;
    const idTurno = turno.id;
    const textoMotivo = ultimoCambio?.motivo ? ` Detalle/Motivo: ${ultimoCambio.motivo}.` : "";
    
    const notificacion = new Notificacion(idPaciente, idMedico, "");
    notificacion.mensaje = `El turno ${accion[turno.estado]()}. ${textoMotivo}`;
    
    return notificacion;
  }

  crearRecordatorio(turno){
    return[
      new Notificacion(
        turno.paciente.usuario,
        turno.medico.usuario,
        `Recordatorio: Tiene un turno mañana a las ${turno.fechaHora} en ${turno.sede.nombre}`
      ),
      new Notificacion(
        turno.medico.usuario,
        turno.paciente.usuario,
        `Recordatorio: Tiene un turno mañana con ${turno.paciente.nombre} a las ${turno.fechaHora}`
      )
    ];
  }
}