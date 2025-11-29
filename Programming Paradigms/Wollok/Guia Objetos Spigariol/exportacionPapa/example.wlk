object produccion{

  var costoProduccion = 0

  const derechoExportacion = 271

  var impuestoVigente = 0

  method costoProduccion() = costoProduccion

  method costoProduccion(papa){

    if(papa == papaBuena){
      costoProduccion = papaBuena.costoPapa()
      return costoProduccion
    }
    else{
      if(papa == papaRegular){
        costoProduccion = papaRegular.costoPapa(1)
        return costoProduccion
      }
      costoProduccion = papaPremium.costoPapa()
      return costoProduccion
    }
  }
}

object pais{

  var papasBuenas = 463
  var papasRegulares = 721 
  var papasPremium =  16

  var impuestoActual = 0

  var retencionAplicada = 0

  method retencionAplicada() = retencionAplicada

  method retencionAplicada(retencionAplicada2){
    retencionAplicada = retencionAplicada2
  }

  method impuestoActual() = impuestoActual

  method impuestoActual(impuestoActual2){
    impuestoActual = impuestoActual2
  }

  method recaudacion(){
    return produccion.costoProduccion(papasBuenas) * papasBuenas + produccion.costoProduccion(papasRegulares) * papasRegulares + produccion.costoProduccion(papasPremium) * papasPremium 
  }

  method papasBuenas() = papasBuenas
  method papasRegulares() = papasRegulares
  method papasPremium() = papasPremium

  method recaudacionTotal(){

    return impuesto.recaudacionSinImpuesto(impuestoActual) - retencion.recaudacionConRetencion(retencionAplicada)

  }
}

object impuesto{

  var recaudacionSinImpuesto = 0

   method recaudacionSinImpuesto(impuestoAplicado){
    if(impuestoAplicado == impuestoSimple){
      recaudacionSinImpuesto = pais.recaudacion() * impuestoAplicado.retencionActual()
      return recaudacionSinImpuesto
    }
    else{
      if((pais.recaudacion()-(pais.recaudacion() * impuestoAplicado.retencionActual())) < 100){
        recaudacionSinImpuesto = pais.recaudacion() * impuestoSimple.retencionActual()
        return recaudacionSinImpuesto
      }
      recaudacionSinImpuesto = pais.recaudacion() * impuestoAplicado.retencionActual()
      return recaudacionSinImpuesto
    }
   }
  }

object retencion{

  method recaudacionConRetencion(retencionAplicada){

    if(retencionAplicada == estatista){
      return estatista.retencionActual()
    }
    else{
      if(retencionAplicada == privatizador){
        return privatizador.retencionActual()
      }
      else{
        if(retencionAplicada == demagogica){
          return demagogica.retencionActual()
        }
        else{
          return nada.retencionActual()
        }
      }
    }
  }
}

object estatista{

  method retencionActual(){

    if(produccion.costoProduccion() > 1000){
      return 200
    }
    return 300
  }
}

object privatizador{

  method retencionActual(){
    return 50 + ((pais.papasBuenas() + pais.papasPremium() + pais.papasRegulares()) / 10)  
  }
}

object demagogica{

  method retencionActual(){
    return 100
  }
}

object nada{

  method retencionActual(){
    return 0
  }
}

object impuestoSimple{
  method retencionActual() = 0.1
}

object impuestoConGarantia{
  method retencionActual() = 0.05
}

object papaBuena{
  const costoPapa = 3
  method costoPapa() = costoPapa
}

object papaRegular{
  var costoPapa = 0 
  method costoPapa(costoPepe){
    costoPapa = costoPepe
    return costoPapa
  }
}

object papaPremium{
  const costoPapa = 4.5
  method costoPapa() = costoPapa
}