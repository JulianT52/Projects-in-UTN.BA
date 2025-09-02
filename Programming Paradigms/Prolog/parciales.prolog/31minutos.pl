% Cancion, Compositores,  Reproducciones
cancion(bailanSinCesar, [pabloIlabaca, rodrigoSalinas], 10600177).
cancion(yoOpino, [alvaroDiaz, carlosEspinoza, rodrigoSalinas], 5209110).
cancion(equilibrioEspiritual, [danielCastro, alvaroDiaz, pabloIlabaca, pedroPeirano, rodrigoSalinas], 12052254).
cancion(tangananicaTanganana, [danielCastro, pabloIlabaca, pedroPeirano], 5516191).
cancion(dienteBlanco, [danielCastro, pabloIlabaca, pedroPeirano], 5872927). 
cancion(lala, [pabloIlabaca, pedroPeirano], 5100530).
cancion(meCortaronMalElPelo, [danielCastro, alvaroDiaz, pabloIlabaca, rodrigoSalinas], 3428854).

rankingTop3(febrero, 1, lala).
rankingTop3(febrero, 2, tangananicaTanganana).
rankingTop3(febrero, 3, meCortaronMalElPelo).
rankingTop3(marzo, 1, meCortaronMalElPelo).
rankingTop3(marzo, 2, tangananicaTanganana).
rankingTop3(marzo, 3, lala).
rankingTop3(abril, 1, tangananicaTanganana).
rankingTop3(abril, 2, dienteBlanco).
rankingTop3(abril, 3, equilibrioEspiritual).
rankingTop3(mayo, 1, meCortaronMalElPelo).
rankingTop3(mayo, 2, dienteBlanco).
rankingTop3(mayo, 3, equilibrioEspiritual).
rankingTop3(junio, 1, dienteBlanco).
rankingTop3(junio, 2, tangananicaTanganana).
rankingTop3(junio, 3, lala).


% 1. Saber si una canción es un hit, lo cual ocurre si aparece en el ranking top 3 de todos los meses.

esHit(Cancion):-
    cancion(Cancion,_,_),
    forall(rankingTop3(Mes, _,_), rankingTop3(Mes, _, Cancion)).

% 2. Saber si una canción no es reconocida por los críticos, lo cual ocurre si tiene muchas reproducciones 
% y nunca estuvo en el ranking. Una canción tiene muchas reproducciones si tiene más de 7.000.000 reproducciones.

noEsReconocida(Cancion):-
    cancion(Cancion, _, Reproducciones),
    Reproducciones > 7000000,
    not(rankingTop3(_,_, Cancion)).

% 3. Saber si dos compositores son colaboradores, lo cual ocurre si compusieron alguna canción juntos.

sonColaboradores(Compositor1, Compositor2):-
    cancion(_,Compositores,_),
    member(Compositor1, Compositores),
    member(Compositor2, Compositores),
    Compositor1 \= Compositor2.

% 4. En el noticiero 31 Minutos cada trabajador puede tener múltiples trabajos. Algunos de los tipos de trabajos que existen son:
%    Los conductores , de los cuales nos interesa sus años de experiencia.
%    Los periodistas, de los cuales nos interesa sus años de experiencia y su título, el cual puede ser licenciatura o posgrado. 
%    Los reporteros, de los cuales nos interesa sus años de experiencia y la cantidad de notas que hicieron a lo largo de su carrera.

trabaja(tulio, conductor(5)).
trabaja(bodoque, periodista(licenciatura, 2)).
trabaja(bodoque, reportero(5, 300)).
trabaja(marioHugo, periodista(posgrado, 10)).
trabaja(juanin, conductor(0)).

% 5. Conocer el sueldo total de una persona, el cual está dado por la suma de los sueldos de cada uno de sus trabajos. El sueldo de cada trabajo se calcula de la siguiente forma:
%    El sueldo de un conductor es de 10000 por cada año de experiencia
%    El sueldo de un reportero es 10100 por cada año de experiencia más  100 por cada nota que haya hecho en su carrera.
%    Los periodistas, por cada año de experiencia reciben 5000, pero se les aplica un porcentaje de incremento del 
%    20% cuando tienen una licenciatura o del 35% si tienen un posgrado.

sueldoTotal(Persona, SueldoTotal):-
    trabaja(Persona, _),
    findall(Sueldo, sueldo(Persona, Sueldo), Sueldos),
    sum_list(Sueldos, SueldoTotal).

sueldo(Persona, Sueldo):-
    trabaja(Persona, conductor(Anios)),
    Sueldo is Anios * 10000.

sueldo(Persona, Sueldo):-
    trabaja(Persona, reportero(Anios, NotasHechas)),
    Sueldo is 10100 * Anios + 100 * NotasHechas.

sueldo(Persona, Sueldo):-
    trabaja(Persona, periodista(Titulo, Anios)),
    incrementoSegunTitulo(Titulo, Incremento),
    Sueldo is Anios * 5000 * Incremento.

incrementoSegunTitulo(posgrado, 1.35).
incrementoSegunTitulo(licenciatura, 1.2).

% 6. Agregar un nuevo trabajador que tenga otro tipo de trabajo nuevo distinto a los anteriores.
%    Agregar una forma de calcular el sueldo para el nuevo trabajo agregado ¿Qué concepto de la materia se puede relacionar a esto?

%limpiador(cantidadAnios, cantidadInodorosLimpios)
trabaja(julian, limpiador(10, 938)).

sueldo(Persona, Sueldo):-
    trabaja(Persona, limpiador(Anios, Inodoros)),
    Sueldo is Anios * 3500 + Inodoros * 100.

% Se puede relacionar con polimorfismo, al tener estructuras de este tipo, prolog evalua una condicion de las existentes, en caso de que no
% se cumpla, busca otra alternativa para evaluar hasta quedarse sin alternativas. 


