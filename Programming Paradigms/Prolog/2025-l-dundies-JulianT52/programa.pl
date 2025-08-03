%consumoDeCafe/2 -> Empleado, Cant

consumoDeCafe(michael, 2).
consumoDeCafe(dwight,5).
consumoDeCafe(angela,1).
consumoDeCafe(jim,2).
consumoDeCafe(kevin,0).
consumoDeCafe(oscar,1).
consumoDeCafe(toby,30).
consumoDeCafe(phyllis,4).
consumoDeCafe(ryan,2).
consumoDeCafe(kelly,3).
consumoDeCafe(andy,3).
consumoDeCafe(stanley,4).
consumoDeCafe(meredith,1).
consumoDeCafe(erin,0).
consumoDeCafe(darryl,0).
consumoDeCafe(pam, 2).
%importancia/2 -> Dundie, Importancia

importancia(mejorJefeDelMundo,100).
importancia(sensei,5).
importancia(jimothy,10).
importancia(mejorPapa,15).
importancia(mejorMama,15).
importancia(masPequenia,10).
importancia(zapatosBlancos,30).
importancia(masAtractivoDeLaOficina,20).
importancia(mejorCoqueteo,10).
importancia(crucigrama,15).
importancia(peorVendedor,5).
importancia(abejaMasOcupada,10).
importancia(compromisoMasLargo,15).
%importancia/2 -> Dundie, Importancia

importancia(mejorJefeDelMundo,100).
importancia(sensei,5).
importancia(jimothy,10).
importancia(mejorPapa,15).
importancia(mejorMama,15).
importancia(masPequenia,10).
importancia(zapatosBlancos,30).
importancia(masAtractivoDeLaOficina,20).
importancia(mejorCoqueteo,10).
importancia(crucigrama,15).
importancia(peorVendedor,5).
importancia(abejaMasOcupada,10).
importancia(compromisoMasLargo,15).

consumoExcesivoDeCafe(Empleado):-
   consumoDeCafe(Empleado, Cant),
   Cant > 10.

ganadorDundie(michael,mejorJefeDelMundo).
ganadorDundie(meredith,mejorMama).
ganadorDundie(dwight,peorVendedor).
ganadorDundie(pam,zapatosBlancos).

ganadorDundie(kelly, masPequenia).
ganadorDundie(kevin, mejorCoqueteo).
ganadorDundie(andy, sensei).
ganadorDundie(erin, crucigrama).
ganadorDundie(oscar, compromisoMasLargo).

empleado(Empleado):-
    consumoDeCafe(Empleado,_).

nuncaGanoNada(Empleado):-
    empleado(Empleado),
    not(ganadorDundie(Empleado, Premio)).
