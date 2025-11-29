object luke {

  var coleccion = []

  var vehiculo = 0

  method vehiculo() = vehiculo

  method vehiculo(nuevoVehiculo){
    vehiculo = nuevoVehiculo
  }

  method viajar(ciudad){

    ciudad.condicion()
  }
  }

object alambiqueVeloz{

   var combustible = 0
   var velocidad = 0

   method combustible() = combustible

   method combustible(nuevoCombustible){
    combustible = nuevoCombustible
   }

   method velocidad() = velocidad

   method velocidad(nuevaVelocidad){
    velocidad = nuevaVelocidad
   }
}

object paris{
  const recuerdo = "torreEifel"

  method recuerdo() = recuerdo

  method tieneSuficienteCombustible(cantidad){
    return cantidad > 35
  }

  method cumpleCondicionViaje(viajante){
    return self.tieneSuficienteCombustible((viajante.vehiculo()).combustible())
  }
}

object bsas{
  var recuerdo = 0

  var presidente = 0

  method presidente() = presidente

  method presidente(elegido){
    presidente = elegido
  }

  method recuerdo(){
    if(presidente == "milei")
    {
      recuerdo = "mateConYerba"
      return recuerdo
    }
    recuerdo = "mateSinYerba"
    return recuerdo
  }

  method tieneSuficienteVelocidad(velocidad){
    return velocidad > 120
  }

  method cumpleCondicionViaje(viajante){
    return self.tieneSuficienteVelocidad((viajante.vehiculo().velocidad()))

  }
}

object bagdad{

  var recuerdo = 0

  var anio = 0

  method anio() = anio

  method anio(anioActual){
    anio = anioActual
  }

  method recuerdo(){

    if(anio < 1960){
      recuerdo = "bidonPetroleo"
      return recuerdo
    }
    else{
      if (anio < 1980){
        recuerdo = "armasExplosivas"
        return recuerdo
      }
      else{
        recuerdo = "jardinesMiticos"
        return recuerdo
      }
    }
  }

  method cumpleCondicionViaje(viajante){
    return true
  }
}

object lasVegas{

  var recuerdo = 0

  var ciudadConmemorada = 0

  method recuerdo(){

    if(ciudadConmemorada == bsas){
      recuerdo = bsas.recuerdo()
      return recuerdo
    }
    else{
      if(ciudadConmemorada == paris){
        recuerdo = paris.recuerdo()
        return recuerdo
      }
      recuerdo = bagdad.recuerdo()
      return recuerdo
    }
  }

  method cumpleCondicionViaje(viajero){
    ciudadConmemorada.cumpleCondicionViaje(viajero)
  }

}

object foxModelo2012{

  var combustible = 42

  var velocidad = 160

  var conductor = 0

  method combustible() = combustible

  method combustible(nuevoCombustible){
    combustible = nuevoCombustible
  }

  method velocidad() = velocidad

  method aplicarTurbo(){
    velocidad = velocidad + velocidad * 0.3
  }

  method conductor() = conductor

  method conductor(inconsciente){
    conductor = inconsciente
  }

  method esRapido() = conductor == "franquito"

}



