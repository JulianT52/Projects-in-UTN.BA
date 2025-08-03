module Library where
import PdePreludat
import Test.Hspec (xcontext)

doble :: Number -> Number
doble numero = numero + numero

tazasLiebre :: Number->Number
tazasLiebre tazas = tazas * 5

tazasSombrerero :: Number -> Number
tazasSombrerero tazasDeLaLiebre = doble tazasDeLaLiebre

{- La funcion del conejo es correcta, funciona, pero no es lo mas optima
ya que el codigo en un punto de vuelve redundante a la lectura y podria hacerse
de una manera mejor. Esta version es mucho mas legible y funciona utilizando menos linea de codigo
siendo una funcion que analiza los 3 casos posibles y de no cumplir ninguno, lo descarta
-}

nummag :: Number -> Bool
nummag x 
  | x == 5 = True
  | mod x 3 == 0 = True
  | mod x 2 == 0 = True
  | otherwise = False

setaAComer :: Number -> String
setaAComer x
  | x < 50 = "Seta Roja"
  | x > 50 && x < 100 = "Seta Violeta"
  | otherwise = "Seta Amarilla" 
  

pesoPino :: Number->Number
pesoPino altura
 | (altura * 100) <= 300 = altura *100 * 3
 | (altura * 100) > 300 = ((altura*100)-300)*2 + 900

pesoUtil :: Number->String
pesoUtil peso
 | peso > 400 && peso < 1000 = "El arbol sirve para la reina"
 | otherwise = "El arbol no sirve"

{-Para esta funcion de sirvePino, lo que hice fue calcular con la funcion pesoPino, la altura que
necesitaban tener los arboles para que esten dentro del rango 400 a 1000-}

sirvePino :: Number->String
sirvePino altura
 | altura > 1.33334 && altura < 3.5 = "El arbol tiene una altura que le sirve a la reina"
 | otherwise = "El arbol es muy pesado para lo que la reina quiere"

 {- 
  - La funcion sirvePino recibe un valor que representa la altura de un arbol y devuelve un string que detalla si sirve
  - Como primer acercamiento, la funcion recibe la altura de un arbol (el calculo de los valores limites fue hecho
  - en la funcion pesoPino, donde se definen 1.3334 y 3.5 como limites en base a las condiciones que la reina plantea
  - En caso de que el arbol cumpla con la altura, se le detalla al usuario por pantalla que el arbol cumple las condiciones
  - En caso de que esto no suceda, se le especifica que el arbol es muy pesado.
 -}