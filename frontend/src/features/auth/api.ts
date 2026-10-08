import { api } from '@/lib/api';
import type { Empresa } from '@/types';

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

/** Cambia la contraseña del usuario logueado; devuelve un token nuevo sin la marca de temporal. */
export function cambiarPasswordRequest(
  passwordActual: string,
  passwordNueva: string,
): Promise<LoginResponse> {
  return api<LoginResponse>('/auth/cambiar-password', {
    method: 'POST',
    body: JSON.stringify({ passwordActual, passwordNueva }),
  });
}

export interface RegistrarEmpresaInput {
  razonSocial: string;
  cuit: string;
  emailContacto: string;
  domicilio?: string;
  representanteLegal?: string;
  aceptaTerminos: boolean;
  versionTerminos: string;
}

/** Registro público de empresa (E3-HU01): queda PENDIENTE hasta que el admin la apruebe. */
export function registrarEmpresa(dto: RegistrarEmpresaInput): Promise<Empresa> {
  return api<Empresa>('/empresas/registro', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}
