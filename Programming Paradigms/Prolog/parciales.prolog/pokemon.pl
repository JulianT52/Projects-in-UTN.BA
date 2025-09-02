
% Parte 1. Pokédex

% Explorando el mundo de Pokémon vamos conociendo pokemones y recopilando información en nuestra pokédex. 
% Pokemones. De estos conocemos sus tipos.

pokemon(pikachu, [electrico]).
pokemon(charizard, [fuego]).
pokemon(venusaur, [planta]).
pokemon(blastoise, [agua]).
pokemon(totodile, [agua]).
pokemon(snorlax, [normal]).
pokemon(rayquaza, [dragon, volador]).
pokemon(arceus, []).

% Entrenadores: En el camino nos encontramos con otros entrenadores. De estos conocemos que pokemones tienen:

entrenador(ash, [pikachu, charizard]).
entrenador(brock, [snorlax]).
entrenador(misty, [blastoise, venusaur, arceus]).

% Modelar en Prolog la información recopilada hasta ahora y modelar lo necesario para poder consultar:
% Saber si un pokémon es de tipo múltiple, esto ocurre cuando tiene más de un tipo.

esTipoMultiple(Pokemon):-
    pokemon(Pokemon, Tipos),
    length(Tipos, Cantidad),
    Cantidad > 1.

% Saber si un pokemon es legendario, lo cual ocurre si es de tipo múltiple y ningún entrenador lo tiene.

esLegendario(Pokemon):-
    esTipoMultiple((Pokemon)),
    noLoTieneNadie(Pokemon).

noLoTieneNadie(Pokemon):-
    not(forall(entrenador(Entrenador, _), entrenador(Entrenador, Pokemon))).

% Saber si un pokemon es misterioso, lo cual ocurre si es el único en su tipo o ningún entrenador lo tiene.

tiene(Entrenador, Pokemon) :-
    entrenador(Entrenador, ListaPokemones),
    member(Pokemon, ListaPokemones).

esMisterioso(Pokemon):-
    noLoTieneNadie(Pokemon).

esMisterioso(Pokemon):-
    pokemon(Pokemon,Tipo),
    esDeTipoUnico(Tipo, Pokemon).

esDeTipoUnico(Tipo, Pokemon) :-
    pokemon(Pokemon, Tipos),
    member(Tipo, Tipos),
    not((pokemon(Otro, OtrosTipos),Otro \= Pokemon, member(Tipo, OtrosTipos))).

