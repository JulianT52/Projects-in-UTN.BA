class Personaje{

  var property copas 

  method ganarCopas(copasGanadas){
    copas += copasGanadas
  }

  method perderCopas(copasPerdidas){
    copas -= copasPerdidas
  }

  method destreza(){
  } 

  method tieneEstrategia(){
  }
}

class Arquero inherits Personaje{

  var property agilidad
  var property rango

  override method destreza() = agilidad * rango

  override method tieneEstrategia() = rango > 100

}

class Guerrera inherits Personaje{

  var property fuerza

  var property estrategia

  override method destreza() = fuerza * 1.5

}

class Ballesteros inherits Arquero{

  override method destreza() = super() * 2

}

class Mision{

  var property dificultad

  method copasEnJuego(){
  }
  
  method puedeIniciarse(personaje)
  

  method puedeSuperarse(personaje)
  

  method repartirCopas(personaje)

  

  method iniciar(personaje){

    self.puedeIniciarse(personaje)
    self.repartirCopas(personaje)
  }

  method perderOGanarCopas(personaje) =
    if(self.puedeSuperarse(personaje) == 1)
     1
    else
    -1
  }



class MisionIndividual inherits Mision{

  override method copasEnJuego() = dificultad * 2 

  method cumpleCondicionArranque(personaje) = personaje.copas() > 10  

  override method puedeIniciarse(personaje){

    if(!self.cumpleCondicionArranque(personaje)){
      throw new Exception(message = "No puede iniciarse la mision")
    }
  }

  override method repartirCopas(personaje){

    personaje.copas(personaje.copas() + self.copasEnJuego() * self.perderOGanarCopas(personaje)) 

  }

  override method puedeSuperarse(personaje) = personaje.tieneEstrategia() || personaje.destreza() > dificultad
}

class MisionEnEquipo inherits Mision{

  var property participantes = []

  override method copasEnJuego() = 50 / participantes.size()

  method masDeLaMitadSupera() = (participantes.filter({personaje => personaje.tieneEstrategia()}).size()) > (participantes.size() / 2)
  
  method todosTienenDestrezaMayorA400(jugadores) = jugadores.all({personaje => personaje.destreza() > 400})

  override method puedeSuperarse(jugadores) =  self.masDeLaMitadSupera() || self.todosTienenDestrezaMayorA400(jugadores)
}
