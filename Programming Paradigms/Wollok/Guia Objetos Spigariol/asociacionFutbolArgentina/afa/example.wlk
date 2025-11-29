object partidobenefico {

const estadio = bombonera
var entradasVendidas = 0
const jugadorEstrella = messi
var precioEntrada = 10000

method jugadorEstrella() = jugadorEstrella

method estadio() = estadio

method precioEntrada() = precioEntrada

method precioEntrada(precioNuevo){
  precioEntrada = precioNuevo
}

method recaudacion(){
  entradasVendidas = jugadorEstrella.popularidad() * estadio.capacidadEstadio()
  return (entradasVendidas * precioEntrada) - jugadorEstrella.viaticos() - estadio.alquiler() - estadio.logistica() 
}
}

object partidoComun{

  var estadio = 0
  var entradasVendidas = 0
  var jugadorEstrella = 0
  var precioEntrada = 0

  method estadio (dondeSeJuega){
    estadio = dondeSeJuega
  }

  method estadio() = estadio
  
  method entradasVendidas (cuantasSeVendieron){
    entradasVendidas = cuantasSeVendieron
  }

  method entradasVendidas() = entradasVendidas

  method jugadorEstrella(quienEsLaEstrella){
    jugadorEstrella = quienEsLaEstrella
  }

  method jugadorEstrella() = jugadorEstrella

  method precioEntrada (cuantoSale){
    precioEntrada = cuantoSale
  }

  method precioEntrada() = precioEntrada

  method recaudacion(){
  entradasVendidas = jugadorEstrella.popularidad() * estadio.capacidadEstadio()
  return (entradasVendidas * precioEntrada) - jugadorEstrella.viaticos() - estadio.alquiler() - estadio.logistica() 
}
}

object messi{

var popularidad = 0.98
const viaticos = 100000

method popularidad() = popularidad
method viaticos()= viaticos

method perderPopularidad(cuanto){
  popularidad = self.popularidad() - cuanto
}

}
object bombonera{

  const capacidadBombonera = 50000
  const alquiler = 300000
  const logistica = 10000000

  method capacidadBombonera() = capacidadBombonera
  method alquiler() = alquiler
  method logistica() = logistica 
}

// Viendo el éxito del evento, ahora la afa decide invitar a otros jugadores a partidos homenajes y analiza otros estadios posibles. 
// Incluso se podria hacer mas de un partido con el mismo jugador invitado, recorriendo diferentes estadios del país
// Resolver los mismos requerimientos, pero con las siguientes consideraciones:
// La popularidad de Ronaldo es siempre la mitad de la de messi
// La popularidad de Mbappe se calcula como el doble de su edad más la cantidad de goles hechos en finales del mundo
// La capacidad del monumental depende del estado de avance de las obras de remodelación

object ronaldo{

  var popularidad = messi.popularidad()/2
  var viaticos = 0

  method popularidad() = popularidad

  method cambiarLiga(){
    popularidad = 0
  }

  method viaticos() = viaticos
  method viaticos(viaticos_){
  viaticos = viaticos_
  }
}

object mbappe{

  var cantidadGolesFinalDelMundo = 0
  var edad = 0
  var viaticos = 0

  method viaticos() = viaticos
  method viaticos(_viaticos){
    viaticos = _viaticos
  }

  method edad() = edad
  method edad(_edad){ 
    edad=_edad
    }

  method cantidadGolesFinalDelMundo() = cantidadGolesFinalDelMundo
  method cantidadGolesFinalDelMundo(goles){ 
    cantidadGolesFinalDelMundo = goles
    }

  method cumplirAnios(){
    edad = self.edad() + 1
  }
}

object monumental{

  var estadoReformas = 0
  const capacidadMaxima = 100000
  var capacidadActual = 0
  const alquiler = 700000
  const logistica = 12000000

  method alquiler() = alquiler

  method logistica() = logistica

  method capacidadMaxima() = capacidadMaxima
  
  method estadoReformas(_reformas){
    estadoReformas = _reformas
  }
  method estadoReformas() = estadoReformas

  method capacidadActual(){
    capacidadActual = self.estadoReformas() * self.capacidadMaxima()
    return capacidadActual
  }

  method avanzarObras(porcentaje){
  estadoReformas = estadoReformas + porcentaje
  if (estadoReformas > 1) {
    estadoReformas = 1 
  }
}
}

// 4) 

object colidio{

  var popularidad = 0.70
  var viaticos = 0

  method popularidad() = popularidad

  method viaticos(_viaticos){
    viaticos = _viaticos
  }

  method pechearlaEnPartidosImportantes(golesErrados){
    popularidad = self.popularidad() - golesErrados
  }

  method viaticos() = viaticos 
}

object homenajeAColidio{

  const estadio = monumental
  var entradasVendidas = 0
  const jugadorEstrella = colidio
  var precioEntrada = 0

  method precioEntrada(){
    precioEntrada = jugadorEstrella.popularidad() * 17000
    return precioEntrada
  }

  method estadio() = estadio

  method entradasVendidas(){
    entradasVendidas = jugadorEstrella.popularidad() * estadio.capacidadActual()
    return entradasVendidas
  }

  method recaudacion(){
    return (self.entradasVendidas() * self.precioEntrada()) - jugadorEstrella.viaticos() - estadio.viaticos() - estadio.alquiler()
  }

}
