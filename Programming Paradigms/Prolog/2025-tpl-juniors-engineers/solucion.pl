% Solución en Prolog
% figurita(FigNro).
% persona(Nombre).

% paquete(Persona,Orden, [Figuritas]).
% canje(Da, Recibe, Figurita).

paquete(andy, 1, [2, 4]).
paquete(andy, 2, [7, 6]).
paquete(andy, 3, [8, 1, 3, 5]).
paquete(flor, 1, [5]).
paquete(flor, 2, [5]).
paquete(bobby, 1, [3, 5]).
paquete(bobby, 2, [7]).
paquete(lala, 1, [3, 7, 1]).
paquete(toto, 1, [1]).
canje(andy, flor, 4).
canje(andy, flor, 7).
canje(flor, andy, 1).
canje(bobby, flor, 2).
canje(flor, bobby, 1).
canje(flor, bobby, 4).
canje(flor, bobby, 6).
canje(lala, pablito, 1).
canje(pablito, lala, 5).
canje(toto, pablito, 2).
canje(pablito, toto, 6).

vieneDePaquete(Persona, Figurita):-
	paquete(Persona, _, Figuritas),
	member(Figurita, Figuritas).

tiene(Persona, Figurita):-
	vieneDePaquete(Persona, Figurita).

tiene(Persona, Figurita):-
	canje(_, Persona, Figurita).


cantidadFigurita(Persona, Figurita, Cantidad) :-
	findall(F, (paquete(Persona, _, Figuritas), member(F, Figuritas)), DePaquete),
	findall(F, canje(_, Persona, F), PorCanje),
	append(DePaquete, PorCanje, TodasLasFiguritas),
	findall(Figurita, member(Figurita, TodasLasFiguritas), Coincidencias),
	length(Coincidencias, Cantidad).

figuritasRepetidas(Persona, ListaFiguritas) :-
	findall(F, tiene(Persona, F), Todas),
	sort(Todas, FiguritasUnicas),
	findall(Figurita, (member(Figurita, FiguritasUnicas), cantidadFigurita(Persona, Figurita, C), C > 1), ListaFiguritas).

% 3
colecciona(Persona):-
	tiene(Persona, _).

esRara(Figurita):-
	not((paquete(_, Orden, Figuritas), Orden =< 2, member(Figurita, Figuritas))).

esRara(Figurita):-
	findall(Persona, colecciona(Persona), PersonasQueColeccionan), 
	length(PersonasQueColeccionan, CantTotal),
	findall(Persona, tiene(Persona, Figurita), PersonasQueLaTienen),
	length(PersonasQueLaTienen, Cantidad),
	Cantidad > 0,
	Cantidad * 2 < CantTotal,
	not(alguienLaTieneRepetida(Figurita)).

alguienLaTieneRepetida(Figurita) :-
	figuritasRepetidas(_, Lista),
	member(Figurita, Lista).

% 4 
%figurita(numero, tipo, [personajes]).
%personajes(nombre, popularidad).
%rompecabezas([numero]).

personajes(kitty, 5).
personajes(cinnamoroll, 4).
personajes(badtzMaru, 2).
personajes(keroppi, 3).
personajes(pompompurin, 4).
personajes(gudetama, 1).
personajes(myMelody, 3).
personajes(littleTwinStars, 2).
personajes(kuromi, 5).

figurita(1, basica, [kitty, keroppi]).
figurita(2, brillante, [kitty]).
figurita(3, brillante, [myMelody]).
figurita(4, basica, []).
figurita(5, rompeCabezas, []).
figurita(6, rompeCabezas, []).
figurita(7, rompeCabezas, []).
figurita(8, basica, [kitty, keroppi, cinnamoroll, badtzMaru, pompompurin, gudetama, myMelody, littleTwinStars, kuromi]).
figurita(9, basica, []).

album([1,2,3,4,5,6,7,8,9]).

esValiosa(Figurita):-
	esRara(Figurita).

esValiosa(Figurita):-
	atractivo(Figurita, Valor),
	Valor > 7.

atractivo(Figurita, Valor) :-
	figurita(Figurita, brillante, [Personaje]),
	personajes(Personaje, Popularidad),
	Valor is 5*Popularidad.

atractivo(Figurita, Valor):-
	figurita(Figurita, basica, Personajes),
	findall(Popularidad, (member(Personaje, Personajes), personajes(Personaje, Popularidad)), Popularidades),
	sumlist(Popularidades, Valor).

atractivo(Figurita, 2) :-
	figurita(Figurita, rompeCabezas, _),
	findall(F,figurita(F, rompeCabezas, _),Rompecabezas),
	length(Rompecabezas, Cant),
	Cant =< 2.

atractivo(Figurita, 0) :-
	figurita(Figurita, rompeCabezas, _),
	findall(F, figurita(F, rompeCabezas, _), Rompecabezas),
	length(Rompecabezas, Cant),
	Cant > 2.

% 6-
figuritaAtractiva(Persona, FiguritaMaxima) :-
    findall(F, tiene(Persona, F), Figuritas),
    findall(Valor-F, (member(F, Figuritas), atractivo(F, Valor)), Puntuadas),
	Puntuadas \= [],
    max_member(_-FiguritaMaxima, Puntuadas).

% 7-
leResultaInteresante(Persona, FiguritasRecibidas, Puntaje) :-
	findall(Figuritas, (member(Figuritas, FiguritasRecibidas), not(tiene(Persona, Figuritas))), NuevasFigus),
	findall(Valor, (member(Figuritas, NuevasFigus), atractivo(Figuritas, Valor)), Valores),
	sumlist(Valores, SumaAtractivo),
	plusPorRara(NuevasFigus, Plus),
	Puntaje is SumaAtractivo + Plus.

plusPorRara(NuevasFigus, 20) :-
	findall(Figuritas, (member(Figuritas, NuevasFigus), esRara(Figuritas)), Raras),
	Raras \= [].
plusPorRara(NuevasFigus, 0) :-
	findall(Figuritas, (member(Figuritas, NuevasFigus), esRara(Figuritas)), Raras),
	Raras = [].

% 8-  
canjeValido(Da, _,Figurita) :-
	tiene(Da, Figurita).

paqueteValido(Persona, NroPaquete, ListaFiguritas) :- 
    paquete(Persona, NroPaquete, ListaFiguritas),
    album(Album),
    forall(member(F, ListaFiguritas), member(F, Album)).

%9-
haceNegocio(PersonaDa, PersonaRecibe, FiguritaQueRecibe, FiguritaQueDa) :-
	canje(PersonaRecibe, PersonaDa, FiguritaQueRecibe),
	canje(PersonaDa, PersonaRecibe, FiguritaQueDa),
	esValiosa(FiguritaQueRecibe),
	not(esValiosa(FiguritaQueDa)).

%10-
necesitaConUrgencia(Persona, Figurita) :-
	leFaltaSoloEsa(Persona, Figurita),
	forall((figurita(OtraFigu, _, _), OtraFigu \= Figurita), tiene(Persona, OtraFigu)).

necesitaConUrgencia(Persona, Figurita) :-
	not(tiene(Persona, Figurita)),
	figurita(Figurita, rompeCabezas, _),
	findall(OtraFigu, (figurita(OtraFigu, rompeCabezas, _), OtraFigu \= Figurita, tiene(Persona, OtraFigu)), OtrasRompeCabezas),OtrasRompeCabezas \= [].

leFaltaSoloEsa(Persona, Figurita) :-
    findall(Figuritas, (figurita(Figuritas, _, _), not(tiene(Persona, Figuritas))), Faltantes),
    Faltantes = [Figurita].

%11- 
esAmenaza(Persona) :-
    haceNegocio(Persona, _, _, _),
    forall(canje(Persona, OtraPersona, _), saleGanando(Persona, OtraPersona)).

saleGanando(Persona, Otra) :-
    findall(F, canje(Persona, Otra, F), FigusQueDa),
    findall(F, canje(Otra, Persona, F), FigusQueRecibe),
    leResultaInteresante(Persona, FigusQueRecibe, PuntosRecibe),
    leResultaInteresante(Otra, FigusQueDa, PuntosDa),
    PuntosRecibe > PuntosDa.

% 12-
posibleCanje(PersonaDa, PersonaRecibe, Da, Recibe, Estilo) :-
	canjeValido(PersonaDa, PersonaRecibe, Da),
    estilo(PersonaDa, PersonaRecibe, Da, Recibe, Estilo).
     
estilo(_, PersonaRecibe, _, Recibe, clasico):-
    forall(member(Figuritas, Recibe), not(tiene(PersonaRecibe, Figuritas))).

estilo(PersonaDa, _, Da, _, descartador):-
	figuritasRepetidas(PersonaDa, FiguritasRepetidas),
    forall(member(Figuritas, Da), member(Figuritas, FiguritasRepetidas)).

estilo(_, _, _, Recibe, cazafortunas):-
	member(Figurita, Recibe),
	esValiosa(Figurita).

estilo(_, PersonaRecibe, _, Recibe, urgido):-
	member(Figurita, Recibe),
	necesitaConUrgencia(PersonaRecibe, Figurita).



