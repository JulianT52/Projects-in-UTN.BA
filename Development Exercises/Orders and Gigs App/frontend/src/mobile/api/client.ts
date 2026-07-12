import { Platform } from 'react-native';

/**
 * Web/emulador: normalmente puede usar localhost.
 * Expo Go en celular físico: localhost apunta al celular, no a tu PC.
 * En ese caso creá un archivo .env en /frontend con:
 * EXPO_PUBLIC_API_BASE_URL=http://TU_IP_DE_LA_PC:3000
 */
const envApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

export const API_BASE_URL =
  envApiBaseUrl ||
  Platform.select({
    android: 'http://10.0.2.2:3000',
    ios: 'http://localhost:3000',
    web: 'http://localhost:3000',
    default: 'http://localhost:3000',
  });

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type ErrorBody = { error?: string; message?: string; details?: { message: string }[] };

async function manejarRespuesta<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const mensaje =
      body?.details?.[0]?.message ??
      body?.error ??
      body?.message ??
      'Ocurrió un error al conectar con el servidor';
    throw new ApiError(mensaje, response.status);
  }

  return response.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  return manejarRespuesta<T>(response);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return manejarRespuesta<T>(response);
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return manejarRespuesta<T>(response);
}
