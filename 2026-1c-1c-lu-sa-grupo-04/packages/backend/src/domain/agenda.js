export class Agenda {

    mapaDias = {
        'DOMINGO': 0,
        'LUNES': 1,
        'MARTES': 2,
        'MIERCOLES': 3,
        'JUEVES': 4,
        'VIERNES': 5,
        'SABADO': 6
    };
    
    generarTurnos(idMedico, disponibilidades) {
    const turnosGenerados = [];

    disponibilidades.forEach(disponibilidad => {
        const { diaSemana, horaDesde, horaHasta, sede } = disponibilidad;
        const fechaBase = this.obtenerProximoDia(diaSemana);
        let [horaActual, minActual] = horaDesde.split(':').map(Number);
        const [horaFin, minFin] = horaHasta.split(':').map(Number);

        while (horaActual < horaFin || (horaActual === horaFin && minActual < minFin)) {
            const fechaTurno = new Date(fechaBase);
            // horaActual/minActual son hora local de Argentina (UTC-3, sin horario de verano)
            fechaTurno.setUTCHours(horaActual + 3, minActual, 0, 0);

            const nuevoTurno = {
                medico: idMedico,
                sede: sede,
                practica: null,
                especialidad: null,   
                fechaHora: fechaTurno,  
                estado: 'DISPONIBLE',
                historialEstados: [],
                costo: 0
            };

            turnosGenerados.push(nuevoTurno);

            minActual += 30;
            if (minActual >= 60) {
                horaActual += 1;
                minActual -= 60;
            }
        }
    });
    return turnosGenerados;
}

    obtenerProximoDia(diaBuscado) {
        const hoy = new Date();
        const diaActual = hoy.getUTCDay();
        const diaObjetivo = this.mapaDias[diaBuscado];

        // Calculamos cuántos días faltan para ese día de la semana
        let diasFaltantes = diaObjetivo - diaActual;
        
        // Si el día ya pasó esta semana saltamos a la semana que viene
        if (diasFaltantes <= 0) {
            diasFaltantes += 7; 
        }

        // Le sumamos los días faltantes a la fecha de hoy
        const proximaFecha = new Date(hoy);
        proximaFecha.setUTCDate(hoy.getUTCDate() + diasFaltantes);
        
        return proximaFecha;
    }
}