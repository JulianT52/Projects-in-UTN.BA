import type { Gig, Paquete } from '../types/gig';
import type { Pedido } from '../types/pedido';

export type RootStackParamList = {
  Login: undefined;

  // Cliente
  ExplorarGigs: undefined;
  DetalleGig: { gig: Gig };
  CrearPedido: { gig: Gig; paquete: Paquete };
  MisPedidos: undefined;
  ChatPedido: { pedido: Pedido };
  Opinar: { pedido: Pedido };

  // Freelancer
  PedidosDelGig: undefined;
  CrearGig: undefined;
};
