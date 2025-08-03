{-https://docs.google.com/document/d/1KFpqK-7iY1UHnfymXrihNH7P8B9WymdiyIlS6JYDM7M/edit?tab=t.0#heading=h.bzijjzpynqq4-}

module Library where
import PdePreludat

doble :: Number -> Number
doble numero = numero + numero

type Ruedas = Number
type Chasis = Number
type Desgaste = (Ruedas, Chasis)

data UnAuto = UnAuto {
    marca :: String,
    modelo :: String,
    desgaste :: Desgaste,
    velocidadMax :: Number,
    tiempoCarrera :: Number,
    apodos :: [String]
} deriving (Show, Ord, Eq)

data GrupoAutos = GrupoAutos{
    grupos :: [UnAuto]
}deriving (Show,Ord,Eq)

data Tramo = Curva {angulo :: Number, longitudCurva :: Number}
    | Recto {longitudRecto :: Number }
    | ZigZag {cantCambios :: Number }
    | Rulo {diametro :: Number }
    deriving (Show,Ord,Eq)

data Equipo = Equipo {
    nombreEquipo :: String, 
    autos :: [UnAuto],
    presupuesto :: Number
} deriving (Show,Ord,Eq)

--Curvas
curvaPeligrosa :: Tramo
curvaPeligrosa = Curva 60 300

curvaTranca :: Tramo
curvaTranca = Curva 110 550

--Rectos
tramoRectoClassic :: Tramo
tramoRectoClassic = Recto 715 

tramito :: Tramo
tramito = Recto 260

--ZigZags
zigZagLoco :: Tramo
zigZagLoco = ZigZag 5

casiCurva :: Tramo
casiCurva = ZigZag 1

--Rulos
ruloClasico :: Tramo
ruloClasico = Rulo 13

deseoDeMuerte :: Tramo
deseoDeMuerte = Rulo 26

ferrari :: UnAuto
ferrari = UnAuto {marca = "Ferrari", modelo = "F50", desgaste = (0,0), velocidadMax = 65, tiempoCarrera = 0, apodos = ["La Nave", "El fierro", "Ferrucho"]}

ferrari2:: UnAuto
ferrari2 = UnAuto {marca = "Ferrari", modelo = "F50", desgaste = (0,0), velocidadMax = 65, tiempoCarrera = 0, apodos = ["La Nave", "El fierro", "Ferrucho"]}

lamborghini :: UnAuto
lamborghini = UnAuto {marca = "Lamborghini", modelo = "Diablo", desgaste = (4,7), velocidadMax = 73, tiempoCarrera = 0, apodos = ["Lambo", "La bestia"]} 

fiat :: UnAuto
fiat = UnAuto {marca = "Fiat", modelo = "600", desgaste = (27, 33), velocidadMax = 44, tiempoCarrera = 0, apodos = ["La bocha", "La bolita", "Fitito"]}

peugeot :: UnAuto
peugeot = UnAuto {marca = "Peugeot", modelo = "504", desgaste = (0,0), velocidadMax = 40, tiempoCarrera = 0, apodos = ["El rey del desierto"]} 

-- ESTADO DE SALUD DEL AUTO

{-2a-}
estaEnBuenEstado :: UnAuto -> Bool
estaEnBuenEstado auto 
    | marca auto == "Peugeot" = False
    | otherwise = noEsPeugeotEstado auto

noEsPeugeotEstado :: UnAuto -> Bool
noEsPeugeotEstado auto 
    | tiempoCarrera auto < 100 = desgasteChasis auto < 20
    | otherwise = estaEnBuenEstadoSegunDesgaste auto

estaEnBuenEstadoSegunDesgaste :: UnAuto -> Bool
estaEnBuenEstadoSegunDesgaste auto = desgasteChasis auto < 40 && desgasteRuedas auto < 60 

desgasteChasis :: UnAuto -> Number
desgasteChasis auto = snd (desgaste auto)

desgasteRuedas :: UnAuto -> Number
desgasteRuedas auto = fst (desgaste auto)

{-2b-}
empiezaConLa :: String -> Bool
empiezaConLa apodo = take 3 apodo == "La "

tieneApodoConLa :: [String] -> Bool
tieneApodoConLa listaDeApodos = empiezaConLa (head listaDeApodos)

tieneChasisGastado :: UnAuto -> Bool
tieneChasisGastado auto = desgasteChasis auto > 80

tieneRuedasGastadas :: UnAuto -> Bool
tieneRuedasGastadas auto = desgasteRuedas auto > 80

autoNoDaMas :: UnAuto -> Bool
autoNoDaMas auto = (tieneApodoConLa (apodos auto) && tieneChasisGastado auto) || tieneRuedasGastadas auto 

{-2c-}
esUnChiche :: UnAuto -> Bool
esUnChiche auto
 | desgasteChasis auto < 20 && tieneCantPar auto = True 
 | desgasteChasis auto < 50 && not(tieneCantPar auto) = True 
 | otherwise = False

tieneCantPar :: UnAuto -> Bool
tieneCantPar auto = even (length (apodos auto)) 

{-2d-}
esUnaJoya :: UnAuto -> Bool
esUnaJoya auto = noTieneDesgaste auto && length (apodos auto) == 1 

noTieneDesgaste :: UnAuto -> Bool
noTieneDesgaste auto = (desgasteChasis auto == 0) && (desgasteRuedas auto == 0) 
 
{-2e-}
nivelDeChetez :: UnAuto -> Number
nivelDeChetez auto = 20 * length (apodos auto) * length (modelo auto) 

{-2f-}
capacidadSuperCaliFragilisticaEspialidosa :: UnAuto -> Number
capacidadSuperCaliFragilisticaEspialidosa auto = length (head(apodos auto)) 

{-2g-}
calcularRiesgoAuto :: UnAuto -> Number
calcularRiesgoAuto auto 
 | estaEnBuenEstado auto = riesgoAutoEnBuenEstado auto
 | otherwise = doble (riesgoAutoEnBuenEstado auto)

riesgoAutoEnBuenEstado :: UnAuto -> Number
riesgoAutoEnBuenEstado auto = velocidadMax auto * 0.1 * desgasteRuedas auto 


{-MANOS A LA OBRA-}

{-3a-}
repararUnAuto :: UnAuto -> UnAuto
repararUnAuto auto = auto {desgaste = (0, desgasteChasis auto* 0.15)} 

{-3b-}
aplicarPenalidad :: UnAuto -> Number -> UnAuto
aplicarPenalidad auto numero = auto { tiempoCarrera = tiempoCarrera auto + numero }

{-3c-}
ponerleNitro :: UnAuto -> UnAuto
ponerleNitro auto = auto {velocidadMax = agregar20Porciento (velocidadMax auto)}

agregar20Porciento :: Number -> Number
agregar20Porciento velocidad = velocidad + velocidad *0.20

{-3d-}
bautizarAuto :: String -> UnAuto -> UnAuto
bautizarAuto nombre auto = auto {apodos = nombre:apodos auto}

{-3e-}
llevarADesarmadero :: String -> String -> UnAuto -> UnAuto
llevarADesarmadero marca modelo auto = auto{marca = marca, modelo = modelo , apodos = ["Nunca Taxi"]}


{-¡PISTAS!-}

{-Todo el 4-}
-- calcularDesgasteTramo :: UnAuto -> Tramo -> UnAuto
-- calcularDesgasteTramo auto tramo 
--     | tramo == curvaPeligrosa || tramo == curvaTranca = auto { desgaste = (desgasteRuedas auto + calcularDesgasteRuedas auto tramo, desgasteChasis auto), tiempoCarrera =  tiempoCarrera auto + calcularTiempo auto tramo}
--     | tramo == tramoRectoClassic || tramo == tramito =  auto { desgaste = (desgasteRuedas auto, desgasteChasis auto + calcularDesgasteChasis tramo), tiempoCarrera = tiempoCarrera auto + calcularTiempo auto tramo}
--     | tramo == zigZagLoco || tramo == casiCurva = auto { desgaste = (desgasteRuedas auto + calcularDesgasteRuedas auto tramo, desgasteChasis auto + calcularDesgasteChasis tramo), tiempoCarrera = tiempoCarrera auto + calcularTiempo auto tramo }
--     | tramo == ruloClasico || tramo == deseoDeMuerte = auto { desgaste = (desgasteRuedas auto + calcularDesgasteRuedas auto tramo, desgasteChasis auto), tiempoCarrera = tiempoCarrera auto + calcularTiempo auto tramo}

calcularDesgasteTramo :: UnAuto -> Tramo -> UnAuto
calcularDesgasteTramo auto (Curva angulo longitudCurva) = auto { desgaste = (desgasteRuedas auto + calcularDesgasteRuedas auto (Curva angulo longitudCurva), desgasteChasis auto), tiempoCarrera = tiempoCarrera auto + calcularTiempo auto (Curva angulo longitudCurva)}
calcularDesgasteTramo auto (Recto longitudRecto) = auto { desgaste = (desgasteRuedas auto, desgasteChasis auto + calcularDesgasteChasis (Recto longitudRecto)), tiempoCarrera = tiempoCarrera auto + calcularTiempo auto (Recto longitudRecto)}
calcularDesgasteTramo auto (ZigZag cantCambios) = auto { desgaste = (desgasteRuedas auto + calcularDesgasteRuedas auto (ZigZag cantCambios), desgasteChasis auto + calcularDesgasteChasis (ZigZag cantCambios)), tiempoCarrera = tiempoCarrera auto + calcularTiempo auto (ZigZag cantCambios)}
calcularDesgasteTramo auto (Rulo diametro) = auto { desgaste = (desgasteRuedas auto + calcularDesgasteRuedas auto (Rulo diametro), desgasteChasis auto), tiempoCarrera = tiempoCarrera auto + calcularTiempo auto (Rulo diametro)}

calcularDesgasteRuedas :: UnAuto -> Tramo -> Number
calcularDesgasteRuedas auto (Curva angulo longitud) = 3 * longitud / angulo
calcularDesgasteRuedas auto (ZigZag cambios) = velocidadMax auto * cambios / 10
calcularDesgasteRuedas auto (Rulo diametro) = diametro * 1.5
calcularDesgasteRuedas _ _ = 0 

calcularDesgasteChasis :: Tramo -> Number
calcularDesgasteChasis (Recto longitud) = longitud / 100
calcularDesgasteChasis (ZigZag _) = 5
calcularDesgasteChasis _ = 0  

calcularTiempo :: UnAuto -> Tramo -> Number
calcularTiempo auto (Curva _ longitud) = longitud / (velocidadMax auto / 2)
calcularTiempo auto (Recto longitud) = longitud / velocidadMax auto
calcularTiempo _ (ZigZag cambios) = cambios * 3
calcularTiempo auto (Rulo diametro) = 5 * diametro / velocidadMax auto

{-5a-}
nivelDeJoyez :: UnAuto -> Number
nivelDeJoyez auto 
 | not (esUnaJoya auto) = 0
 | esUnaJoya auto  && tiempoCarrera auto < 50 = 1
 | otherwise = 2 

esParaEntendidos :: GrupoAutos -> Bool
esParaEntendidos grupo = all tiempoCarreraMenorA200 (grupos grupo) && all estaEnBuenEstado (grupos grupo)

tiempoCarreraMayorA200 :: UnAuto -> Bool
tiempoCarreraMayorA200 auto 
 | tiempoCarrera auto > 200 = True
 | otherwise = False

tiempoCarreraMenorA200 :: UnAuto -> Bool
tiempoCarreraMenorA200 auto = not (tiempoCarreraMayorA200 auto)

{-PARTE 2, ENTREGA 05/06-}

{-1a Hay que cambiar todo esto, hacer una funcion que analice el presupuesto y en base a lo que quiera hacer, lo haga
agregarUnAuto :: UnAuto -> Equipo -> Equipo
agregarUnAuto auto equipo 
   | calcularCosto auto <= presupuesto equipo = equipo { autos = auto : autos equipo, presupuesto = presupuesto equipo - calcularCosto auto}
   | otherwise = equipo

calcularCosto :: UnAuto -> Number
calcularCosto auto = velocidadMax auto * 1000

{-1b-}
repararEquipo :: Equipo -> Equipo
repararEquipo (Equipo nombre [] presupuesto) = Equipo nombre [] presupuesto
repararEquipo (Equipo nombre (auto:autos) presupuesto)
  | puedeRepararse auto presupuesto = agregarAutoReparadoAEquipo (repararUnAuto auto) (repararEquipo (Equipo nombre autos (presupuesto - costoRepararAuto auto)))
  | otherwise = agregarAutoReparadoAEquipo auto (repararEquipo (Equipo nombre autos presupuesto))

agregarAutoReparadoAEquipo :: UnAuto -> Equipo -> Equipo
agregarAutoReparadoAEquipo auto (Equipo nombre autos presupuesto) = Equipo nombre (auto : autos) presupuesto

puedeRepararse :: UnAuto -> Number -> Bool
puedeRepararse auto presupuesto = costoRepararAuto auto <= presupuesto

costoRepararAuto :: UnAuto -> Number
costoRepararAuto auto = (desgasteChasis auto - desgasteChasis (repararUnAuto auto)) * 500

{-1c-}
optimizarAutosEquipo :: Equipo -> Equipo
optimizarAutosEquipo equipo
 | null (autos equipo) = equipo
 | hayPresupuestoParaNitro equipo (head(autos equipo)) = optimizarAutosEquipo (aplicarNitroYActualizarPresupuesto equipo(head(autos equipo)))
 | otherwise = equipo

costoPonerNitro :: UnAuto -> Number
costoPonerNitro auto  = velocidadMax auto * 100

hayPresupuestoParaNitro :: Equipo -> UnAuto-> Bool
hayPresupuestoParaNitro equipo auto = costoPonerNitro auto <= presupuesto equipo

aplicarNitroYActualizarPresupuesto :: Equipo -> UnAuto -> Equipo
aplicarNitroYActualizarPresupuesto equipo auto = equipo { autos =  tail (autos equipo) ++ [ponerleNitro auto], presupuesto = presupuesto equipo - costoPonerNitro auto}

{- 1d -}
ferrarizar :: Equipo -> Equipo
ferrarizar (Equipo nombre [] presupuesto) = Equipo nombre [] presupuesto
ferrarizar (Equipo nombre (auto:autos) presupuesto)
  | marca auto == "Ferrari" = agregarAutoAlEquipo auto (ferrarizar (Equipo nombre autos presupuesto))
  | presupuesto >= 3500 = agregarAutoAlEquipo (llevarADesarmadero "Ferrari" "F50" auto) (ferrarizar (Equipo nombre autos (presupuesto - 3500)))
  | otherwise = agregarAutoAlEquipo auto (ferrarizar (Equipo nombre autos presupuesto))
 
agregarAutoAlEquipo :: UnAuto -> Equipo -> Equipo
agregarAutoAlEquipo auto (Equipo nombre lista presupuesto) = Equipo nombre (auto : lista) presupuesto

-}
{-2 tendriamos que hacer un map de costoRepararAuto de todos los autos de la lista-}
costoTotal :: Equipo -> Number
costoTotal (Equipo nombre [] presupuesto) = 0
costoTotal (Equipo nombre (auto:autos) presupuesto) = map (costoRepararAuto autos)

{-3a-} 
autoBase :: UnAuto
autoBase = ferrari {desgaste = (desgasteRuedas ferrari, 1), velocidadMax = velocidadMax ferrari}

autosInfinitos :: Number -> [UnAuto]
autosInfinitos n = autoBase{ velocidadMax = (velocidadMax autoBase) * n} : autosInfinitos (n+1)

infinia :: Equipo
infinia = Equipo { nombreEquipo = "Infinia", autos = autosInfinitos 1, presupuesto = 5000 }

{-3b-}
{- 
  I) Si se realiza repararEquipo infinia, se pueden reparar los primeros 10 autos, a partir del 11avo, se empieza a imprimir la lista con el auto sin reparar
  II) En este caso, la funcion ejecuta indefinidamente, debido a que cada vez que se hacer el tail (autos), se esta volviendo a reevaluar la funcion, dejando asi, un ciclo interminable y un resultado del tipo 
  stack overflow
  III) En este caso, al ser todo el tiempo ferrari, no se actualiza ningun auto debido a que todos son ferraris, siempre entra en la misma condicion e iteracion a iteracion aumenta el tamaño de la lista  
  IV) es infinito, debido a que como suma y suma los costos sin tener en cuenta el presupuesto, agrega por cada auto 500 al presupuesto total, por lo tanto sumaria 500 infinitamente
-}

{-4a-}
tramoConBoxes :: Tramo -> UnAuto -> UnAuto
tramoConBoxes tramo auto
 | estaEnBuenEstado auto = calcularDesgasteTramo auto tramo
 | otherwise = aplicarPenalidad (repararUnAuto (calcularDesgasteTramo auto tramo)) 10

map tramoConRipio ListaDeTramos 

map (tramoConObstruccion 5) ListaDeTramos 

{-4b-}
tramoMojado :: Tramo -> UnAuto -> UnAuto
tramoMojado tramo auto = aplicarPenalidad (calcularDesgasteTramo auto tramo) (calcularTiempo auto tramo * 1.5)

{-4c-}
tramoConRipio :: Tramo -> UnAuto -> UnAuto
tramoConRipio tramo auto = (calcularDesgasteTramo (calcularDesgasteTramo auto tramo) tramo)

{-4d-}
tramoConObstruccion :: Tramo -> Number -> UnAuto -> UnAuto
tramoConObstruccion tramo metrosDeObstruccion auto =  sumarDesgasteRuedas (2 * metrosDeObstruccion) (calcularDesgasteTramo auto tramo)

sumarDesgasteRuedas :: Number -> UnAuto -> UnAuto
sumarDesgasteRuedas desgasteExtra auto = auto { desgaste = (desgasteRuedas auto + desgasteExtra, desgasteChasis auto) }

{-4e-}
tramoConTurbo :: Tramo -> UnAuto -> UnAuto
tramoConTurbo tramo auto = (calcularDesgasteTramo (auto { velocidadMax = velocidadMax auto * 2 }) tramo) { velocidadMax = velocidadMax auto }


{-5-}
pasarPorTramoSobreDos :: Tramo -> UnAuto -> UnAuto
pasarPorTramoSobreDos tramo auto 
 | autoNoDaMas auto = auto
 | otherwise = calcularDesgasteTramo auto tramo

{-6a-}
data Pista = Pista{
    nombrePista :: String,
    paisPista :: String,
    precioBaseEntrada :: Number,
    tramos :: [TramoConMod]
}deriving (Show,Eq,Ord)

data TramoConMod = TramoConMod{
    tramoBase :: Tramo,
    modificadores :: [UnAuto -> UnAuto]
}deriving (Show,Eq,Ord)

vueltaAlaManzana :: Pista
vueltaAlaManzana = Pista {nombrePista = "La Manzana", paisPista = "Italia", precioBaseEntrada = 30, tramos = [TramoConMod (Recto 130) [], TramoConMod (Curva 90 13) [], TramoConMod (Recto 130) [], TramoConMod (Curva 90 13) [], TramoConMod (Recto 130) [], TramoConMod (Curva 90 13) [], TramoConMod (Recto 130) [], TramoConMod (Curva 90 13) []]}

{-6b-}
superPista :: Pista
superPista = Pista {nombrePista = "SuperPista", paisPista = "Argentina", precioBaseEntrada = 300, tramos = [TramoConMod tramoRectoClassic [], TramoConMod curvaTranca [], TramoConMod tramito [\auto -> tramoConTurbo tramito auto], TramoConMod tramito [\auto -> tramoMojado tramito auto], TramoConMod (Rulo 10) [], TramoConMod (Curva 80 400) [\auto -> tramoConObstruccion (Curva 80 400) 2 auto], TramoConMod (Curva 115 650) [], TramoConMod (Recto 970) [], TramoConMod curvaPeligrosa [], TramoConMod tramito [\auto -> tramoConRipio tramito auto], TramoConMod (Recto 800) [\auto -> tramoConBoxes (Recto 800) auto], TramoConMod casiCurva [\auto -> tramoConObstruccion casiCurva 5 auto], TramoConMod (ZigZag 2) [], TramoConMod deseoDeMuerte [\auto -> tramoMojado deseoDeMuerte auto, \auto -> tramoConRipio deseoDeMuerte auto], TramoConMod ruloClasico [], TramoConMod zigZagLoco []]}

aplicarTramoConMod :: TramoConMod -> UnAuto -> UnAuto
aplicarTramoConMod (TramoConMod tramo mods) auto = aplicarMods mods (calcularDesgasteTramo auto tramo)

aplicarMods :: [UnAuto -> UnAuto] -> UnAuto -> UnAuto
aplicarMods [] auto = auto
aplicarMods (modificador:modificadores) auto = aplicarMods modificadores (modificador auto)

avanzarPorTramosConMod :: [TramoConMod] -> UnAuto -> UnAuto
avanzarPorTramosConMod [] auto = auto
avanzarPorTramosConMod (tramo:tramos) auto
  | autoNoDaMas auto = auto
  | otherwise = avanzarPorTramosConMod tramos (aplicarTramoConMod tramo auto)

{-6c-}
peganLaVuelta :: Pista -> [UnAuto] -> [UnAuto]
peganLaVuelta pista autos = map (avanzarPorTramosConMod (tramos pista)) autos


{-7a-}
data Carrera = Carrera {
    pistaCarrera :: Pista,
    cantVueltas :: Number
}

{-7b-}
tourBuenosAires :: Carrera
tourBuenosAires = Carrera superPista 20

tourChill :: Carrera
tourChill = Carrera vueltaAlaManzana 3

{-7c-}
{-I-}
carreraFinal :: Carrera -> [UnAuto] -> [UnAuto]
carreraFinal (Carrera pista 0) autos = autos
carreraFinal (Carrera pista n) autos
  | null autos = []
  | otherwise = carreraFinal (Carrera pista (n-1)) (filter puedeSeguir (peganLaVuelta pista autos))

puedeSeguir :: UnAuto -> Bool
puedeSeguir auto = not (autoNoDaMas auto)

autoGanador :: [UnAuto] -> UnAuto
autoGanador [auto] = auto
autoGanador (primerElemento:segundoElemento:losDemas)
 | tiempoCarrera primerElemento <= tiempoCarrera segundoElemento = autoGanador (primerElemento:losDemas)
 | otherwise = autoGanador (segundoElemento:losDemas)

redondearTiempoAuto :: UnAuto -> UnAuto
redondearTiempoAuto auto = auto {tiempoCarrera =  floor(tiempoCarrera auto)}

{-II-}
listaCarreraOrdenadaPorTiempo :: [UnAuto] -> [UnAuto]
listaCarreraOrdenadaPorTiempo [] = []
listaCarreraOrdenadaPorTiempo (auto:resto) = insertarPorTiempo auto (listaCarreraOrdenadaPorTiempo resto)

insertarPorTiempo :: UnAuto -> [UnAuto] -> [UnAuto]
insertarPorTiempo auto [] = [auto]
insertarPorTiempo auto (elemento:losRestantes)
  | tiempoCarrera auto <= tiempoCarrera elemento = (auto:elemento:losRestantes)
  | otherwise = (elemento:insertarPorTiempo auto losRestantes)

obtenerSegundo :: [UnAuto] -> UnAuto
obtenerSegundo autos = autos !! 1

segundoMasRapido :: [UnAuto] -> Number
segundoMasRapido autos = tiempoCarrera (obtenerSegundo (listaCarreraOrdenadaPorTiempo autos))

{-III-}
tiempoParcialDosVueltas :: Carrera -> [UnAuto] -> Number 
tiempoParcialDosVueltas (Carrera pista cantVueltas) autos = floor(tiempoCarrera (head (listaCarreraOrdenadaPorTiempo(carreraFinal (Carrera pista 2) autos))))

{-IV-}
candidadDeAutosQueTerminaron :: Carrera -> [UnAuto] -> Number
candidadDeAutosQueTerminaron carrera autos = length (carreraFinal carrera autos)
