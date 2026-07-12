import { UnprocessableEntityError } from "../errors/AppError.js"

export class Producto {
  id;
  nombre;
  precio;
  cantidad;
  categoria;
  eliminado;
  descuentos;

  constructor(nombre, precio, cantidad, categoria) {
    this.validarNombre(nombre);
    this.validarPrecio(precio);
    this.validarCantidad(cantidad);
    this.validarCategoria(categoria);

    this.nombre = nombre.trim();
    this.precio = precio;
    this.cantidad = cantidad;
    this.categoria = categoria.trim();
    this.eliminado = false;
    this.descuentos = [];
  }

  precioFinal() {
    const precioBaseTotal = this.precio * this.cantidad;

    const precioFinal = this.descuentos.reduce((precioAnterior, descuento) => {
      const valorDescuento = descuento.valorDescontado(this);

      if (!Number.isFinite(valorDescuento) || valorDescuento < 0) {
        throw new UnprocessableEntityError("El descuento aplicado no es válido");
      }

      return precioAnterior - valorDescuento;
    }, precioBaseTotal);

    return Math.max(0, precioFinal);
  }

  agregarDescuento(nuevoDescuento) {
    if (!nuevoDescuento || typeof nuevoDescuento.valorDescontado !== "function") {
      throw new UnprocessableEntityError("El descuento es inválido");
    }

    this.descuentos.push(nuevoDescuento);
  }

  agregarDecuento(nuevoDescuento) {
    this.agregarDescuento(nuevoDescuento);
  }

  validarNombre(nombre) {
    if (typeof nombre !== "string" || nombre.trim().length === 0) {
      throw new UnprocessableEntityError("El nombre del producto es obligatorio");
    }
  }

  validarPrecio(precio) {
    if (!Number.isFinite(precio) || precio <= 0) {
      throw new UnprocessableEntityError("El precio debe ser un número mayor a 0");
    }
  }

  validarCantidad(cantidad) {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new UnprocessableEntityError("La cantidad debe ser un entero mayor a 0");
    }
  }

  validarCategoria(categoria) {
    if (typeof categoria !== "string" || categoria.trim().length === 0) {
      throw new UnprocessableEntityError("La categoría del producto es obligatoria");
    }
  }
}