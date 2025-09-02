% Parte 1 - Sombrero Seleccionador
% Para determinar en qué casa queda una persona cuando ingresa a Hogwarts, el Sombrero Seleccionador tiene en 
% cuenta el carácter de la persona, lo que prefiere y en algunos casos su status de sangre.

% Tenemos que registrar en nuestra base de conocimientos qué características tienen los distintos magos 
% que ingresaron a Hogwarts, el status de sangre que tiene cada mago y en qué casa odiaría quedar. Actualmente sabemos que:

% Harry es sangre mestiza, y se caracteriza por ser corajudo, amistoso, orgulloso e inteligente. Odiaría que el sombrero lo mande a Slytherin.
% Draco es sangre pura, y se caracteriza por ser inteligente y orgulloso, 
% pero no es corajudo ni amistoso. Odiaría que el sombrero lo mande a Hufflepuff.
% Hermione es sangre impura, y se caracteriza por ser inteligente, orgullosa y responsable. No hay ninguna casa a la que odiaría ir.
% Además nos interesa saber cuáles son las características principales que el sombrero tiene en cuenta para elegir

mago(harry, mestiza).
mago(draco, pura).
mago(hermoine, impura).

cualidadMago(harry, coraje).
cualidadMago(harry, amistoso).
cualidadMago(harry, orgulloso).
cualidadMago(harry, inteligente).
cualidadMago(draco, inteligente).
cualidadMago(harry, orgulloso).
cualidadMago(hermione, inteligente).
cualidadMago(hermione, orgullosa).
cualidadMago(hermione, responsable).

odiaCasa(harry, slytherin).
odiaCasa(draco, hufflepuff).

% Para Gryffindor, lo más importante es tener coraje.
% Para Slytherin, lo más importante es el orgullo y la inteligencia.
% Para Ravenclaw, lo más importante es la inteligencia y la responsabilidad.
% Para Hufflepuff, lo más importante es ser amistoso.

necesidadParaCasa(gryffindor, coraje).
necesidadParaCasa(slytherin, orgullo).
necesidadParaCasa(slytherin, inteligencia).
necesidadParaCasa(ravenclaw, inteligencia).
necesidadParaCasa(ravenclaw, responsabilidad).
necesidadParaCasa(hufflepuff, amistoso).


% Se pide:
% 1. Saber si una casa permite entrar a un mago, lo cual se cumple para cualquier mago y cualquier casa excepto 
% en el caso de Slytherin, que no permite entrar a magos de sangre impura.

puedeEntrar(Mago, Casa):-
    mago(Mago,_),
    necesidadParaCasa(Casa, _),
    condicion(Casa, Mago).

condicion(Casa, _):-
    Casa \= slytherin.

condicion(slytherin, Mago):-
    mago(Mago,Sangre),
    Sangre \= impura.


% Saber si un mago tiene el carácter apropiado para una casa, lo cual se cumple para cualquier mago 
% si sus características incluyen todo lo que se busca para los integrantes de esa casa, independientemente de si la casa le permite la entrada.

caracterApropiado(Mago, Casa):-
    cualidadMago(Mago,Caracteristica),
    necesidadParaCasa(Casa, Necesidad),
    Caracteristica == Necesidad.
    


% Determinar en qué casa podría quedar seleccionado un mago sabiendo que tiene que tener el carácter adecuado 
% para la casa, la casa permite su entrada y además el mago no odiaría que lo manden a esa casa.

podriaEntrar(hermione, gryffindor).

podriaEntrar(Mago, Casa):-
    puedeEntrar(Mago, Casa),
    caracterApropiado(Mago, Casa),
    not(odiaCasa(Mago, Casa)).

% Además Hermione puede quedar seleccionada en Gryffindor, porque al parecer encontró una forma de hackear al sombrero.
% Definir un predicado cadenaDeAmistades/1 que se cumple para una lista de magos si todos ellos se caracterizan 
% por ser amistosos y cada uno podría estar en la misma casa que el siguiente. 
% No hace falta que sea inversible, se consultará de forma individual.



cadenaDeAmistades([Mago,Mago1]):-
    cadena(Mago, Mago1).


cadena(Mago,Mago1):- 
    cualidadMago(Mago, amistad),
    cualidadMago(Mago1, amistad),
    podriaEntrar(Mago, Casa),
    podriaEntrar(Mago1, Casa).

cadena([Mago1, Mago2 | Magos]):-
    cadena(Mago2, Magos),
    cadenaDeAmistades([Mago2 | Magos]).



