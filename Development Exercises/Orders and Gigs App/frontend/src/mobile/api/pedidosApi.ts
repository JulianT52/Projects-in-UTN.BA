import { apiGet, apiPatch, apiPost } from './client';
import type { Pedido } from '../types/pedido';
import type { Gig, Mensaje } from '../types/gig';
import type { Usuario } from '../types/usuario';

type PedidosPorClienteResponse = {
  clienteId: string;
  total: number;
  pedidos: Pedido[];
};

// GET /pedidos/cliente/:clienteId (backend/src/routes/pedidosRoutes.js)
export async function obtenerPedidosDelCliente(clienteId: number): Promise<Pedido[]> {
  const data = await apiGet<PedidosPorClienteResponse>(`/pedidos/cliente/${clienteId}`);
  return data.pedidos;
}

type PedidosPorGigResponse = {
  gigId: string;
  total: number;
  pedidos: Pedido[];
};

// GET /pedidos/gig/:gigId (backend/src/routes/pedidosRoutes.js)
export async function obtenerPedidosDelGig(gigId: number): Promise<Pedido[]> {
  const data = await apiGet<PedidosPorGigResponse>(`/pedidos/gig/${gigId}`);
  return data.pedidos;
}

type CrearPedidoPayload = {
  cliente: Usuario;
  gig: Gig;
  paquete: { nombre: string; precio: number; diasDeEntrega: number };
  total: number;
  requerimientos?: string;
};

// POST /pedidos
export async function crearPedido(payload: CrearPedidoPayload): Promise<Pedido> {
  const data = await apiPost<{ pedido: Pedido }>('/pedidos', payload);
  return data.pedido;
}

// PATCH /pedidos/:id/cancelar
export async function cancelarPedido(pedidoId: number): Promise<Pedido> {
  const data = await apiPatch<{ pedido: Pedido }>(`/pedidos/${pedidoId}/cancelar`);
  return data.pedido;
}

type MensajesResponse = {
  pedidoId: string;
  total: number;
  mensajes: Mensaje[];
};

// GET /pedidos/:id/mensajes
export async function obtenerMensajesPedido(pedidoId: number): Promise<Mensaje[]> {
  const data = await apiGet<MensajesResponse>(`/pedidos/${pedidoId}/mensajes`);
  return data.mensajes;
}

// POST /pedidos/:id/mensajes
export async function enviarMensaje(
  pedidoId: number,
  payload: { usuario: Usuario; mensaje: string },
): Promise<Pedido> {
  const data = await apiPost<{ pedido: Pedido }>(`/pedidos/${pedidoId}/mensajes`, payload);
  return data.pedido;
}

// POST /pedidos/:id/opiniones
export async function agregarOpinion(
  pedidoId: number,
  payload: { usuario: Usuario; puntuacion: number; comentario: string },
): Promise<void> {
  await apiPost(`/pedidos/${pedidoId}/opiniones`, payload);
}

// GET /pedidos
type AllPedidosResponse = { total: number; pedidos: Pedido[] };
export async function obtenerTodosPedidos(): Promise<Pedido[]> {
  const data = await apiGet<AllPedidosResponse>('/pedidos');
  return data.pedidos;
}

// GET /pedidos/:id
export async function obtenerPedidoPorId(pedidoId: number): Promise<Pedido> {
  const data = await apiGet<{ pedido: Pedido }>(`/pedidos/${pedidoId}`);
  return data.pedido;
}

// PATCH /pedidos/:id/estado
export async function cambiarEstadoPedido(pedidoId: number, estado: string): Promise<Pedido> {
  const data = await apiPatch<{ pedido: Pedido }>(`/pedidos/${pedidoId}/estado`, { nuevoEstado: estado });
  return data.pedido;
}