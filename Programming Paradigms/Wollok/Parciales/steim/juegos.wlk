class Juego{

  const property precio

  var property precioConDescuento

  const caracteristicas = []

  method precioJuegoConDescuento(descuento) {

  precioConDescuento = descuento.aplicarDescuento(self)

  } 
  
}

object steim{

const juegos = []

method juegoMasCaro() = juegos.max({juego => juego.precio()}).precio()

method descuentoAJuegosBaratos(porcentaje) {
    const juegosQueCumplen = juegos.filter({juego => juego.precioActual() > 0.75 * self.juegoMasCaro()})
    juegosQueCumplen.forEach({juego => juego.precioJuegoConDescuento(porcentaje)})
  }

}

class Descuento{

  method aplicarDescuento(juego) = juego.precio() - juego.precio() * 0.25
}

class Directo inherits Descuento{

  var property descuento

  override method aplicarDescuento(juego) = juego.precio() * descuento
}

class Fijo inherits Descuento{

  var property montoFijo

  override method aplicarDescuento(juego) = (juego.precio() / 2).max(juego.precio() - montoFijo)
}

class Gratis inherits Descuento{
  override method aplicarDescuento(juego) = 0
}

class DirectoModificado inherits Descuento{

  var esClienteHaceTiempo
  
  override method aplicarDescuento(juego) = if(esClienteHaceTiempo) super(juego) - 75 else super(juego) * 2
}

