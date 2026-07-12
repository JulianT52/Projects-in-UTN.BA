export type TipoUsuario = 'CLIENTE' | 'FREELANCER';

export type Usuario = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  tipo: TipoUsuario;
};