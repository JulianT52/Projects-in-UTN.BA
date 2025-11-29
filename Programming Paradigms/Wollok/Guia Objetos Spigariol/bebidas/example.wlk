object tito {

  var property peso = 70

  const property inercia = 490

  var property rendimiento = 1


method consumir(cantidad,bebida){

  if(bebida == cianuro)
   rendimiento = bebida.consumir(cantidad)
   
  else
  rendimiento = 1.max(bebida.consumir(cantidad)) 
}
  
method velocidad(bebida) = bebida.efectoRendimiento() *(self.inercia()/self.peso())
}

object whisky{

  const property efectoRendimiento = 0.9 

  method consumir(cantidad) = efectoRendimiento ** cantidad

}

object terere{

  const property efectoRendimiento = 0.1
  
  method consumir(cantidad) = efectoRendimiento * cantidad

}

object cianuro{

  const property efectoRendimiento = 0

  method consumir(cantidad) = 0

}
