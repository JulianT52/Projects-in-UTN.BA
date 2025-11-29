object pepita {
  var energia = 100

  method energia() = energia

  method volar(minutos) {
    energia = energia - minutos * 3
  }
  method estaCansada() = energia < 40

  method potenciar(){
    energia = energia * 2
  }

  method position() = game.at(1,8)

  method text() = "Soy Pepita"

  method image() = "pepita.jpg"

}

object bosque{

  method mostrar(){

    game.width(20)
    game.height(10)

    game.addVisual(pepita)
    game.start()
  }
}