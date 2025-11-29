import juegos.*

class Paises{

  const property factorConversion

  const restrincciones = []

  method traducirAMonedaLocal(precio) = precio * factorConversion

  method esAptoParaMenores(juego) = restrincciones.contains({restrinccion => juego.caracteristicas().contains(restrinccion)})
}
