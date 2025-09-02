% Se conocen los platos que ofrece cada restaurante, y se sabe que se considera bodegón a un restaurante si todos sus platos 
% tienen precio menor a $300 y además ofrece mila.

% plato(restaurante, plato, precio)
plato(laAngioplastia,mila,180).
plato(laAngioplastia,bife,230).
plato(laAngioplastia,molleja,220).
plato(lasVioletas,bife,450).
plato(elCuartito,muzza,290).

bodegon(Restaurante):-
   not((plato(Restaurante,_,Precio),Precio >= 300)).

bodegon(Restaurante):-
    tieneMila(Restaurante).

tieneMila(Restaurante):-
   findall(Plato, plato(Restaurante,Plato,_), Platos),
   member(mila,Platos).


% Responda verdadero o falso y justifique en todos los casos:
% Hay que usar forall para solucionar el error de lógica del predicado bodegon/1.

% Falso, utilizar forall no soluciona el error de logica, la solucion seria unificar las soluciones, se esta planteando que un bodegon, es bodegon
% si vende milanesas o si no hay ningun plato que supere los 300. La solucion radicaria en plantearlo todo junto

% El predicado bodegon/1 es inversible.

% Falso, la presencia de un not, quita toda inversibilidad posible, si no estuviera el not, el predicado seria inversible

% Critique la solución en términos de declaratividad y expresividad.

% En cuanto a declaratividad, es mejorable, sin embargo considero correcta la declaratividad de la funcion, podria ponerse el nombre de la funcion
% esBodegon en vez de bodegon y utilizarse otra manera de resolver sin utilizar findall. En cuanto a la expresividad, el findall de tieneMila arruina
% un poco ese concepto, sin embargo, se puede solucionar simplemente poniendo que mila este en las opciones del restaurante

% Proponga una solución que resuelva los problemas encontrados en los puntos anteriores.

esBodegon(Restaurante):-
    tienePlatosBaratos(Restaurante),
    tieneMila(Restaurante).

tienePlatosBaratos(Restaurante):-
    plato(Restaurante,_,_),
    not((plato(Restaurante,_,Precio),Precio >= 300)).

tieneMila(Restaurante):-
    plato(Restaurante, mila, _).
