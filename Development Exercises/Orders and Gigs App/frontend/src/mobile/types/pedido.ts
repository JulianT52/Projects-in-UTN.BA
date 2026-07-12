export type EstadoPedidoValor =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'EN_REVISION'
  | 'ENTREGADO'
  | 'CANCELADO';

export type EstadoPedido = {
  actual: EstadoPedidoValor;
  descripcion: string;
};

export type Cliente = {
  id: number;
  nombre?: string;
  apellido?: string;
};

export type GigResumen = {
  id: number;
  nombre: string;
};

export type PaqueteResumen = {
  nombre: string;
  diasDeEntrega?: number;
  precio?: number;
};

export type Pedido = {
  id: number;
  cliente: Cliente;
  gig: GigResumen;
  paquete: PaqueteResumen;
  total: number;
  estado: EstadoPedido;
  diasEntregaEsperados: number | null;
  entregarEn: string;
  requerimientos?: string;
  mensajes?: unknown[];
};