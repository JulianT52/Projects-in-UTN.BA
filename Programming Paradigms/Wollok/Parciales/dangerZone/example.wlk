class Empleado{

  const property habilidades = []

  const subordinados = []
  
  var property esJefe

  var property salud

  method estaIncapacitado()

  method algunoTieneHabilidad(habilidad) = subordinados.any({subordinado => subordinado.habilidades().contains(habilidad)})

  method puedeUsarHabilidad(habilidad) = ((not self.estaIncapacitado()) && habilidades.contains(habilidad)) || (esJefe && self.algunoTieneHabilidad(habilidad))

  method tieneTodasLasHabilidades(mision) = (self.habilidades().intersection(mision.habilidadesNecesarias())).size() == mision.habilidadesNecesarias().size()

  method cumpleCondicion(mision) = self.tieneTodasLasHabilidades(mision)

  method cumplirMision(mision)

}

class Oficinista inherits Empleado{

  var property cantidadEstrellas

  method ganarEstrella(){
    cantidadEstrellas += 1
  }

  override method estaIncapacitado() = salud < (40 - (5 * cantidadEstrellas))

  override method cumplirMision(mision){
    self.ganarEstrella()
  }

  method puedeSerEspia() = cantidadEstrellas >= 3
}

class Espia inherits Empleado{

  override method estaIncapacitado() = salud < 15

  override method cumplirMision(mision){
    self.aprenderHabilidades(mision)
  }

  method aprenderHabilidades(mision){
    habilidades + mision.habilidadesNecesarias()
    habilidades.asSet()
  }
}


// Punto 3

class Equipo{
  
  var property integrantes = []

  method cumpleCondicion(mision) = integrantes.any({integrante => integrante.tieneTodasLashabilidades(integrante, mision)})

  method tieneTodasLasHabilidades(integrante, mision) = (integrante.habilidades().intersection(mision.habilidadesNecesarias())).size() == mision.habilidadesNecesarias().size()

}
class Mision{

  const property peligrosidad

  const property habilidadesNecesarias = []

  method cumpleMision(participantes) = participantes.cumpleCondicion(self)

  method aplicarDaño(participante){
    var saludTrasDaño = participante.salud() - peligrosidad * 0.3
    participante.salud(saludTrasDaño) 
  }

  method cumplirMision(participantes){

    if(self.cumpleMision(participantes)){
      self.aplicarDaño(participantes)
      if(participantes.salud() > 0)
      participantes.cumplirMision(self)
    }
    else{
      throw new Exception (message = "No se puede cumplir la mision")
    }
  }
}