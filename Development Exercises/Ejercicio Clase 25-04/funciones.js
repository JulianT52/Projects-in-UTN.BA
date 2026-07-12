export function aumentarPrecioBase(productos, valor) {
  productos.forEach((p) => {
    p.precio = p.precio + valor;
  });
  /*
  map
  */
}

export function precioMasAlto(productos) {
  const precios = productos.map((p) => p.precioFinal());
  return Math.max(...precios);
}

export function obtenerProductosMasBaratos(productos, precioTope) {
  return productos.filter((p) => p.precioFinal() <= precioTope);
}

export function obtenerPrecioTotal(productos) {
  return productos.reduce(function (acumulador, producto) {
    return acumulador + producto.precioFinal();
  }, 0);
}

export function ordenarCarrito(productos) {
  productos.sort((p1, p2) => p1.precioFinal() - p2.precioFinal());
}
