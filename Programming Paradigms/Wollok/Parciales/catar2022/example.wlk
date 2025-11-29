class Comida{

  method cantidadAzucar()

  method esBonito()

  method cantidadCalorias() = 100 + (3 * self.cantidadAzucar())
}

class Entrada inherits Comida{

override method cantidadAzucar() = 0

override method esBonito() = true
 
}

class Principal inherits Comida{

  var cantidadAzucar

  var esBonito

  override method cantidadAzucar() = cantidadAzucar

  override method esBonito() = esBonito 
}

class Postre inherits Comida{

 var cantidadColores

 override method cantidadAzucar() = 120

 override method esBonito() = cantidadColores > 3

}

class Cocinero{

  var especialidad

  method cocinar() = especialidad.cocinar()

  method catar(plato) = especialidad.calificar(plato)

  method cambiarEspecialidad(nuevaEspecialidad){
    especialidad = nuevaEspecialidad
  }
}

class Pastelero{

  var nivelAzucarDeseado

  method cocinar() = new Postre(cantidadColores = nivelAzucarDeseado / 50)

  method calificar(plato) = 10.min(5 * plato.cantidadAzucar() / nivelAzucarDeseado)
}

class Chef{

  var cantidadCaloriasMaximas

  method noCumpleCondicion(plato) = 0

  method cocinar() = new Principal(esBonito = true, cantidadAzucar = cantidadCaloriasMaximas)

  method calificar(plato) = if(plato.esBonito() && plato.cantidadCalorias() < cantidadCaloriasMaximas) 10 else self.noCumpleCondicion(plato)
}

class Souschef inherits Chef{

  override method noCumpleCondicion(plato) = 6.min(plato.cantidadCalorias() / 100)

  override method cocinar() = new Entrada()
}

class Torneo{

  const catadores = []

  const cocineros = []

  method agregarCocinero(cocinero){
    cocineros.add(cocinero.cocinar())
  }

  method realizarTorneo(){
    if(cocineros.size() == 0){
      throw new DomainException(message = "No se puede realizar el torneo debido a que no hay suficientes participantes")
    }
    else{
      cocineros.max({plato => self.calificacionTotal(plato)}).cocinero()
    }
  }

  method calificacionTotal(plato) = catadores.sum({catador => catador.catar(plato)})

}

