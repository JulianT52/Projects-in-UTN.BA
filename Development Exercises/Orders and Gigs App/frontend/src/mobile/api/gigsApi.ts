import { apiGet, apiPost } from './client';
import type { Categoria, Gig, OrdenGig, Vendedor } from '../types/gig';

type GigsResponse = {
  total: number;
  gigs: Gig[];
};

type GigCreatePayload = {
  nombre: string;
  descripcion: string;
  imagen: string;
  categoria: Categoria;
  vendedor: Vendedor & { email: string };
  paquetes: Array<{ nombre: string; precio: number; diasDeEntrega: number }>;
};

// GET /gigs?q=&categoriaId=&orden=
export async function obtenerGigs(params?: {
  q?: string;
  categoriaId?: number;
  orden?: OrdenGig;
}): Promise<Gig[]> {
  const query = new URLSearchParams();
  if (params?.q) query.set('q', params.q);
  if (params?.categoriaId) query.set('categoriaId', String(params.categoriaId));
  if (params?.orden) query.set('orden', params.orden);

  const qs = query.toString();
  const data = await apiGet<GigsResponse>(`/gigs${qs ? `?${qs}` : ''}`);
  return data.gigs;
}

// GET /gigs/:id
export async function obtenerGigPorId(id: number): Promise<Gig> {
  return apiGet<Gig>(`/gigs/${id}`);
}

// POST /gigs
export async function crearGig(payload: GigCreatePayload): Promise<Gig> {
  const data = await apiPost<{ gig: Gig }>('/gigs', payload);
  return data.gig;
}

// GET /gigs/categoria/:categoriaId
export async function obtenerGigsPorCategoria(categoriaId: number): Promise<Gig[]> {
  const data = await apiGet<GigsResponse>(`/gigs/categoria/${categoriaId}`);
  return data.gigs;
}
