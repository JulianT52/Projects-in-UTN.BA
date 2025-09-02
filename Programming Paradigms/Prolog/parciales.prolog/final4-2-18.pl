% Dados los siguientes predicados:
% acuerdo(pais_que_vende, pais_que_compra, cosa)
acuerdo(argentina, china, trigo).
acuerdo(argentina, rusia, trigo).
acuerdo(eeuu, argentina, carne).
acuerdo(china, rusia, arroz).
acuerdo(argentina, francia, carne).
acuerdo(argentina, brasil, carne).
acuerdo(francia, arabia, carne).
acuerdo(brasil, zimbabwe, carne).


% 1. Queremos reflejar que no hubo acuerdo entre EEUU y China por el comercio de armas. ¿Cómo reflejaría esto en la base de conocimiento? 
% Justifique relacionándolo con algún concepto.

% No es necesario expresarlo como un hecho o como una negacion de un acuerdo debido a que prolog trabaja bajo el principio de universo cerrado
% es decir, cualquier predicado que este por fuera de la base de conocimiento adquirida, es descartado y tomado como falso, por lo tanto, si
% queremos establecer que no hubo un acuerdo por las armas, basta con no declararlo

% 2. Resuelva el predicado recibe(Pais1, Pais2), que indica si el segundo país puede recibir algo del primero.

recibe(Pais1, Pais2):-
    acuerdo(Pais1, Pais2, _).

recibe(Pais1, Pais2):-
    acuerdo(Pais1, Intermedio, Comercializado),
    recibe(Intermedio, Pais2).

% Por ejemplo, Argentina recibe carne de EEUU por el acuerdo que firmaron. Pero también podría pasar que Brasil reciba de EEUU indirectamente. 
% 3. Contemplar los casos posibles.
% Indicar qué concepto entra en juego en su solución para determinar que hay una relación entre EEUU y Zimbabwe por la carne.

% Entra en juego la recursividad, ya que luego de analizar con quien intercambia estados unidos, busco mas relaciones hasta llegar a zimbabwe 
% gracias a la recursion de la funcion recibe

% Se necesita verificar, a partir de los predicados que ya tenemos, si algún país no tiene ningún acuerdo con ningún otro. 

noRecibe(Pais1):-
    acuerdo(Pais1,_,_),
    not(recibe(Pais1,_)).

% Si es posible, realizar la consulta y justificar conceptualmente. Si no es posible, indicar por qué.
