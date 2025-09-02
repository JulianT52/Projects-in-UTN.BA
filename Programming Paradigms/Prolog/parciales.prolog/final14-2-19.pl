% Parte A
% La fábrica de muebles Armando requiere de su manejo de stock de los productos que realiza en sus distintos locales. 
% Manejan los siguientes productos:
% Sillones: que tiene un tipo (común, cama, reclinable) y cantidad de módulos
% Mesas: forma (rectangular, cuadrada, circular) y material (madera, vidrio)
% Sillas: material (metal, madera)
% Se tiene la siguiente base de conocimiento:

%stock(sucursal, producto, cantidad)
stock(boedo, sillon(comun, 3), 4).
stock(boedo, silla(madera), 12).
stock(flores, sillon(cama, 2), 1).
stock(flores, sillon(reclinable,1),1).
stock(flores, silla(metal), 4).
stock(belgrano, sillon(reclinable, 2), 3).
stock(belgrano, silla(madera), 8).


% Realizar la codificación y las justificaciones para cada punto:
% Sabiendo que tenemos los siguientes clientes: 
% Mati, que busca una mesa circular de vidrio y 4 sillas de metal. 
% Leo, que busca un sillón cama de 2 módulos y otro reclinable de 1. 
% Agregar la información a la base de conocimientos, sabiendo que se debe poder responder la consulta “¿Qué busca Leo?” (por ejemplo). 
% ¿Hace falta usar listas para representar la información? Si es posible, hacerlo sin usar listas y explicar los conceptos que lo permiten, 
% y en caso contrario hacerlo con listas y explicar por qué son necesarias.

busca(mati, silla(metal),4).
busca(mati, mesa(circular,vidrio),1).
busca(leo, sillon(cama, 2),1).
busca(leo, sillon(reclinable, 1),1).

% No hace falta utilizar listas, podemos declarar como que lo que busca son dos predicados completamente diferentes y evitarnos el uso de listas.
% lo que nos permite utilizarlo sin listas, son los functores, yo puedo definir un hecho y caracterizarlo segun la cantidad de parametros que yo decida


% Saber si una sucursal trabaja un determinado material. Trabaja el mismo si alguno de sus artículos son de ese material, 
% y se sabe que todos los sillones que trabajan son de madera. ¿Qué concepto resalta en la resolución de este punto y dónde puede verse?

trabajaMaterial(Sucursal, madera):-
    stock(Sucursal, sillon(_,_),_).

trabajaMaterial(Sucursal, Material):-
    stock(Sucursal, silla(Material),_).

trabajaMaterial(Sucursal, Material):-
    stock(Sucursal, mesa(_,Material), _).

% El concepto que se utiliza es polimorfismo con pattern maching, en caso de que el objeto sea un sillon, se trabajan con ese material
% unicamente si es madera. En otro caso, depende pura y exclusivamente del material del objeto, el hecho de que sea polimorfo, nos permite que
% prolog evalue las condiciones necesarias y trate de matchear por un lado. 


% Saber si hay una sucursal ideal para un cliente, del cual se conoce su nombre y la información que se agregó en los puntos anteriores. 
% Una sucursal es ideal si tiene en stock todo lo que el cliente busca. ¿Qué concepto aparece que no estaba siendo usado antes?

sucursalIdeal(Cliente, Sucursal):-
    busca(Cliente,_,_),
    stock(Sucursal,_,_),
    forall(busca(Cliente,Buscado,CantidadBuscada),(stock(Sucursal, Buscado,Cantidad),Cantidad >= CantidadBuscada)).

% Aparece orden superior en este caso. Se utiliza el forall para corroborar que se cumpla que todo lo que el cliente busca este en la sucursal
