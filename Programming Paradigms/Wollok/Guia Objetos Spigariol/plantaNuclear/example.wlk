object central {
  var property barrasDeUranio = 0
  var property dueño = 0
  var property empleado = 0

  method estaEnPeligro() =  ((not dueño.esMillonario()) || (self.barrasDeUranio() > 10000 && empleado.estaDistraido()))

  method agregarBarras(barras){
    barrasDeUranio += barras
  }
  
}

object homero{

var property donas = 0

method estaDistraido() = donas < 2

method comprarDonas(){
  donas += 12
}

method comerDonas(){
  donas -= 1
}
}

object patoBalancin{
  method estaDistraido() = false
}

object lenny{
  var property cervezasTomadas = 0

  method tomarCerveza(){
    cervezasTomadas += 1
  }

  method estaDistraido() = cervezasTomadas > 3
}

object mrsBurns{

  var property esMillonario = true

  method despojarRiquezas(){
    esMillonario = false
  }
}

