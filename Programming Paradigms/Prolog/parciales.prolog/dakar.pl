

%auto(modelo)
%moto(anioDeFabricacion, suspensionesExtras)
%camion(items)
%cuatri(marca)

ganador(1997,peterhansel,moto(1995, 1)).
ganador(1998,peterhansel,moto(1998, 1)).
ganador(2010,sainz,auto(touareg)).
ganador(2010,depress,moto(2009, 2)).
ganador(2010,karibov,camion([vodka, mate])).
ganador(2010,patronelli,cuatri(yamaha)).
ganador(2011,principeCatar,auto(touareg)).
ganador(2011,coma,moto(2011, 2)).
ganador(2011,chagin,camion([repuestos, mate])).
ganador(2011,patronelli,cuatri(yamaha)).
ganador(2012,peterhansel,auto(countryman)).
ganador(2012,depress,moto(2011, 2)).
ganador(2012,deRooy,camion([vodka, bebidas])).
ganador(2012,patronelli,cuatri(yamaha)).
ganador(2013,peterhansel,auto(countryman)).
ganador(2013,depress,moto(2011, 2)).
ganador(2013,nikolaev,camion([vodka, bebidas])).
ganador(2013,patronelli,cuatri(yamaha)).
ganador(2014,coma,auto(countryman)).
ganador(2014,coma,moto(2013, 3)).
ganador(2014,karibov,camion([tanqueExtra])).
ganador(2014,casale,cuatri(yamaha)).
ganador(2015,principeCatar,auto(countryman)).
ganador(2015,coma,moto(2013, 2)).
ganador(2015,mardeev,camion([])).
ganador(2015,sonic,cuatri(yamaha)).
ganador(2016,peterhansel,auto(2008)).
ganador(2016,prince,moto(2016, 2)).
ganador(2016,deRooy,camion([vodka, mascota])).
ganador(2016,patronelli,cuatri(yamaha)).
ganador(2017,peterhansel,auto(3008)).
ganador(2017,sunderland,moto(2016, 4)).
ganador(2017,nikolaev,camion([ruedaExtra])).
ganador(2017,karyakin,cuatri(yamaha)).
ganador(2018,sainz,auto(3008)).
ganador(2018,walkner,moto(2018, 3)).
ganador(2018,nicolaev,camion([vodka, cama])).
ganador(2018,casale,cuatri(yamaha)).
ganador(2019,principeCatar,auto(hilux)).
ganador(2019,prince,moto(2018, 2)).
ganador(2019,nikolaev,camion([cama, mascota])).
ganador(2019,cavigliasso,cuatri(yamaha)).

pais(peterhansel,francia).
pais(sainz,espania).
pais(depress,francia).
pais(karibov,rusia).
pais(patronelli,argentina).
pais(principeCatar,catar).
pais(coma,espania).
pais(chagin,rusia).
pais(deRooy,holanda).
pais(nikolaev,rusia).
pais(casale,chile).
pais(mardeev,rusia).
pais(sonic,polonia).
pais(prince,australia).
pais(sunderland,reinoUnido).
pais(karyakin,rusia).
pais(walkner,austria).
pais(cavigliasso,argentina).

% Agregar la siguiente información a la base de conocimientos:
% La marca peugeot tiene los modelos 2008 y 3008 de autos. El countryman es modelo de auto marca mini, touareg es marca volkswagen, 
% y hilux es de marca toyota.
% Teórico: ¿Qué debo agregar si quiero decir que el modelo buggy es marca mini pero el modelo dkr no lo es? Justificar conceptualmente.

marca(peugeot, 2008).
marca(peugeot, 3008).
marca(mini, countryman).
marca(volkswagen, touareg).
marca(toyota, hilux).

% Para agregar, debo simplemente declararlo como un hecho. En cambio, si quiero poner que algo no es un auto o no es de una marca 
% en especifico, basta con no agregarlo, debido al principio de universo cerrado, Prolog solo trabaja con hechos presentes en el codigo
% y no especula o inventa resultados

% 2. Codificar los siguientes predicados: ganadorReincidente/1. Se cumple para aquel competidor que ganó en más de un año.

ganadorReincidente(Competidor):-
    ganador(Anio, Competidor, _),
    ganador(OtroAnio, Competidor, _),
    Anio \= OtroAnio.

% 3.inspiraA/2. Un conductor resulta inspirador para otro cuando ganó y el otro no, y también resulta inspirador 
% cuando ganó algún año anterior al otro. En cualquier caso, el inspirador debe ser del mismo país que el inspirado.

inspiraA(Inspirador, Inspirado):-
   Inspirador \= Inspirado,
   esDelMismoPais(Inspirador, Inspirado),
   ganador(_,Inspirador,_),
   not(ganador(_,Inspirado,_)).

inspiraA(Inspirador, Inspirado):-
    Inspirador \= Inspirado,
    esDelMismoPais(Inspirador, Inspirado),
    ganador(Anio1, Inspirador, _),
    ganador(Anio2, Inspirado, _),
    Anio1 < Anio2.

esDelMismoPais(Inspirador, Inspirado):-
   pais(Inspirador, PaisInspirador),
   pais(Inspirado, PaisInspirado),
   PaisInspirado == PaisInspirador.


% 4. marcaDeLaFortuna/2. Relaciona un conductor con una marca si sólo ganó con vehículos de esa marca. 
% Si un conductor nunca ganó, no debe tener marca de la fortuna.
% La marca de un auto se obtiene a partir del modelo del auto. 
% La marca de las motos dependen del año de fabricación: las fabricadas a partir del 2000 inclusive son ktm, las anteriores yamaha.
% La marca de los camiones es kamaz si lleva vodka, sino la marca es iveco.
% La marca del cuatri se indica en cada uno.

marcaDeLaFortuna(Conductor, Marca):-
    ganador(_,Conductor,Vehiculo),
    marcaVehiculo(Vehiculo, Marca),
    forall(ganador(_,Conductor, Automovil),marcaVehiculo(Automovil, Marca)).

marcaVehiculo(cuatri(Marca), Marca).

marcaVehiculo(auto(Modelo),Marca):-
    marca(Marca,Modelo).

marcaVehiculo(motos(Anio, _),yamaha):-
    Anio < 2000.

marcaVehiculo(motos(Anio,_),ktm):-
    Anio >= 2000.

marcaVehiculo(camion(Items), kamaz):-
    member(Elegido, Items),
    Elegido == vodka.

marcaVehiculo(camion(Items), iveco):-
    member(Elegido, Items),
    Elegido \= vodka.


% 5.heroePopular/1. Decimos que un corredor es un héroe popular cuando sirvió de inspiración a alguien, y además el año que 
% salió ganador fue el único de los conductores ganadores que no usó un vehículo caro.
% Un vehículo es caro cuando es de una marca cara (por ahora las caras son mini, toyota e iveco), o tiene al menos tres suspensiones extras. 
% La cantidad de suspensiones extras que trae una moto se indica en cada una, los cuatri llevan siempre 4, y los otros vehículos ninguna.

heroePopular(Corredor):-
    inspiraA(Corredor, _),
    ganador(Anio, Corredor, Vehiculo),
    not(vehiculoCaro(Vehiculo)),
    forall(
        (ganador(Anio, Corredor2, Vehiculo2), 
        Corredor2 \= Corredor), 
        vehiculoCaro(Vehiculo2)).

vehiculoCaro(Vehiculo):-
    marcaVehiculo(Vehiculo, Marca),
    marcaCara(Marca).

vehiculoCaro(Vehiculo):-
    suspensionesVehiculo(Vehiculo, Cantidad),
    Cantidad > 3.

suspensionesVehiculo(moto(_,Suspensiones), Suspensiones).

suspensionesVehiculo(cuatri(_),4).

marcaCara(mini).
marcaCara(toyota).
marcaCara(iveco).