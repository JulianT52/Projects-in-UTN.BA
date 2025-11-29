
object fuerzaOscura{
  var valor = 5

  method valor() = valor

  method valor(nuevoValor){
    valor = nuevoValor
  }


}

object eclipse{

  method hacerEclipse(){
    fuerzaOscura.valor(fuerzaOscura.valor()*2)
  }
}

object rolando {

  const nivelBase = 3

  var property hechizoFavorito = 0

  var nivelHechizeria = 0

  method nivelHechizeria() = (nivelBase * hechizoFavorito.poder()) + fuerzaOscura.valor()

  method seCreePoderoso() = (self.hechizoFavorito()).esPoderoso()
}

object hechizo{

  var property nombre = 0

  var property tipo = 0

  method poder(){
  if(tipo == "superior")
    return (self.nombre()).size()
  else
    return 10
  }

  method esPoderoso(){
    if(tipo == "superior")
     return (self.poder() > 15)
    else
     return false
}
}

object hechizoBasico{

  const property poder = 10

  method esPoderoso() = false
}