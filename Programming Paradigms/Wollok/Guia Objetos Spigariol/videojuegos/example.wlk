object delfina {
  
  var property diversion = 0

  var property consolaEnUso = 0

  method agarrar(consola){
    consolaEnUso = consola
  }

  method jugar(videojuego){

    diversion += videojuego.jugar(videojuego)

  }
}

object play{

  const property jugabilidad = 10

  method usar(){

  }
}

object computadora{

  var jugabilidad = 0

  var property bateria = 0

  method jugabilidad(){
    if(bateria  < 15)
     return 1
    else
     return 8
  }

  method usar(){
    bateria = 14
  }
}

object arkanoid{

  method diversion(consola){
    return 50
  }
}

object mario{

  method diversion(consola){
    if(consola.jugabilidad() > 5)
     return 100
    else
     return 15
  }
}

object pokemon{

  method diversion(consola) = 10 * consola.jugabilidad()
}