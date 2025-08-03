{-# LANGUAGE BlockArguments #-}
module Spec where
import PdePreludat
import Library
import Test.Hspec

correrTests :: IO ()
correrTests = hspec $ do
  describe "Test de ejemplo" $ do
    it "El pdepreludat se instaló correctamente" $ do
      doble 1 `shouldBe` 2

correrTestsEstado :: IO ()
correrTestsEstado = hspec $ do
  describe "Estado de salud del auto" $ do
    it "El Peugeot esta en mal estado:" $ do
      estaEnBuenEstado peugeot `shouldBe` False

    it "Lamborghini con 99s y desgaste chasis 7 esta en buen estado:" $ do
      estaEnBuenEstado (lamborghini { tiempoCarrera = 99, desgaste = (0, 7) }) `shouldBe` True

    it "Fiat con 99s y desgaste chasis 33 no esta en buen estado:" $ do
      estaEnBuenEstado (fiat { tiempoCarrera = 99, desgaste = (0, 33) }) `shouldBe` False

    it "Ferrari con 130s, ruedas 50, chasis 30 esta en buen estado:" $ do
      estaEnBuenEstado (ferrari { tiempoCarrera = 130, desgaste = (50, 30) }) `shouldBe` True

    it "Ferrari con 15s, ruedas 50, chasis 45 no esta en buen estado:" $ do
      estaEnBuenEstado (ferrari { tiempoCarrera = 15, desgaste = (50, 45) }) `shouldBe` False

    it "Ferrari con 150s, ruedas 70, chasis 30 no esta en buen estado:" $ do
      estaEnBuenEstado (ferrari { tiempoCarrera = 150, desgaste = (70, 30) }) `shouldBe` False

correrTestsAutoNoDaMas :: IO ()
correrTestsAutoNoDaMas = hspec $ do
  describe "Tests de autoNoDaMas" $ do
    it "Un Ferrari con desgaste de ruedas 20 y chasis 90 no da mas:" $ do
      autoNoDaMas (ferrari {desgaste = (20, 90), apodos = ["La Ferrari", "El fierro", "Ferrucho"]}) `shouldBe` True

    it "Un Ferrari con desgaste de chasis 20 da para mas:" $ do
      autoNoDaMas (ferrari {desgaste = (0, 20), apodos = ["La Ferrari", "El fierro", "Ferrucho"]}) `shouldBe` False

    it "Un Lamborghini con desgaste de ruedas 90 y chasis 20 no da mas:" $ do
      autoNoDaMas (lamborghini {desgaste = (90, 20)}) `shouldBe` True

    it "Un Lamborghini normal da para mas:" $ do
      autoNoDaMas lamborghini `shouldBe` False

correrTestsEsUnChiche :: IO ()
correrTestsEsUnChiche = hspec $ do
  describe "Tests de es un chiche:" $ do
    it "Un auto de marca Lamborghini es un chiche" $ do
      esUnChiche (lamborghini {desgaste = (0, 7), apodos = ["Lambo", "La bestia"]}) `shouldBe` True

    it "Un auto de marca Lamborghini es un chiche" $ do
      esUnChiche (lamborghini {desgaste = (90, 20), apodos = ["Lambo", "La bestia"]}) `shouldBe` False

    it "Un auto de marca Ferrari es un chiche" $ do
      esUnChiche (ferrari {desgaste = (20, 90), apodos = ["La Ferrari", "El fierro", "Ferrucho"]}) `shouldBe` False

    it "Un auto de marca Ferrari es un chiche" $ do
      esUnChiche (ferrari {desgaste = (0, 0), apodos = ["La Ferrari", "El fierro", "Ferrucho"]}) `shouldBe` True

correrTestsEsUnaJoya :: IO ()
correrTestsEsUnaJoya = hspec $ do
  describe "Tests de es una joya:" $ do
    it "Un Peugeot es una joya:" $ do
      esUnaJoya (peugeot {desgaste = (0, 0), apodos = ["El rey del desierto"]}) `shouldBe` True

    it "Un ferrari es una joya" $ do
      esUnaJoya (ferrari {desgaste = (0, 0), apodos = ["La Ferrari", "El fierro", "Ferrucho"]}) `shouldBe` False

correrTestsNivelDeChetez :: IO ()
correrTestsNivelDeChetez = hspec $ do
  describe "Test de nivel de chetez:" $ do
    it "Un auto de marca Ferrari:" $ do
      nivelDeChetez (ferrari {marca = "Ferrari", modelo = "F50",  apodos = ["La Ferrari", "El fierro", "Ferrucho"]}) `shouldBe` 180

correrTestcapacidadSuperCaliFragilisticaEspialidosa :: IO ()
correrTestcapacidadSuperCaliFragilisticaEspialidosa = hspec $ do
  describe "Tests de capacidad SuperCaliFragilisticaEspialidosa:" $ do
    it "Un auto de ferrari es SuperCaliFragilisticaEspialidosa:" $ do
      capacidadSuperCaliFragilisticaEspialidosa (ferrari {apodos = ["La nave"]}) `shouldBe` 7

correrTestcalcularRiesgoAuto :: IO ()
correrTestcalcularRiesgoAuto = hspec $ do
  describe "Tests de que tan riesgoso es un auto:" $ do
    it "Un auto lamborghini es:" $ do
      calcularRiesgoAuto (lamborghini {desgaste = (4, 0), velocidadMax = 73}) `shouldBe` 29.2

    it "Un auto fiat es:" $ do
      calcularRiesgoAuto (fiat {desgaste = (27, 0), velocidadMax = 44}) `shouldBe` 237.6

correrTestrepararUnAuto :: IO ()
correrTestrepararUnAuto = hspec $ do
  describe "Tests de reparacion un auto:" $ do
    it "Reparar un auto de marca fiat:" $ do
      repararUnAuto (fiat {desgaste = (27, 33)}) `shouldBe` fiat{desgaste = (0, 4.95)}

    it "Reparar un auto de marca ferrari:" $ do
      repararUnAuto (ferrari {desgaste = (0, 0)}) `shouldBe` ferrari{desgaste = (0, 0)}

correrTestaplicarPenalidad :: IO ()
correrTestaplicarPenalidad = hspec $ do
  describe "Tests de aplicacion de penalidad de un auto:" $ do
    it "Aplicar penalidad de 20 segundos un auto de marca ferrari con tiempo 10 segundos en pista:" $ do
      aplicarPenalidad (ferrari {tiempoCarrera = 10 }) 20 `shouldBe` ferrari{tiempoCarrera = 30}

    it "Aplicar penalidad de 0 segundos a un auto de marca ferrari con tiempo 10 segundos en pista:" $ do
      aplicarPenalidad (ferrari {tiempoCarrera = 10 }) 0  `shouldBe` ferrari{tiempoCarrera = 10}

correrTestponerleNitro :: IO ()
correrTestponerleNitro = hspec $ do
  describe "Tests de nitro de un auto:" $ do
    it "Ponerle nitro a un fiat:" $ do
      ponerleNitro (fiat {velocidadMax = 44 }) `shouldBe` fiat {velocidadMax = 52.8}

    it "Ponerle nitro a un fiat con velocidad maxima 0 m/s:" $ do
      ponerleNitro (fiat {velocidadMax = 0 }) `shouldBe` fiat {velocidadMax = 0}

correrTestbautizarAuto :: IO ()
correrTestbautizarAuto = hspec $ do
  describe "Tests bautizar un auto:" $ do
    it "Bautizar El diablo a un auto marca Lamborghini:" $ do
      bautizarAuto "El diablo" (lamborghini {apodos =["Lambo","La Bestia"]}) `shouldBe` lamborghini {apodos = ["El diablo","Lambo", "La Bestia"]}

    it "Bautizar El diablo a un auto marca Lamborghini sin apodos:" $ do
      bautizarAuto "El diablo" (lamborghini {apodos = [] }) `shouldBe` lamborghini {apodos = ["El diablo"]}

correrTestllevarADesarmadero :: IO ()
correrTestllevarADesarmadero = hspec $ do
  describe "Tests llevar al desarmadero un auto:" $ do
    it "Llevar a un desarmadero a un auto marca Fiat para cambiar por marca Tesla modelo X:" $ do
      llevarADesarmadero "Tesla" "X" (fiat {marca ="Fiat"}) `shouldBe` (fiat {marca = "Tesla",modelo = "X", apodos = ["Nunca Taxi"]})
      
    it "Llevar a un desarmadero a un auto marca Fiat para cambiar por marca Tesla modelo X:" $ do
      llevarADesarmadero "Tesla" "X" (fiat {modelo ="X"}) `shouldBe` fiat {marca = "Tesla", modelo = "X", apodos = ["Nunca Taxi"]}
    
    it "Llevar a un desarmadero a un auto marca Fiat para cambiar por marca Tesla modelo X:" $ do
      llevarADesarmadero "Tesla" "X" (fiat {apodos =["Nunca Taxi"]}) `shouldBe` fiat {marca = "Tesla", modelo = "X", apodos = ["Nunca Taxi"]}

correrTestsTramoCurva :: IO()
correrTestsTramoCurva = hspec $ do
  describe "Tests correr tramo curva:" $ do
    it "Transitar una curva peligrosa con un auto marca Ferrari:" $ do
      calcularDesgasteTramo ferrari curvaPeligrosa `shouldBe` ferrari{ desgaste = (15, 0), tiempoCarrera = calcularTiempo ferrari curvaPeligrosa}

    it "Transitar una curva peligrosa con un auto marca Ferrari:" $ do
      calcularDesgasteTramo ferrari curvaPeligrosa `shouldBe` ferrari { desgaste = (15, 0), tiempoCarrera = calcularTiempo ferrari curvaPeligrosa} 

    it "Transitar una curva peligrosa con un auto marca Peugeot:" $ do
      calcularTiempo peugeot curvaPeligrosa `shouldBe` 15
    
    it "Transitar una curva tranca con un auto marca Ferrari:" $ do
      calcularDesgasteTramo ferrari curvaTranca `shouldBe` ferrari{ desgaste = (15,0), tiempoCarrera = calcularTiempo ferrari curvaTranca}
    
    it "Transitar una curva tranca con un auto marca Ferrari:" $ do
      calcularDesgasteTramo ferrari curvaTranca `shouldBe` ferrari { desgaste = (15, 0), tiempoCarrera = calcularTiempo ferrari curvaTranca}
    
    it "El tiempo de carrera de un peugeot en curva tranca:" $ do
      calcularTiempo peugeot curvaTranca `shouldBe` 27.5

correrTestTramoRecto :: IO ()
correrTestTramoRecto = hspec $ do
  describe "Tests correr tramo recto:" $ do
    it "Transitar un tramo retro classic con un auto marca Ferrari:" $ do
      calcularDesgasteTramo ferrari tramoRectoClassic `shouldBe` ferrari {desgaste = (0, 7.15), tiempoCarrera = calcularTiempo ferrari tramoRectoClassic }
      
    it "Transitar un tramo retro classic con un auto marca Ferrari:" $ do
      calcularTiempo ferrari tramoRectoClassic `shouldBe` 11
    
    it "Transitar un tramito con un auto marca Ferrari:" $ do
      calcularDesgasteTramo ferrari tramito `shouldBe` ferrari {desgaste = (0, 2.6), tiempoCarrera = calcularTiempo ferrari tramito}

    it "Transitar un tramito con un auto marca Ferrari:" $ do
      calcularTiempo ferrari tramito  `shouldBe` 4

correrTestTramoZigZag :: IO ()
correrTestTramoZigZag = hspec $ do
  describe "Tests correr tramo zig zag:" $ do
    it "Transitar un tramo zigZagLoco con un auto marca Ferrari:" $ do
      calcularDesgasteTramo ferrari zigZagLoco `shouldBe` ferrari {desgaste = (32.5, 5), tiempoCarrera = calcularTiempo ferrari zigZagLoco}
      
    it "Transitar un tramo zigZagLoco con un auto marca Ferrari:" $ do
      calcularDesgasteTramo ferrari zigZagLoco `shouldBe` ferrari {desgaste = (32.5, 5), tiempoCarrera = calcularTiempo ferrari zigZagLoco}
    
    it "Transitar un tramo zigZagLoco con un auto marca Ferrari:" $ do
      calcularDesgasteTramo ferrari zigZagLoco `shouldBe` ferrari {desgaste = (32.5, 5), tiempoCarrera = 15}

    it "Transitar un tramo casiCurva con un auto marca Ferrari:" $ do
      calcularDesgasteTramo ferrari casiCurva `shouldBe` ferrari {desgaste = (6.5, 5), tiempoCarrera = calcularTiempo ferrari casiCurva}

    it "Transitar un tramo casiCurva con un auto marca Ferrari:" $ do
      calcularDesgasteTramo ferrari casiCurva `shouldBe` ferrari {desgaste = (6.5, 5), tiempoCarrera = calcularTiempo ferrari casiCurva} 

    it "Transitar un tramo casiCurva con un auto marca Ferrari:" $ do
      calcularDesgasteTramo ferrari casiCurva `shouldBe` ferrari {desgaste = (6.5, 5), tiempoCarrera = 3}


correrTestTramoRulo :: IO ()
correrTestTramoRulo = hspec $ do
  describe "Tests correr tramo rulo:" $ do
    it "Transitar un tramo ruloClasico con un auto marca Ferrari:" $ do
      calcularDesgasteTramo ferrari ruloClasico `shouldBe` ferrari {desgaste = (19.5, 0), tiempoCarrera = calcularTiempo ferrari ruloClasico} 
      
    it "Transitar un tramo ruloClasico con un auto marca Ferrari:" $ do
      calcularDesgasteTramo ferrari ruloClasico `shouldBe` ferrari {desgaste = (19.5, 0), tiempoCarrera = calcularTiempo ferrari ruloClasico}
    
    it "Transitar un tramo ruloClasico con  un auto marca Ferrari:" $ do
      calcularDesgasteTramo ferrari ruloClasico `shouldBe` ferrari {desgaste = (19.5, 0), tiempoCarrera = 1}

    it "Transitar un tramo deseoDeMuerte con un auto marca Ferrari:" $ do
      calcularDesgasteTramo ferrari deseoDeMuerte `shouldBe` ferrari {desgaste = (39.0, 0), tiempoCarrera = calcularTiempo ferrari deseoDeMuerte}

    it "Transitar un tramo deseoDeMuerte con un auto marca Ferrari:" $ do
      calcularDesgasteTramo ferrari deseoDeMuerte `shouldBe` ferrari {desgaste = (39.0, 0), tiempoCarrera = calcularTiempo ferrari deseoDeMuerte}

    it "Transitar un tramo deseoDeMuerte con un auto marca Ferrari:" $ do
      calcularDesgasteTramo ferrari deseoDeMuerte `shouldBe` ferrari {desgaste = (39.0, 0), tiempoCarrera = 2}

correrTestNivelJoyez :: IO ()
correrTestNivelJoyez = hspec $ do
  describe "Tests nivel de joyez:" $ do
    it "Un auto Ferrari tiene que tener nivel de joyez 0" $ do
      nivelDeJoyez ferrari `shouldBe` 0
    
    it "Un auto Peugeot con tiempo de carrera 49:" $ do
     nivelDeJoyez peugeot { tiempoCarrera = 49} `shouldBe` 1
    
    it "Un auto Peugeot con tiempo de carrera 50:" $ do
     nivelDeJoyez peugeot { tiempoCarrera = 50} `shouldBe` 2
    
correrTestsParaEntendidos :: IO ()
correrTestsParaEntendidos = hspec $ do
  describe "Tests para entendidos:" $ do
    it "Un auto Ferrari con tiempo de carrera 200 y otro igual de 201:" $ do
      esParaEntendidos (GrupoAutos [ferrari { tiempoCarrera = 200}, ferrari2 { tiempoCarrera = 201}]) `shouldBe` False

    it "Un auto Ferrari con tiempo de carrera 200 y otro Peugeot:" $ do
      esParaEntendidos (GrupoAutos [ferrari { tiempoCarrera = 200}, peugeot]) `shouldBe` False

    it "Un auto Ferrari con tiempo de carrera 200 y otro Lamborghini con tiempo de 201:" $ do
      esParaEntendidos (GrupoAutos [ferrari { tiempoCarrera = 200}, lamborghini { tiempoCarrera = 200}]) `shouldBe` True

correrTestsAgregarUnAuto:: IO ()
correrTestsAgregarUnAuto = hspec $ do
  describe "Tests para reparar equipo:" $ do
    it "Agrega un Ferrari a un equipo:" $ do
      agregarUnAuto ferrari (Equipo "Escuderia Ferrari" [] 70000) `shouldBe` Equipo "Escuderia Ferrari" [ferrari] 5000

    it "Agrega un Fiat a un equipo:" $ do
      agregarUnAuto fiat (Equipo "Equipo Fiat" [] 50000) `shouldBe` Equipo "Equipo Fiat" [fiat] 6000

    it "No agrega un Lamborghini a un equipo:" $ do
      agregarUnAuto lamborghini (Equipo "Equipo Lamborghini" [] 70000) `shouldBe` Equipo "Equipo Lamborghini" [] 70000

correrTestsRepararAuto :: IO ()
correrTestsRepararAuto = hspec $ do
  describe "Tests para reparar equipo:" $ do
    it "Repara Ferrari y Lamborhini si hay presupuesto suficiente:" $ do
      repararEquipo Equipo {nombreEquipo =  "Equipo1", autos = [ferrari { desgaste = (0, 10) }, lamborghini { desgaste = (0, 20) }], presupuesto = 20000} `shouldBe` Equipo "Equipo1" [ferrari {desgaste = (0, 1.5)}, lamborghini {desgaste = (0, 3)}] 7250

    it "No repara Fiat si no hay presupuesto suficiente:" $ do
      repararEquipo (Equipo "Equipo2" [fiat { desgaste = (0, 50) }] 10000) `shouldBe` Equipo "Equipo2" [fiat {desgaste = (0, 50)}] 10000

correrTestsOptimizarAutosEquipo :: IO ()
correrTestsOptimizarAutosEquipo = hspec $ do
  describe "Tests de optimizar autos equipo: " $ do
    it "Optimizar un equipo con Ferrari, Lamborghini y presupuesto 20000:" $ do
      optimizarAutosEquipo (Equipo "Equipo1"[ferrari, lamborghini] 20000) `shouldBe` Equipo "Equipo1" [ferrari{velocidadMax = 78}, lamborghini {velocidadMax = 87.6}] 6200

    it "Optimizar un equipo con Ferrari, Lamborghini y presupuesto 10000:" $ do
      optimizarAutosEquipo (Equipo "Equipo2"[ferrari, lamborghini] 10000) `shouldBe` Equipo "Equipo2" [lamborghini {velocidadMax = 73}, ferrari {velocidadMax = 78}] 3500   
    
correrTestsFerrarizar :: IO ()
correrTestsFerrarizar = hspec $ do
  describe "Tests para ferrarizar autos equipo: " $ do
    it "Ferrarizar un equipo con un Peugeot, un Lamborghini y presupuesto 20000:" $ do
      ferrarizar (Equipo "Equipo1" [peugeot, lamborghini] 20000) `shouldBe` Equipo "Equipo1" [peugeot {marca = "Ferrari", modelo = "F50", apodos =  ["Nunca Taxi"] }, lamborghini {marca = "Ferrari", modelo = "F50", apodos = ["Nunca Taxi"]}] 13000

    it "Ferrarizar un equipo con un Peugeot, un Lamborghini y presupuesto 4000:" $ do
      ferrarizar (Equipo "Equipo2" [peugeot, lamborghini] 4000) `shouldBe` Equipo "Equipo2" [peugeot {marca = "Ferrari", modelo = "F50", apodos = ["Nunca Taxi"] }, lamborghini] 500

    it "Ferrarizar un equipo con un Peugeot, una Ferrari, un Lamborghini y presupuesto 20000:" $ do
      ferrarizar (Equipo "Equipo3" [peugeot, ferrari, lamborghini] 20000) `shouldBe` Equipo "Equipo3" [peugeot {marca = "Ferrari", modelo = "F50", apodos = ["Nunca Taxi"] }, ferrari, lamborghini {marca = "Ferrari", modelo = "F50", apodos = ["Nunca Taxi"]}] 13000

correrTestCostoTotal :: IO ()
correrTestCostoTotal = hspec $ do
  describe "Tests para costo total : " $ do
    it "Calcular el costo de reparacion de un ferrari con chasis 10 y un lamborghini con chasis 20:" $ do
      costoTotal Equipo {nombreEquipo =  "Equipo1", autos = [ferrari { desgaste = (0, 10) }, lamborghini { desgaste = (0, 20) }]} `shouldBe` 12750

    it "Calcular el costo de reparacion de un fiat con chasis 50 y un peugeot con chasis 0:" $ do
      costoTotal Equipo{nombreEquipo =  "Equipo1", autos = [fiat{ desgaste = (0, 50) }, peugeot { desgaste = (0, 0) }]} `shouldBe` 21250

correrTestPeganLaVuelta :: IO ()
correrTestPeganLaVuelta = hspec $ do
  describe "Tests de Pegan La Vuelta:" $ do
    it "Ferrari y Peugeot con desgaste 79 de ruedas pegan la vuelta a vueltaAlaManzana" $ do
      tiempoCarrera (head (peganLaVuelta vueltaAlaManzana [ferrari, peugeot { desgaste = (79, 0) }])) `shouldBe` 9.6
      
    it "Ferrari y Peugeot con desgaste 79 de ruedas pegan la vuelta a vueltaAlaManzana" $ do
      tiempoCarrera (head (tail (peganLaVuelta vueltaAlaManzana [ferrari, peugeot { desgaste = (79, 0) }]))) `shouldBe` 11.7

correrTestLlegaronLasCarreras :: IO ()
correrTestLlegaronLasCarreras = hspec $ do
  describe "Tests de Llegaron las carreras:" $ do
    it "El auto ganador de una carrera:" $ do
      redondearTiempoAuto (autoGanador (carreraFinal tourChill [ferrari, lamborghini, fiat])) `shouldBe` lamborghini {desgaste = (9.2, 22.6), tiempoCarrera = 25}
       
    it "El tiempo total del segundo:" $ do
      segundoMasRapido (carreraFinal tourChill [ferrari, lamborghini, fiat]) `shouldBe` 28.8
    
    it "El tiempo parcial de un auto que va primero luego de dos vueltas:" $do
      tiempoParcialDosVueltas tourChill [ferrari, lamborghini, fiat] `shouldBe` 17

    it "La cantidad de autos que terminaron:" $do
      candidadDeAutosQueTerminaron tourChill [ferrari, lamborghini, fiat] `shouldBe` 3


    