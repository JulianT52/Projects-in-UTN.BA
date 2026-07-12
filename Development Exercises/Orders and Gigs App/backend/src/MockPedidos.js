/**
 * EJEMPLO DE USO - Sistema de Pedidos
 * 
 * Este archivo muestra cómo usar el sistema de pedidos implementado
 * No ejecutar directamente - Es solo referencia
 */

// ============================================
// PASO 1: Crear instancias de las clases Domain
// ============================================

import { Usuario } from "./domain/usuario.js"
import { Categoria } from "./domain/categoria.js"
import { Gig } from "./domain/gig.js"
import { Paquete } from "./domain/paquete.js"
import { Pedido } from "./domain/pedido.js"
import { EstadoPedido } from "./domain/estadoPedido.js"

// Crear usuario cliente
const cliente = new Usuario(
    1,
    "Juan",
    "Pérez",
    "juan.perez@email.com"
)

// Crear usuario vendedor
const vendedor = new Usuario(
    2,
    "Carlos",
    "López",
    "carlos.lopez@email.com"
)

// Crear categoría
const categoria = new Categoria(
    1,
    "Diseño Gráfico",
    "Servicios de diseño gráfico profesional"
)

// Crear un Gig (servicio)
const gig = new Gig(
    1,
    "Logo profesional",
    "Diseño de logo personalizado en 3 estilos diferentes",
    "https://ejemplo.com/logo.jpg",
    categoria,
    vendedor
)

const paquete = new Paquete(
    "Premium",
    200,  
    5   
)

// ============================================
// PASO 2: Usar la API REST para crear pedidos
// ============================================

// Hacer una petición POST /pedidos
const datosPedidoJSON = {
    cliente: cliente,
    gig: gig,
    paquete: paquete,
    total: 200,
    estado: EstadoPedido.PENDIENTE
}

/*
EJEMPLO DE RESPUESTA EXITOSA (201 Created):

{
  "mensaje": "Pedido creado exitosamente",
  "pedido": {
    "id": 1,
    "cliente": {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan.perez@email.com"
    },
    "gig": {
      "id": 1,
      "nombre": "Logo profesional",
      "descripcion": "Diseño de logo personalizado...",
      "vendedor": {
        "id": 2,
        "nombre": "Carlos",
        "apellido": "López"
      }
    },
    "paquete": {
      "nombre": "Premium",
      "precio": 200,
      "diasDeEntrega": 5
    },
    "total": 200,
    "estado": {
      "actual": "PENDIENTE",
      "descripcion": "Esperando confirmación del vendedor"
    },
    "fechaCreacion": "2026-06-29T10:30:00.000Z",
    "diasEntregaEsperados": null,
    "entregarEn": "Pendiente de confirmación"
  }
}
*/

// ============================================
// PASO 3: Visualizar todos los pedidos
// ============================================

// GET /pedidos
/*
EJEMPLO DE RESPUESTA:

{
  "total": 1,
  "pedidos": [
    {
      "id": 1,
      "cliente": { ... },
      "gig": { ... },
      "paquete": { ... },
      "total": 200,
      "estado": {
        "actual": "PENDIENTE",
        "descripcion": "Esperando confirmación del vendedor"
      },
      "fechaCreacion": "2026-06-29T10:30:00.000Z",
      "diasEntregaEsperados": null,
      "entregarEn": "Pendiente de confirmación"
    }
  ]
}
*/

// ============================================
// PASO 4: Cambiar estado a CONFIRMADO
// ============================================

// PATCH /pedidos/1/estado
const datosEstado = {
    nuevoEstado: EstadoPedido.CONFIRMADO
}

/*
EJEMPLO DE RESPUESTA (Después de confirmar):

{
  "mensaje": "Estado del pedido actualizado exitosamente",
  "pedido": {
    "id": 1,
    "cliente": { ... },
    "gig": { ... },
    "paquete": { ... },
    "total": 200,
    "estado": {
      "actual": "CONFIRMADO",
      "descripcion": "Confirmado - En proceso de entrega"
    },
    "fechaCreacion": "2026-06-29T10:30:00.000Z",
    "diasEntregaEsperados": 5,          // ← AHORA CALCULA LOS DÍAS
    "entregarEn": "5 días"              // ← INFORMACIÓN CLARA PARA EL USUARIO
  }
}
*/

// ============================================
// CARACTERÍSTICAS CLAVE
// ============================================

/*
1. ESTADOS DISPONIBLES:
   - PENDIENTE: Esperando confirmación del vendedor
   - CONFIRMADO: Confirmado - En proceso de entrega
   - EN_REVISION: En revisión por el vendedor
   - ENTREGADO: Pedido entregado exitosamente
   - CANCELADO: Pedido cancelado

2. CÁLCULO DE DÍAS:
   - Solo se calcula si estado = CONFIRMADO
   - Se basa en: fechaCreacion + paquete.diasDeEntrega
   - Si está hoy: muestra "0 días" (hoy mismo)
   - Actualiza automáticamente cada día

3. DIFERENCIACIÓN CLARA DEL ESTADO:
   - estado.actual: El valor técnico (CONFIRMADO, etc)
   - estado.descripcion: Descripción legible para el usuario
   - entregarEn: Texto amigable con días faltantes

4. PERSISTENCIA:
   - En memoria (Map)
   - Se pierde al reiniciar el servidor
   - IDs auto-incrementales
*/

// ============================================
// ENDPOINTS DISPONIBLES
// ============================================

/*
1. POST /pedidos
   Crear un nuevo pedido
   
2. GET /pedidos
   Obtener todos los pedidos
   
3. GET /pedidos/:id
   Obtener un pedido específico (ej: /pedidos/1)
   
4. GET /pedidos/cliente/:clienteId
   Obtener todos los pedidos de un cliente (ej: /pedidos/cliente/1)
   
5. PATCH /pedidos/:id/estado
   Cambiar el estado de un pedido (ej: /pedidos/1/estado)
*/
