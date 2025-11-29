object paquete {

  var puedeEntregarse = 0

  var estaPago = 0

  method puedeEntregarse(mensajero,puente) = ((mensajero.puedeLlegar(puente)) && estaPago == 1)
}

object puenteDeBrooklyn{

  method cumpleCondicion(mensajero) = (mensajero.peso() + mensajero.pesoVehiculo()) < 1000
}

object laMatrix{

  method cumpleCondicion(mensajero) = (mensajero.puedeLlamar() == 1)
}

object roberto{

  var property peso = 0

  const property puedeLlamar = false

  var property vehiculoUsado = 0

  method pesoVehiculo() = vehiculoUsado.peso()

  method puedeLlegar(puente){

    puente.cumpleCondicion(self)

  }
}

object chuckNorris{

  const property peso = 900

  const property puedeLlamar = true

  var property vehiculoUsado = 0

  method pesoVehiculo() = vehiculoUsado.peso()

    method puedeLlegar(puente){

    puente.cumpleCondicion(self)

  }
}

object neo{

const property peso = 0

const property puedeLlamar = false

var property vehiculoUsado = 0

  method pesoVehiculo() = vehiculoUsado.peso()

  method puedeLlegar(puente){

    puente.cumpleCondicion(self)

  }

}

object bicicleta{
  var property peso = 0
}

object camion{
  var property cantidadAcoplados = 0

  var property peso = 500 * cantidadAcoplados
}