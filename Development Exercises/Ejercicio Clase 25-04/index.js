import { DescuentoFijo, DescuentoPorcentual, DescuentoPorCantidad, Producto } from "./domain.js";
import {
  aumentarPrecioBase,
  obtenerPrecioTotal,
  obtenerProductosMasBaratos,
  ordenarCarrito,
  precioMasAlto,
} from "./funciones.js";

const cocacola = new Producto("Cocacola", 2500, 3, "Bebidas");
const fideos = new Producto("Fideos", 1000, 2, "Alimentos");
const harina = new Producto("Harina", 800, 1, "Alimentos");
/*
console.log("Nombre: " + cocacola.nombre);
console.log("Categoria: " + cocacola.categoria);
console.log("Precio: " + cocacola.precio);

const unDescuentoFijo = new DescuentoFijo(500);
const otroDescuentoFijo = new DescuentoFijo(1000);
const unDescuentoPorcentual = new DescuentoPorcentual(10);

cocacola.agregarDecuento(unDescuentoFijo);
cocacola.agregarDecuento(otroDescuentoFijo);
cocacola.agregarDecuento(unDescuentoPorcentual);
// 2500 * 3 = 7500
// 7500 - 500 - 1000 - 750 = 5250

console.log("precio final: " + cocacola.precioFinal());


aumentarPrecioBase(carrito, 1000);

console.log("Precio nuevo cocacola: " + cocacola.precio);
console.log("Precio nuevo fideos: " + fideos.precio);

*/

const carrito = [cocacola, fideos, harina];

// console.log(precioMasAlto(carrito));
//console.log(obtenerProductosMasBaratos(carrito, 2000));
// console.log(obtenerPrecioTotal(carrito));

console.log(carrito);
ordenarCarrito(carrito);
console.log(carrito);
fideos.cantidad = 20;
ordenarCarrito(carrito);
console.log(carrito);
