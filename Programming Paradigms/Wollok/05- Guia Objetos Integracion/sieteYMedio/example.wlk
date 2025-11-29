class Carta{

  const property numero

  const property valor

  method asignarValor(carta){
    if(carta.numero() < 13){
        if(carta.numero() >= 10)
        carta.valor(0.5)
        else{
        carta.valor(carta.numero())
        }
    }
    else{
        self.error("No existen cartas con ese numero")
    }
  }
}

class Jugador {

    var property nombre = 0

    const cartas = []

    var property limite = 7 
    
    method puntaje() = cartas.sum({ carta => carta.valor() })

    method quiereOtraCarta() = self.puntaje() < limite && self.puntaje() <= 7.5
    
    method recibirCarta(carta) {
        cartas.add(carta)
    }
    
    method sePaso() = self.puntaje() > 7.5
}
    

object mazo {
    const numerosPosibles = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12]

    method sacarCarta() {
        return new Carta(numero = numerosPosibles.anyOne(), valor = 0)
    }
}

object juego {
    const jugadores = [] 
    
    method agregarJugador(nombre) {
        jugadores.add(new Jugador(nombre = nombre, cartas = []))
    }

    method iniciarJuego() {
        jugadores.forEach({ jugadorJugando => 
            jugadorJugando.recibirCarta(mazo.sacarCarta()) 
        })
        jugadores.forEach({ jugadoresJugando => self.jugarTurno(jugadoresJugando) })  
    }

    method jugarTurno(jugador) {
        if (jugador.quiereOtraCarta()) {
            jugador.recibirCarta(mazo.sacarCarta())
            self.jugarTurno(jugador) 
        }
    }

    method ganadores(puntajeBanca) {
        return jugadores.filter({ jugadores => 
            !jugadores.sePaso() and jugadores.puntaje() > puntajeBanca
        })
    }
}
