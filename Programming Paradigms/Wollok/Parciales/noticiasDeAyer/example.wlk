class Noticia{

  var property fecha 
  var property fechaActual = new Date()
  var property gradoImportancia
  var property titulo
  var property desarrollo
  var property tipo
  
  method esCopada() = self.pasoMenosDeTresDias() && self.esImportante()

  method pasoMenosDeTresDias(){
    var diferencia = fechaActual.diffDays(fecha)
    return diferencia <= 3
  }

  method esImportante() = gradoImportancia >= 8

}

class ArticulosComunes inherits Noticia{

  var property linksANoticia = []

  override method esCopada() = super() && (linksANoticia.size() >= 2)
}

class Noticias inherits Noticia{

  var property dineroUtilizado

  override method esCopada() = super() && dineroUtilizado >= 2000000
}

class Reportajes inherits Noticia{

  var property entrevistado

  override method esCopada() = super() && self.tieneLetraImpar()

  method tieneLetraImpar() = ((entrevistado.length() % 2) == 1)
}

class Cobertura inherits Noticia{

  const noticias = []

  override method esCopada() = super() && noticias.all({noticia => noticia.esCopada()})
}

//Punto 2

class Periodista {
  var property fechaIngreso
  var property preferencia 

  method quierePublicar(noticia) = preferencia.quierePublicar(noticia)
}

class Preferencia {
  method quierePublicar(noticia)
}

class PrefCopada inherits Preferencia {
  override method quierePublicar(noticia) = noticia.esCopada()
}

class PrefSensacionalista inherits Preferencia{

  const palabrasClaves = ["espectacular", "increible", "grandioso"]

  override method quierePublicar(noticia) = self.esSensacionalista(noticia) || (noticia.entrevistado() == "Dibu Martinez") 

  method esSensacionalista(noticia) = self.contienePalabraClave(noticia)
  
  method contienePalabraClave(noticia) = palabrasClaves.any({ p => noticia.titulo().contains(p) })
}

class PrefVago inherits Preferencia{

  override method quierePublicar(noticia) = noticia.dineroUtilizado() > 2000000 || noticia.desarrollo().length() < 100
}

class PrefJoseDeZer inherits Preferencia {
  override method quierePublicar(noticia) = noticia.titulo().startsWith("T")
}

