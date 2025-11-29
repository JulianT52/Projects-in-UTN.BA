class Jugador{

var property fuerza 

const property punteria 

var property tickets 

var property cansancio 

method jugarJuego(juego){

  tickets += juego.ticketsOtorgados()
  cansancio += juego.cansancioOtorgado()
}

method premiosDisponibles() = feria.premiosDisponibles().filter({premio => premio.precioEnTickets() < tickets})

method puedeComprarPremio() = self.premiosDisponibles().size() > 0


method comprarPremio(premioElegido){

  self.premiosDisponibles().remove(premioElegido)
  tickets -= premioElegido.precioEnTickets()
}

}

const julieta = new Jugador(fuerza = 80, punteria = 20, tickets = 15, cansancio = 0)

class Premio{
  var property precioEnTickets

  method modificarPrecio(nuevoPrecio){
    precioEnTickets = nuevoPrecio
  }
}

const ositoDePeluche = new Premio(precioEnTickets = 45)
const taladro = new Premio(precioEnTickets = 70)

object feria{

  const property premiosDisponibles = [ositoDePeluche, taladro]

  method venderPremio(premioSeleccionado){
    premiosDisponibles.remove(premioSeleccionado)
  }
}


class Juego{

  var participante

  method ticketsOtorgados()

  method cansancioOtorgado()

}

class TiroAlBlanco inherits Juego{

 override method ticketsOtorgados() = (participante.punteria() / 10).ceil()

 override method cansancioOtorgado() = 3

}

class PruebaDeFuerza inherits Juego{

 method lePegaALaCampana(jugador) = jugador.fuerza() >= 75 

 override method ticketsOtorgados() = if (self.lePegaALaCampana(participante)) 20 else 0

 override method cansancioOtorgado() = 8

}

class Ruleta inherits Juego{

  var property estaBienAceitada

  override method ticketsOtorgados() = 0.randomUpTo(20)

  override method cansancioOtorgado() = if (estaBienAceitada) 0 else 1

}