import type { Usuario, UserRole } from '@/types';

const TOKEN_KEY = 'token';

/**
 * Claims esperados del JWT (contrato del futuro módulo `auth` del backend, aún no
 * implementado — ver doc/ESTRUCTURA-PROYECTO.md §4). El backend embebe rol/email/
 * empresaId en el propio token para que el frontend pueda rehidratar la sesión al
 * recargar sin un round-trip extra a `/auth/me`.
 */
interface JwtPayload {
  sub: string;
  email: string;
  rol: UserRole;
  empresaId: string | null;
  municipalidadId: string | null;
  exp: number;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

/** Expiración del token en ms epoch, o `null` si no se pudo decodificar. */
export function getTokenExpiry(token: string): number | null {
  const payload = decodeJwtPayload(token);
  return payload ? payload.exp * 1000 : null;
}

export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token);
  return expiry === null || expiry <= Date.now();
}

export function usuarioFromToken(token: string): Usuario | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return {
    id: payload.sub,
    email: payload.email,
    rol: payload.rol,
    activo: true,
    empresaId: payload.empresaId,
    municipalidadId: payload.municipalidadId,
  };
}
