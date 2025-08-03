module Library where
import PdePreludat

doble :: Number -> Number
doble numero = numero + numero

{-Parte I-}

type Nivel = Number
type Palo = String
type Estado = String
type CartasMagicas = (Nivel, Palo, Estado)
type NombreCapitan = String
type NombreBrujo = String
type Arma = String
type Armas = [Arma]
type Hechizo = String
type Hechizos = [Hechizo]
type Capitan = (NombreCapitan, Armas)
type Brujo = (NombreBrujo, Hechizos)
type Duo = (Brujo, Brujo)
type Energia = Number

palos :: [Palo]
palos = ["Corazon","Diamante","Pica","Trebol"]

estadoActividad :: [Estado]
estadoActividad = ["Activo", "Inactivo"]

daliaCentenaria :: Capitan
daliaCentenaria = ("Dalia Centenaria", ["espada de petalo", "daga", "lanza"])

jaimeGonzales :: Capitan
jaimeGonzales = ("Jaime Gonzales", ["Arma poderosa", "Arma superpoderosa", "El mejor arma"])

gatoDeCheshire :: Brujo
gatoDeCheshire = ("Gato de Cheshire", ["desaparecetus", "abrete sesamo", "abracadabra"])

elSombrerero :: Brujo
elSombrerero = ("El sombrerero", [""])

{- Parte II -}

energiaReina :: Capitan -> Brujo -> Energia
energiaReina capitan brujo =
  energiaCapitan capitan + energiaBrujo brujo

energiaCapitan :: Capitan -> Energia
energiaCapitan (nombreCapitan, armas)
  | null armas = calcularEnergiaSinArmas nombreCapitan
  | otherwise  = calcularEnergiaConArmas (nombreCapitan, armas)

calcularEnergiaSinArmas :: NombreCapitan -> Energia
calcularEnergiaSinArmas nombre = length nombre * 5

calcularEnergiaConArmas :: Capitan -> Energia
calcularEnergiaConArmas (nombreCapitan, armas) =
  50 + cantidadArmas (length armas) + tieneEspadaPetalo armas

tieneEspadaPetalo :: Armas -> Number
tieneEspadaPetalo armas 
  | "espada de petalo" `elem` armas = 10
  | otherwise = 0

cantidadArmas :: Number -> Number
cantidadArmas armas =
  min (armas * 5) 15 + min (max (armas - 3) 0) 2 + min (max (armas - 4) 0) 3

energiaBrujo :: Brujo -> Energia
energiaBrujo (nombreBrujo, hechizos)
  | null hechizos = calcularEnergiaSinHechizos nombreBrujo
  | otherwise     = calcularEnergiaConHechizos (nombreBrujo, hechizos)

calcularEnergiaSinHechizos :: NombreBrujo -> Energia
calcularEnergiaSinHechizos nombre = length nombre * 5

calcularEnergiaConHechizos :: Brujo -> Energia
calcularEnergiaConHechizos (nombreBrujo, hechizos) =
  50 + tieneDesaparecetus hechizos

tieneDesaparecetus :: Hechizos -> Number
tieneDesaparecetus hechizos 
  | "desaparecetus" `elem` hechizos = 10
  | otherwise = 0

{-Aca termine el calculo de las energias-}

calcularRol :: CartasMagicas -> String
calcularRol carta@(nivel, palo, estado)
  | palo == "Corazon" = "Curador"
  | palo == "Pica" = "Guerrero"
  | palo == "Diamante" && nivel > 5 = "Explosivo"
  | palo == "Trebol" && estado == "Activo" = "Espia"
  | otherwise = "Guerrero"

calcularPoderGuerrero :: CartasMagicas -> Number
calcularPoderGuerrero (nivel, palo, estado)
  | palo == "Diamante" && calcularRol (nivel, palo, estado) == "Guerrero" = nivel * 8 + 35
  | otherwise = nivel * 8

calcularPoderEspia :: CartasMagicas -> Number
calcularPoderEspia (nivel, palo, estado)
  | ((13 - nivel) * 7) > 100 = (13 - nivel) * 7 - 30
  | otherwise = (13 - nivel) * 7

calcularPoderActivo :: CartasMagicas -> Number
calcularPoderActivo carta@(nivel, palo, estado)
  | calcularRol carta == "Explosivo" = nivel * 12
  | calcularRol carta == "Guerrero" = calcularPoderGuerrero (nivel, palo, estado)
  | calcularRol carta == "Espia" = calcularPoderEspia (nivel, palo, estado)
  | calcularRol carta == "Curador" = 0.5

calcularPoderMagicoCartas :: CartasMagicas -> Number
calcularPoderMagicoCartas (nivel,palo,estado)
  | estado == "Inactivo" = 0
  | otherwise = calcularPoderActivo (nivel, palo, estado)

poderReinaRoja :: [CartasMagicas] -> Number
poderReinaRoja cartas
  | null cartas = 0
  | length cartas == 1 = 3 * calcularPoderMagicoCartas (head cartas)
  | otherwise = calcularPoderMagicoCartas (head cartas) + calcularPoderMagicoCartas (cartas !! 1) + calcularPoderMagicoCartas (last cartas)

{-Aca termine el calculo de poder-}

infiltracionEncubierta :: CartasMagicas -> Number -> CartasMagicas
infiltracionEncubierta (nivel, palo, estado) n
  | mod n 4 == 0 = (n, "Diamante", estado)
  | n == 33 = (nivel, "Corazon", estado)
  | mod n 7 == 0 = (nivel, "Pica", estado)
  | otherwise = (nivel, palo, "Inactivo")

infiltrarEnEjercito :: [CartasMagicas] -> CartasMagicas -> [CartasMagicas]
infiltrarEnEjercito [] cartaInfiltrada = [cartaInfiltrada]
infiltrarEnEjercito [ultima] cartaInfiltrada = [cartaInfiltrada, ultima]
infiltrarEnEjercito (carta:resto) cartaInfiltrada = carta : infiltrarEnEjercito resto cartaInfiltrada

{-Parte 3-}

empiezaConPatron :: String -> String -> Bool
empiezaConPatron patron nombre = take 3 nombre == take 3 patron

conoceHechizo :: String -> Brujo -> Bool
conoceHechizo hechizo (_, hechizos) = any (== hechizo) hechizos

puedeAprenderHechizo :: Hechizo -> Brujo -> Bool
puedeAprenderHechizo hechizo (nombre, hechizos) = not (conoceHechizo hechizo (nombre, hechizos)) && (empiezaConPatron nombre hechizo) || length hechizos > 100

aprenderHechizo :: Hechizo -> Brujo -> Brujo
aprenderHechizo hechizo brujo@(nombre, hechizos)
 | puedeAprenderHechizo hechizo brujo = (nombre, hechizo : hechizos)
  | otherwise = brujo

intercambiarRoles :: Duo -> Duo
intercambiarRoles (brujo1, brujo2) = (brujo2, brujo1)

actualizarNivel :: CartasMagicas -> CartasMagicas
actualizarNivel carta@(nivel, palo, estado)
  | estado == "Activo" = (nivel+2,palo,estado)
  | otherwise = (nivel, palo, estado)

cambiarPalo :: CartasMagicas -> CartasMagicas
cambiarPalo carta@(nivel,palo,estado)
 | calcularPoderActivo (actualizarNivel (nivel,palo,estado)) > 120 = (nivel,"Diamante",estado)
 | calcularPoderActivo (actualizarNivel (nivel,palo,estado)) < 20 =  (nivel,"Corazon",estado)
 | otherwise = (nivel,palo,estado)

actualizarPalo :: CartasMagicas -> CartasMagicas
actualizarPalo carta@(nivel, palo, estado) = cambiarPalo (nivel,palo,estado)

esBalanceadaLaFormacion :: [CartasMagicas] -> Bool
esBalanceadaLaFormacion cartasMagicas = (((mod (length cartasMagicas ) 2) == 0) && (head cartasMagicas /= last cartasMagicas))
