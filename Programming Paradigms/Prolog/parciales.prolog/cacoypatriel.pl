
% 1. Eleji esta debido a que es la mas declarativa y utiliza functores como principal solucion

cancion(mumbai, duracion(2,28),caco).
cancion(mumbai, duracion(2,28),patriel).
cancion(toroRoto, duracion(3,7),caco).
cancion(toroRoto, duracion(3,7),patriel).
cancion(toroRoto, duracion(3,7),nathyPelusa).
cancion(hashtagJetas, duracion(2,29),caco).
cancion(hashtagJetas, duracion(2,29),patriel).

% 2. 

esMusico(Musico):-
    cancion(_,_,Musico).

participa(Cancion, Musico):-
    cancion(Cancion,_,Musico).

% 3. No hace falta agregar ningun predicado debido a que prolog trabaja con el principio de universo cerrado, cualquier cosa que no se
% declare como hecho, es tomado como falso. 

% 4. No es la mejor manera de plantear las cosas, puede obviarse el uso de listas y simplemente utilizar un forall para buscar que no haya ninguna
% cancion en la que hayan estado juntos

noTocoConCacoYCatriel(Musico):-
    cancion(Cancion,_,Musico),
    forall(cancion(Cancion,_,Musico),(not(cancion(Cancion,_ , caco)),not(cancion(Cancion,_ ,patriel)))).

% 5. El codigo funciona bien, sin embargo, podria erradicarse el findall y simplemente hacerse con un doble participa

sabeDeMusica(Musico):-
    esMusico(Musico),
    tieneHitazo(Musico),
    participa(Cancion1, Musico),
    participa(Cancion2, Musico),
    Cancion1 \= Cancion2.

tieneHitazo(Musico):-
    cancion(Cancion,_,Musico),
    hitazo(Cancion).

% 6. disco(Disco, Cancion)

esCorto(Disco):-
    disco(Disco, _),
    forall(disco(Disco,Cancion),(cancion(Cancion, duracion(Minutos, _)), Minutos < 3)).

% 7. El polimorfismo se encuentra utilizado en la definicion de recaudacion, segun cada regla, prolog evalua ingresar en cada una de las condiciones
% con esto nos ahorramos definir un tipo de predicado diferente segun el tipo de evento en el que se haya hosteado, es decir, si queremos ver, cuanto
% se recaudo en el gran Res es distinto al de Old Boys, por lo tanto, si lo recaudado es distinto segun el lugar donde se haya hecho, cada uno
% de los hechos se encarga de definir de manera diferente las recaudaciones. Se repite logica en cuanto al teatro, el gran Res tiene un costo de 0
% por lo tanto, no haria falta declarar nuevamente que nuestra recaudacion es 100000, con el simple hecho que sea teatro puede entrar por esa rama
% y con las cuentas correspondientes dara 100000.

% 8. 

recital(2012, salaDeEnsayo).

recaudacion(Anio, 0):-
    recital(Anio, salaDeEnsayo).