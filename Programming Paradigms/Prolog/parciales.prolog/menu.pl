% De cada restaurante, en caso que se le hayan otorgado estrellas en la guía, se conoce cuántas son y en qué barrio se ubica:

restaurante(panchoMayo, 2, barracas).
restaurante(finoli, 3, villaCrespo).
restaurante(superFinoli, 5, villaCrespo).

% De los restaurantes se sabe qué ofrecen de menú, que pueden tener platos a la carta o por pasos. 
% En el menú a la carta se indica el precio y una descripción del plato. El menú por pasos, diseñado por un chef en conjunto 
% con un sommelier de vino, consta de un número determinado de "pasos", un precio, una lista de vinos y una cantidad estimada 
% de comensales que comparte el menú. 

menu(panchoMayo, carta(1000, pancho)).
menu(panchoMayo, carta(200, hamburguesa)).
menu(finoli, carta(2000, hamburguesa)).
menu(finoli, pasos(15, 15000, [chateauMessi, francescoliSangiovese, susanaBalboaMalbec], 6)).
menu(noTanFinoli, pasos(2, 3000, [guinoPin, juanaDama],3)).

% Y luego, de cada vino se conoce su país de origen y su costo por botella
vino(chateauMessi, francia, 5000).
vino(francescoliSangiovese, italia, 1000).
vino(susanaBalboaMalbec, argentina, 1200).
vino(christineLagardeCabernet, argentina, 5200).
vino(guinoPin, argentina, 500).
vino(juanaDama, argentina, 1000).

% Se pide saber:
% 1. Cuáles son los restaurantes de más de N estrellas por barrio.
% Por ejemplo:
% ¿Cuáles son los restaurantes de mas de 2 estrellas en villa crespo?

restosMasDeNEstrellas(Estrellas, Barrio, Restos):-
    findall(Resto, 
        (restaurante(Resto, Estrella, Barrio), 
        Estrella >= Estrellas), 
        Restos).

restoMasDeNEstrellas(Estrellas, Barrio, Resto):-
    restaurante(Resto, Estrella, Barrio),
    Estrella >= Estrellas.


% 2. Cuáles son los restaurantes sin estrellas.
% Por ejemplo:
% ¿Cuáles son los restaurantes sin estrellas? 

restoDe0Estrellas(Resto):-
    menu(Resto, _),
    not(restaurante(Resto,_,_)).

% 3. Si un restaurante está mal organizado, que es cuando tiene algún menú que tiene más pasos que la cantidad de vinos disponibles o 
% cuando tiene en su menú a la carta dos veces una misma comida con diferente precio.

estaMalOrganizado(Resto):-
    menu(Resto, carta(Precio,Comida)),
    menu(Resto, carta(Precio2,Comida)),
    Precio \= Precio2.

estaMalOrganizado(Resto):-
    menu(Resto, pasos(CantidadPasos,_,Vinos,_)),
    length(Vinos, CantVinos),
    CantVinos < CantidadPasos.

% 4.Qué restaurante es copia barata de qué otro restaurante, lo que sucede cuando el primero tiene todos los platos 
% a la carta que ofrece el otro restaurante, pero a un precio menor. Además, no puede tener más estrellas que el otro.

copiaBarata(Copia, Original):-
    restoMenosEstrellas(Copia, Original),
    mismoPlatoMenosPrecio(Copia, Original).

restoMenosEstrellas(Copia, Original):-
    restaurante(Copia, EstrellasCopia, _),
    restaurante(Original, EstrellasOriginal, _),
    Copia \= Original,
    EstrellasOriginal > EstrellasCopia.

mismoPlatoMenosPrecio(Copia, Original):-
    forall(menu(Original, carta(PrecioOriginal, Plato)), 
        (menu(Copia, carta(PrecioCopia, Plato)), PrecioOriginal > PrecioCopia)). 

% 5. Cuál es el precio promedio de los menúes de cada restaurante, por persona. 
% En los platos, se considera el precio indicado ya que se asume que es para una persona.
% En los menú por pasos, el precio es el indicado más la suma de los precios de todos los vinos incluidos, 
% pero dividido en la cantidad de comensales. Los vinos importados pagan una tasa aduanera del 35% por sobre su precio publicado.

precioPromedio(Resto, PrecioFinal):-
    findall(Precio, menu(Resto, carta(Precio, _)), Precios),
    length(Precios, CantPlatos),
    CantPlatos > 0,  
    sumlist(Precios, PrecioComida),
    PrecioFinal is PrecioComida / CantPlatos.

precioPromedio(Resto, PrecioFinal):-
    menu(Resto, pasos(_, Precio, ListaVinos, CantComensales)),
    CantComensales > 0,
    findall(PrecioVino, (member(Vino, ListaVinos), precioVino(Vino, PrecioVino)), PreciosVinos),
    sumlist(PreciosVinos, CostoPorVino),
    PrecioFinal is (Precio + CostoPorVino) / CantComensales.
    
precioVino(NombreVino, Precio):-
    vino(NombreVino, argentina, Precio).

precioVino(NombreVino, Precio):-
    vino(NombreVino,Pais,P),
    Pais \= argentina,
    Precio is P * 1.35.