% Parque de atracciones

% La gente de un pueblo que juntó sus recursos con los cuales construyeron un Parque de atracciones, 
% necesita un sistema para registrar el uso de las atracciones cada día. 
% Está apuntado a toda la familia pero hay ciertas restricciones para atracciones específicas. 
% Se espera extender el sistema a la administración de varios parques.
% Personas, parques y atracciones
% De cada persona, conocemos su edad y altura, aquí van algunos ejemplos:
% Nina es una joven de 22 años y 1.60m.
% Marcos es un niño de 8 años y 1.32m.
% Osvaldo es un adolescente de 13 años y 1.29m.

persona(nina,joven,22,1.60).
persona(marcos,ninio,8,1.32).
persona(osvaldo, adolescente, 13, 1.29).

% Cada atracción del parque tiene requisitos para su ingreso, por ejemplo en el Parque de la Costa contamos con las siguientes atracciones:
% Tren Fantasma
% Exige que la persona sea mayor o igual a 12 años.
% Montaña Rusa
% Exige que la persona tenga más de 1.30 de altura.
% Máquina Tiquetera
% No tiene exigencias.

atraccion(parqueDeLaCosta, trenFantasma).
atraccion(parqueDeLaCosta,montaniaRusa).
atraccion(parqueDeLaCosta,maquinaTiquetera).
atraccion(parqueAcuatico,toboganGigante).
atraccion(parqueAcuatico,rioLento).
atraccion(parqueAcuatico,piscinaDeOlas).

requisito(trenFantasma, edad(12)).
requisito(montaniaRusa, altura(1.30)).
requisito(toboganGigante, altura(1.50)).
requisito(piscinaDeOlas, edad(5)).


% Requerimientos 
% Modelar la base de conocimiento para contener esa información, proveyendo ejemplos, y programar los siguientes predicados:
% 1.puedeSubir/2, relaciona una persona con una atracción, si la persona puede subir a la atracción.

puedeSubir(Persona, Atraccion):-
    persona(Persona, _, _, _),
    atraccion(_,Atraccion),
    cumpleRequisito(Persona, Atraccion).

cumpleRequisito(Persona, Atraccion):-
    persona(Persona, _, Edad, _),
    requisito(Atraccion, edad(ApartirDe)),
    Edad >= ApartirDe.

cumpleRequisito(Persona, Atraccion):-
    persona(Persona, _, _, Altura),
    requisito(Atraccion, altura(ApartirDe)),
    Altura >= ApartirDe.

% 2.esParaElle/2, relaciona un parque con una persona, si la persona puede subir a todos los juegos del parque.

esParaElle(Parque, Persona):-
    persona(Persona, _,_,_),
    atraccion(Parque,_),
    forall(atraccion(Parque,Atracciones), puedeSubir(Persona, Atracciones)).

% 3.malaIdea/2, relaciona un grupo etario (adolescente/niño/joven/adulto/etc) con un parque, y nos dice que "es mala idea" 
% que las personas de ese grupo vayan juntas a ese parque, si es que no hay ningún juego al que puedan subir todos.

esMalaIdea(GrupoEtario, Parque):-
    persona(_,GrupoEtario,_,_),
    atraccion(Parque,Atraccion),
    not((persona(Persona,GrupoEtario,_,_),puedeSubir(Persona, Atraccion))).

% Un programa es una lista ordenada de atracciones, que tienen que estar todas en el mismo parque. 
% Por ejemplo, un programa en el parque acuático puede arrancar en el tobogán gigante, 
% continuar en la piscina de olas y finalizar en la corriente serpenteante. 
% Obviamente el programa no tiene por qué incluir todos los juegos del parque, es una selección ordenada.

% A partir de esa definición, queremos que programes los siguientes predicados:
% 4. programaLogico/1, me dice si un programa es "bueno", es decir, todos los juegos están en el mismo parque y no hay juegos repetidos.

programaLogico(Programa) :-
    atraccion(Parque, _),
    forall(member(Atraccion, Programa), atraccion(Parque, Atraccion)),
    noHayRepetidos(Programa).

noHayRepetidos([]).
noHayRepetidos([Atraccion | Atracciones]) :-
    noHayRepetidos(Atracciones),
    not(member(Atraccion, Atracciones)).

% 5. hastaAca/3, relaciona a una persona P y un programa Q, con el subprograma S 
% que se compone de las atracciones iniciales de Q hasta la primera a la que P no puede subir (excluida obviamente).
% Por ejemplo, si el programa tiene 5 atracciones y P no puede subir a la tercera, pero sí a las dos primeras, 
% el subprograma S deberá incluir a esas dos primeras atracciones.

hastaAca(Persona, [Atraccion | Atracciones], [Atraccion | Subprograma]):-
    puedeSubir(Persona, Atraccion),
    hastaAca(Persona, Atracciones, Subprograma).

hastaAca(Persona, [Atraccion | _],[]):-
    not(puedeSubir(Persona, Atraccion)).
    






