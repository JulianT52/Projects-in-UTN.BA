class Comida{

  method peso()

  method precio() = self.valoracion() * 300 + self.montoExtraPorCeliaquia()

	method montoExtraPorCeliaquia() = if(self.esAptoCeliaco()) 1200 else 0

  method esEspecial() = self.peso() > 250

  method esAptoCeliaco()

  method valoracion()

}

class Provoleta inherits Comida{

 var property tieneEmpanado

 override method esAptoCeliaco() = tieneEmpanado

 override method esEspecial() = super() && tieneEmpanado

 override method valoracion() = if(self.esEspecial()) 120 else 80

}

class Hamburguesa inherits Comida{

  const pesoMedallon 
  const pan

  override method peso() = pesoMedallon + pan.peso()

  override method esAptoCeliaco() = pan.aptoCeliaco()

  override method valoracion() = self.peso() / 10

}

class Pan{
  var property peso
  var property aptoCeliaco
}

const panIndustrial = new Pan(peso = 60, aptoCeliaco = false)
const panCasero = new Pan(peso = 100, aptoCeliaco = false)
const panMaiz = new Pan(peso = 30, aptoCeliaco = true)

class HamburguesaDoble inherits Hamburguesa{

 override method peso() = pesoMedallon * 2

 override method esEspecial() = self.peso() > 500
}

class CorteDeCarne inherits Comida{

  var peso

  var estaAPunto

  override method peso() = peso

  override method esEspecial() = super() && estaAPunto

  override method esAptoCeliaco() = true

  override method valoracion() = 100
}

class Parrillada inherits Comida{

  const comidas = []

  override method peso() = comidas.sum({comida => comida.peso()})

  override method esEspecial() = super() && comidas.size() >= 3

  override method esAptoCeliaco() = comidas.all({comidas => comidas.esAptoCeliaco() == 1})

  override method valoracion() = comidas.max({comida => comida.valoracion()}).valoracion()
}

class Comensal{

  var property dinero

  var property tipoComida

  method leAgrada(comida)

  method darseUnGustito(){
    if(self.platosAccesibles().size()>= 1){
      self.comprarPlato(self.platoMayorValoracion())
    }
    else{
      throw new DomainException(message = "No hay plato disponibles para comprar")
    }
  }

  method platoMayorValoracion() = self.platosAccesibles().max({plato => plato.valoracion()})

  method platosAccesibles() =
    parrillaMiguelito.platosDisponibles(self).filter({plato => self.leAgrada(plato)})

  method comprarPlato(plato){
    dinero -= plato.precio()
  }

  method cambiarHabito(nuevoHabito){

    tipoComida = nuevoHabito
  }


}

object parrillaMiguelito{

  var dinero = 0

  const platos = []

  method vender(plato){
    dinero += plato.precio()
  }

  method dinero() = dinero

  method platosDisponibles(cliente) =
    platos.filter({plato=> plato.dinero() <= cliente.dinero()})
}


class Celiacos inherits Comensal{
  
  override method leAgrada(comida) = comida.aptoCeliaco()
}

class PaladarFino inherits Comensal{

  override method leAgrada(comida) = comida.esEspecial() || comida.valoracion() > 100
}

class TodoTerreno inherits Comensal{
  
  override method leAgrada(comida) = 1
}
