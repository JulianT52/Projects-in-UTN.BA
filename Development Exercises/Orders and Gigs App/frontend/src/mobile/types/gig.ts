export type Categoria = {
  id: number;
  nombre: string;
  descripcion?: string;
};

export type Vendedor = {
  id: number;
  nombre: string;
  apellido: string;
};

export type Paquete = {
  id?: number;
  nombre: string;
  precio: number;
  diasDeEntrega: number;
};

export type Opinion = {
  id?: number;
  cliente?: { id: number; nombre?: string; apellido?: string };
  puntuacion: number;
  comentario: string;
  fecha?: string;
};

export type Gig = {
  id: number;
  nombre: string;
  descripcion: string;
  imagen?: string;
  categoria: Categoria;
  vendedor: Vendedor;
  paquetes: Paquete[];
  opiniones: Opinion[];
  fechaPublicacion: string;
};

export type Mensaje = {
  usuario: { id: number; nombre?: string; apellido?: string; tipo?: string };
  mensaje: string;
  fechaEnvio?: string;
};

export type OrdenGig = 'precio' | 'puntaje' | 'fechaPublicacion';

// Categorías estáticas (el backend no expone /categorias)
export const CATEGORIAS: Categoria[] = [
  { id: 1, nombre: 'Diseño Gráfico', descripcion: 'Servicios creativos de diseño gráfico' },
  { id: 2, nombre: 'Desarrollo Web', descripcion: 'Creación de sitios y aplicaciones web' },
  { id: 3, nombre: 'Marketing Digital', descripcion: 'Estrategias digitales para hacer crecer marcas' },
];
