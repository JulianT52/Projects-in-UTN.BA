object lataPintura{
  const property rendimiento = 50
  var property costo = 200
  const property costoPorLitro = 3.5 

  method cantidadLatasNecesarias(superficie){
    return (superficie / rendimiento).ceil()
  }

  method dineroGastado(superficie){
    return self.cantidadLatasNecesarias(superficie) * self.costo() 
  }
  
  method dineroGastadoAGranel(superficie){
    return self.costoPorLitro() * superficie
  }
}

object aldo{
  var property ahorros = 6000

  method puedeContratar(pintor,pintura) = 
  (ahorros * 0.2) > (pintor.pintarCasa(habitacion.calcularSuperficie(),pintura) + pintor.pintarCasa(cocina.calcularSuperficie(),pintura))
}

object raul {

  method pintarCasa(cantidadMetros,pintura){

    if(pintura == "basica")
     return (25 * cantidadMetros) + lataPintura.costo()
    else
    return (25 * cantidadMetros) + (lataPintura.costoPorLitro() * cantidadMetros)
  
}
}

object carlos {
  method pintarCasa(cantidadMetros,pintura){
    if(cantidadMetros > 20)
     return 500 + ((cantidadMetros - 20) * 30)
    else
     return 500
  }
}

object venancio{

  method pintarCasa(cantidadMetros,pintura){
    if(pintura == "basica"){
     if(cantidadMetros % 10 != 0)
      return (((cantidadMetros / 10).floor() + 1) * 220) + lataPintura.costo()
     else 
      return ((cantidadMetros / 10).floor() * 220) + lataPintura.costo()
      }
      else{
        if(cantidadMetros % 10 != 0)
         return (((cantidadMetros / 10).floor() + 1) * 220) + (lataPintura.costoPorLitro() * cantidadMetros)
        else 
         return ((cantidadMetros / 10).floor() * 220) + (lataPintura.costoPorLitro() * cantidadMetros)
      }
}
}

object habitacion{

  method calcularSuperficie(){
    return 20
  }
}

object cocina{

  const largo = 2
  const alto = 3.5
  const ancho = 1

  method calcularSuperficie(){
    return (ancho + largo) * 2 * alto
  }
}