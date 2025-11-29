class Mensaje{

  var contenido 

  var property emisor

  const property datosFijos = 5

  const property factorRed = 1.3

  method peso() = datosFijos + contenido.peso() * factorRed

}

class Texto{

  var caracteres

  method peso() = caracteres * 1
}

class Audio{

  var duracion

  method peso() = duracion * 1.2

}

class Imagen{

  var ancho
  var largo
  var descomprension
  const pesoPixel = 2
  
  method cantidadPixeles() = ancho * largo

  method peso() = descomprension.peso(self.cantidadPixeles()) * 2
}

object compresionOriginal{
  method peso(cantidadPixeles) = cantidadPixeles
}

object variable{

  var property porcentaje = 0

  method peso(cantidadPixeles) = cantidadPixeles * porcentaje
}

object maxima{

  method peso(cantidadPixeles) = 10000.min(cantidadPixeles)
}

class GIF inherits Imagen{

  var property cantidadCuadros 

  override method peso() = super() * cantidadCuadros
}

class Contacto{

var usuarioEnviado

method peso() = 3
  
}

class Chat{

  const mensajes = []

  const participantes = []

  method espacioOcupado() = mensajes.sum {mensaje => mensaje.peso()}

  method enviarMensaje(mensaje){

    if(not self.cumpleCondicion(mensaje))
     throw new DomainException(message = "No se puede enviar el mensaje")
    else{
      mensajes.add(mensaje)
    }
  }

  method cumpleCondicion(mensaje) = participantes.contains(mensaje.emisor()) && participantes.all({usuario => usuario.espacioSuficientePara(mensaje)})
}

class Difusion inherits Chat{

override method cumpleCondicion(mensaje) = super(mensaje) && (mensaje.emisor()).esCreador()  

}

class Restringido inherits Chat{

  var property cantidadMaxima

  override method cumpleCondicion(mensaje) = super(mensaje) && mensajes.size() < cantidadMaxima
}

class Ahorro inherits Chat{

  const pesoMaximo

  override method cumpleCondicion(mensaje) = super(mensaje) && mensaje.peso() < pesoMaximo
}

class Usuario{

  const property nombre

  var memoriaDisponible

  const property chats = []
 
  const property chatsSinLeer = []

  var property esCreador

  method recibirNotificacion(notificacion) { chatsSinLeer.add(notificacion) }

  method leer(chat) {
		chatsSinLeer.filter({nuevo => nuevo.chat() == chat}).forEach({nuevo => nuevo.leer()})
	}

  method espacioSuficientePara(mensaje) = self.espacioOcupado() + mensaje.peso() <= memoriaDisponible

  method espacioOcupado() = chats.sum {chat => chat.espacioOcupado()}

  method mensajesMasPesados() = chats.map({chat => chat.mensajeMasPesado()})

  method buscarEnChat(texto) = chats.filter({chat => chat.apareceEnChat(texto)})

  method apareceEnChat(texto) = nombre.contains(texto)
}