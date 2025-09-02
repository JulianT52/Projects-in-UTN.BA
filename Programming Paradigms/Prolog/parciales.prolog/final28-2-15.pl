% Dado el siguiente código:

todosLosVotantesHabilitados(Lista5):-
    todosLosAlumnosRegulares(Lista1), 
    findall(D, esDocente(D),  Lista2),
    append(Lista1, Lista2, Lista3), 
    findall(G, esGraduado(G),  Lista4),
    append(Lista3, Lista4, Lista5).

todosLosAlumnosRegulares(Alumnos):-
	findall(Alumno, esRegular(Alumno), Alumnos).

esRegular(alumno(_, _, FR)):-  %-- FR son los finales rendidos
finalesRendidosUltimoAnio(FR, FRUA),
length(FRUA, N), 
N >= 2.

% Asumiendo que los predicados finalesRendidosUltimoAnio, esGraduado y esDocente funcionan adecuadamente y son completamente inversibles, 
% indicar V/F justificando: (0,5 puntos cada una)

% 1. todosLosAlumnosRegulares/1 es un predicado inversible.

% Falso, la lista1 que se le pasa como hecho, no esta instanciada anteriormente, no sabemos que es lo que esta colocado en esa lista, puede tranquilamente
% poseer un miembro llamado Quien, y ese Quien no es alumno. 

% 2. La solución es poco expresiva.

% Verdadero, en terminos de expresividad, los multiples append y findall no dejan en claro bien que es lo que la funcion trata de hacer, deberian
% declararse en predicados aparte. 

% 3. La consulta ?- todosLosAlumnosRegulares(Alumnos). tiene múltiples soluciones. 

% Falso, solo devuelve la lista con los multiples alumnos, prolog lo devuelve de una unica manera

% 4. El uso de length es incorrecto, dado que tiene aridad 1.

% Falso, length tiene aridad dos, la lista que le pasamos y una variable donde se guardara el int que representa la longitud de la lista

% 5. La consulta ?- esRegular(ernesto). da error. 

% Verdadero, debido a que la consulta esRegular tiene aridad 3 y solo se le esta consultando con ernesto, obviando los siguientes 2

% 6. todosLosVotantesHabilitados es un predicado inversible.

% Falso, mismo motivo que el 1, no hay una instanciacion previa de la lista, no se pueden hacer consultas particulares  

% 7. todosLosVotantesHabilitados aprovecha el polimorfismo entre docentes, graduados y alumnos regulares.

% Falso, no utiliza polimorfismo, no tiene en cuenta las caracteristicas propias presentes en los functores de los alumnos/docentes/graduados

% 8. La solución podría ser reescrita y simplificada sin usar el predicado append/3.

% Verdadero, podrian hacerse consultas sin agregarlas en una lista, ya que no es necesario diferenciarlas por grupo, solamente devolver todos aquellos
% que cumplan la condicion. 