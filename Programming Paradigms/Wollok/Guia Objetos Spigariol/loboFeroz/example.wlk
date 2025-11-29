object feroz {

  var peso = 10

  method peso() = peso

  method peso(_peso){
    peso = _peso
  }

  method modificarPeso(modificador){
    peso = peso + modificador
  }

  method estaSaludable() {
    return peso > 20 && peso < 150
  }
  
  method crisisEmocional(){
    peso = 10
  }

  method comer(pesoComida){
    peso = peso + (pesoComida * 0.1)
  }

  method correr(){
    peso = peso - 1
  }

  method soplar(casa){
    peso = peso - (casa.resistencia() + casa.pesoTotal())
    casa.caerCasa()
  }

}

object casaPaja{

  const resistencia = 0

  var pesoTotal = habitante.peso()

  var habitante = chanchoFlojo

  method pesoTotal() = pesoTotal

  method resistencia() = resistencia

  method habitante() = habitante

  method caerCasa(){
    habitante.correrAOtraCasa()
  }
}

object chanchoFlojo{

  const peso = 100

  method peso() = peso

  method correrAOtraCasa(){

    casaMadera.incorporarHabitante(self)
    
  }

}

object casaMadera{

  const resistencia = 5

  var habitante = chanchoCapo

  var pesoTotal = habitante.peso()

  method resistencia() = resistencia

  method habitante() = habitante

  method pesoTotal () = pesoTotal

  method incorporarHabitante(nuevoIntegrante){

    pesoTotal = pesoTotal + nuevoIntegrante.peso()
  }
  method caerCasa(){
    habitante.correrAOtraCasa()
  }
}

object chanchoCapo{

  const peso = 85

  method peso() = peso

  method correrAOtraCasa(){

    casaLadrillos.incorporarHabitante(self)
    
  }

}

object casaLadrillos{

  var resistencia = 0
  var cantidadLadrillos = 0
  var habitante = chanchoPiola
  var pesoTotal = habitante.peso()

  method resistencia() = cantidadLadrillos * 2

  method cantidadLadrillos(ladrillos){
    cantidadLadrillos = ladrillos
  }

  method habitante() = habitante

  method incorporarHabitante(nuevoIntegrante){

    pesoTotal = pesoTotal + nuevoIntegrante.peso()
  }

}

object historiaChanchos{

  feroz.soplar(casaPaja)


}


object chanchoPiola{

  const peso = 75

  method peso() = peso
}


object caperucita{

   var peso = 60
   var manzanasCanasta = 6
   const pesoManzana = 0.2
   
  method peso() = peso

  method pesoManzana() = pesoManzana

  method manzanasCanasta() = manzanasCanasta

  method manzanasCanasta(cantidad){
    manzanasCanasta = cantidad
   }

  method pesoCanasta() = manzanasCanasta * pesoManzana
  
  method agregarOQuitarManzanas(modificador){
    manzanasCanasta = manzanasCanasta + modificador
   }
  
  method serComida(){
    peso = 0
    manzanasCanasta = 0
  }

  method serSalvada(){
    peso = 60
  }

}

object abuelita{

  var peso = 50

  method peso() = peso

  method serComida(){
    peso = 0
  }

  method serSalvada(){
    peso = 50
  }
}

object cazador{

  const peso = 80

  method peso() = peso

  method dispararFeroz(){
    feroz.peso(0)
  }

}

object historiaCaperucita{

  method contar(){

  feroz.correr()
  feroz.correr()
  feroz.comer(abuelita.peso())
  abuelita.serComida()
  caperucita.agregarOQuitarManzanas(-1)
  feroz.comer(caperucita.peso() + caperucita.pesoCanasta())
  caperucita.serComida()
  cazador.dispararFeroz()
  abuelita.serSalvada()
  caperucita.serSalvada()

  }

  method estaSaludable(){

    feroz.estaSaludable()

  }

}