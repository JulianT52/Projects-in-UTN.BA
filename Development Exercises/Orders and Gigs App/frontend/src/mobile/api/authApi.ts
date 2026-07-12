import { apiPost } from './client';
import type { TipoUsuario, Usuario } from '../types/usuario';

type BackendUsuarioData = {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  rol: string;
};

type AuthResponse = {
  success: boolean;
  message: string;
  data: BackendUsuarioData;
};

function mapBackendDataToUsuario(data: BackendUsuarioData): Usuario {
  return {
    id: data.id,
    nombre: data.nombre,
    apellido: data.apellido || '',
    email: data.email,
    tipo: data.rol.toUpperCase() as TipoUsuario,
  };
}

type Credenciales = {
  email: string;
  password: string;
};

type DatosRegistro = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
};

// POST /cliente/login (backend/src/routes/clienteRoutes.js)
export async function loginCliente(datos: Credenciales): Promise<Usuario> {
  const res = await apiPost<AuthResponse>('/cliente/login', datos);
  return mapBackendDataToUsuario(res.data);
}

// POST /freelancer/login (backend/src/routes/freelancerRoutes.js)
export async function loginFreelancer(datos: Credenciales): Promise<Usuario> {
  const res = await apiPost<AuthResponse>('/freelancer/login', datos);
  return mapBackendDataToUsuario(res.data);
}

// POST /cliente (backend/src/routes/clienteRoutes.js)
export async function registrarCliente(datos: DatosRegistro): Promise<Usuario> {
  const res = await apiPost<AuthResponse>('/cliente', datos);
  return mapBackendDataToUsuario(res.data);
}

// POST /freelancer (backend/src/routes/freelancerRoutes.js)
export async function registrarFreelancer(datos: DatosRegistro): Promise<Usuario> {
  const res = await apiPost<AuthResponse>('/freelancer', datos);
  return mapBackendDataToUsuario(res.data);
}