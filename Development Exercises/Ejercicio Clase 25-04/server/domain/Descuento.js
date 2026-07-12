export class DescuentoFijo {
  constructor(valor) {
    this.valor = valor;
  }

  valorDescontado(_producto) {
    return this.valor;
  }
}

export class DescuentoPorcentual {
  constructor(porcentaje) {
    this.porcentaje = porcentaje; // 20
  }

  valorDescontado(producto) {
    return producto.cantidad * producto.precio * (this.porcentaje / 100);
  }
}

export class DescuentoPorCantidad {
  constructor(cantidadComprada, cantidadPagada) {
    this.cantidadComprada = cantidadComprada
    this.cantidadPagada = cantidadPagada
  }

  valorDescontado(producto) {
    const unidadesPagadas = Math.floor(cantidad / this.cantidadComprada) * this.cantidadPagada + producto.cantidad % this.cantidadComprada;
    return unidadesPagadas * producto.precio;
  }
}