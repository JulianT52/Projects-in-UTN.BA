% La pirámide
% El punto de partida es que las necesidades humanas se
% jerarquizan en niveles:
% ● Respiración, alimentación, descanso y reproducción
% son necesidades del nivel más básico, llamado
% fisiológico.
% ● Integridad física, empleo, salud son necesidades del
% nivel seguridad.
% ● Amistad, afecto, intimidad son necesidades del nivel social.
% ● Confianza, respeto y éxito son necesidades del nivel reconocimiento.
% ● Hay un último nivel llamado de autorrealización, con sus correspondientes necesidades.

% 1. Agregar hechos para completar la información de las necesidades y niveles con algunos de los
% ejemplos mencionados e inventando nuevas necesidades e incluso niveles. Se asume que los niveles
% son distintos y están ordenados jerárquicamente entre sí, que no hay niveles sin necesidades y que
% una misma necesidad no puede estar en dos niveles a la vez.

necesidad(respiracion, fisiologico).
necesidad(descanso, fisiologico).
necesidad(alimentacion,fisiologico).
necesidad(reproduccion,fisiologico).
necesidad(integridadFisica,seguridad).
necesidad(empleo, seguridad).
necesidad(salud, seguridad).
necesidad(amistad, social).
necesidad(afecto, social).
necesidad(intimidad, social).
necesidad(respeto, reconocimiento).
necesidad(exito, reconocimiento).
necesidad(confianza, reconocimiento).

nivelSuperior(autorrealizacion, reconocimiento).
nivelSuperior(reconocimiento, social).
nivelSuperior(social, seguridad).
nivelSuperior(seguridad, fisiologica).

% 2. Permitir averiguar la separación de niveles que hay entre dos necesidades, es decir la cantidad de
% niveles que hay entre una y otra.
% Por ejemplo, con los ejemplos del texto de arriba, la separación entre empleo y salud es 0, y la
% separación entre respiración y confianza es 3.

separacionEntre(NecesidadA,NecesidadB,Separacion):-
    necesidad(NecesidadA,NivelA),
    necesidad(NecesidadB,NivelB),
    separacionNiveles(NivelA,NivelB,Separacion).

separacionNiveles(NivelA, NivelA, 0).
separacionNiveles(NivelA, NivelB, Separacion):-
    nivelSuperior(NivelB, NivelIntermedio),
    separacionNiveles(NivelA,NivelIntermedio,SeparacionAnterior),
    Separacion is SeparacionAnterior + 1.

% 3. Modelar las necesidades (sin satisfacer) de cada persona.
% Recuerden leer los puntos siguientes para saber cómo se va a usar y cómo modelar esta información.
% Por ejemplo:
% ● Carla necesita alimentarse, descansar y tener un empleo.
% ● Juan no necesita empleo pero busca alguien que le brinde afecto. Se anotó en la facu porque
% desea ser exitoso.
% ● Roberto quiere tener un millón de amigos.
% 1
% ● Manuel necesita una bandera para la liberación, no quiere más que España lo domine ¡no
% señor!.
% 2
% ● Charly necesita alguien que lo emparche un poco y que limpie su cabeza

necesita(carla, alimentacion).
necesita(carla, descansar).
necesita(carla, tenerEmpleo).
necesita(juan, afecto).
necesita(juan, exito).
necesita(roberto, amistad).
necesita(manuel, libertad).
necesita(charly, afecto).

% 4.Encontrar la necesidad de mayor jerarquía de una persona.
% En el caso de Carla, es tener un empleo

necesidadJerarquia(Persona, Necesidad,Jerarquia):-
    necesita(Persona, Necesidad),
    necesidad(Necesidad, Nivel),
    nivelBasico(NivelBasico),
    separacionEntre(Nivel,NivelBasico,Jerarquia).

necesidadMayorJerarquia(Persona, Necesidad):-
    necesidadJerarquia(Persona,Necesidad, Jerarquia),
    forall(necesidadJerarquia(Persona, _ , JerarquiaMaxima), Jerarquia >= JerarquiaMaxima).

nivelBasico(Nivel):-
    nivelSuperior(_,Nivel),
    not(nivelSuperior(Nivel,_)).
