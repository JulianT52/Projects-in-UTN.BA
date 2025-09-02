% Dada la siguiente base de conocimientos:
% Relaciona un alumno con un final al que se anotó.
anotado(ana,paradigmas,25).
anotado(ana,fisicaII,9).
anotado(beto,paradigmas,25).
anotado(camilo,paradigmas,25).
fecha(paradigmas,11).
fecha(paradigmas,18).
fecha(paradigmas,25).
fecha(fisicaII, 9).
fecha(fisicaII,16).
fecha(fisicaII,23).

ultimaFecha(Materia,Fecha):- 
    findall(Dia, fecha(Materia, Dia), Fechas), 
    max_list(Fechas, Fecha).

% El predicado max_list/2 relaciona a una lista con su elemento máximo.

% Con la solución dada, ¿qué se obtendrá como respuesta a la consulta ultimaFecha(Materia,Fecha)? Explicar cómo se llega a esa conclusión.

% Va a devolver las ultimas fechas de todas las materias, es decir, genera una lista con todas las fechas de finales y consigue la ultima
% en este caso seria 25, lo pone en la variable Fecha

% Reescribir el predicado ultimaFecha sin usar listas y comparar ambas soluciones en términos de declaratividad. 

ultimaFechaRever(Materia,Fecha):-
    fecha(Materia, Fecha),
    not((fecha(Materia, OtraFecha), OtraFecha > Fecha)).

% Asegurar que la nueva solución sea inversible. Asumiendo que el predicado ultimaFecha fue corregido como se solicitó, 
% responder para las siguientes consultas qué significado tiene y qué soluciones genera Prolog.
?- forall(anotado(_,paradigmas,Fecha), ultimaFecha(paradigmas,Fecha)).

% Esta consulta nos dicen si todas las personas que estan anotados a Paradigmas estan para la ultima fecha o a otra


?- anotado(Alumno1, Materia, Fecha), anotado(Alumno2, Materia, Fecha), Alumno1 \= Alumno2.

% Esta consulta nos dice si hay dos alumnos anotados a la misma materia en la misma fecha, siempre distintos entre si
