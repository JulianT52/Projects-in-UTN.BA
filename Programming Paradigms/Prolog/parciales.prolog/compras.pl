% COMPRAS EN EL SUPER

marca(cindor, laSerenisima).
marca(latuna, nereida).
marca(serenito, laSerenisima).

cliente(Cliente):-compro(Cliente, _).

compro(martina, latuna).
compro(martina, cindor).
compro(aye, cindor).
compro(aye, serenito).

esObsesivo(Cliente):-
compro(Cliente, Producto),
marca(Producto, Marca),
not((
    compro(Cliente, OtroProducto),
    marca(OtroProducto, OtraMarca), 
    OtraMarca\= Marca
    )).


%No voy en tren, voy en avión
%Tenemos un predicado viaja/2 que relaciona a una persona con un medio de transporte que utiliza. El medio de transporte puede ser: 
%Avión, que tiene una aerolínea, una duración (en minutos), y un tipo de vuelo que puede ser internacional o doméstico. 
%Tren, que tiene un trayecto (por ejemplo, "retiroRosario"), y una velocidad promedio en km/h. 
%Bicicleta, que simplemente tiene un tipo (como por ejemplo urbana, deMontaña, etc.). Ejemplos de base de:

viaja(lola, avion(latam, 180, internacional)).
viaja(lola, bicicleta(urbana)).
viaja(fran, tren(retiroRosario, 90)).
viaja(fran, avion(aerolineas, 90, doméstico)).
viaja(fran, tren(cabaLujan, 70)).
viaja(lucia, avion(united, 300, internacional)).

noEsSustentable(Persona):-
  findall(A, (viaja(Persona, avion(A,_,internacional))), Aviones), %Encuentra todos los viajes de Persona en avion con destino internacional desde "A"
  findall(T, (viaja(Persona, tren(T,_))), Trenes), %Encuentra todos los viajes de Persona en Tren desde "T"
  findall(V, (viaja(Persona, V)), Todos), %Encuentra todos los viajes de Persona
  length(Aviones, CAviones), 
  length(Trenes, CTrenes),
  length(Todos, CTodos),
  CTodos is CAviones + CTrenes.

%En este codigo se trata de plantear que la cantidad de viajes que se realizan en total sean sustentables, es decir si se tiene la misma cantidad
%de viajes en tren y avion que en total quiere decir que noEsSustentable
%No es Declarativa, el nombre de las variables no es claro y el hecho de que haya tantos findall puede llegar a confundir a una persona que no
%posee conocimiento del codigo. Tampoco usa polimorfismo, solamente hay un caso contemplado para los 3 casos. 

cantidadDeViajesEnAvion(Persona,ViajesAvion):-
    findall(Avion,(viaja(Persona, avion(Avion,_,internacional))), Aviones),
    length(Aviones,ViajesAvion).

cantidadDeViajesEnTren(Persona, ViajesTren):-
    findall(Tren,(viaja(Persona, tren(Tren,_))), Trenes),
    length(Trenes,ViajesTren).

cantidadDeViajesTotales(Persona, ViajesTotales):-
    findall(Totales,(viaja(Persona, Totales)), Todos),
    length(Todos,ViajesTotales).

noEsSustentable2(Persona):-
    cantidadDeViajesEnAvion(Persona,ViajesAvion),
    cantidadDeViajesEnTren(Persona,ViajesTren),
    cantidadDeViajesTotales(Persona,ViajesTotales),
    ViajesTotales is ViajesAvion + ViajesTren.


    






