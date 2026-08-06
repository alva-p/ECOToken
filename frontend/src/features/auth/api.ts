import { api } from '@/lib/api';

interface LoginResponse {
  token: string;
}

/** Contrato esperado del módulo `auth` del backend (aún no implementado). */
export function loginRequest(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return api<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
