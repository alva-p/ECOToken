import { api } from '@/lib/api';
import type { Empresa } from '@/types';

export interface AltaCooperativaInput {
  razonSocial: string;
  cuit: string;
  emailContacto: string;
  domicilio?: string;
  representanteLegal?: string;
}

export interface AltaCooperativaResponse {
  empresa: Empresa;
  direccionEVM: string;
  txHash: string;
  credencialesTemporales: {
    email: string;
    passwordTemporal: string;
  };
}

/** Alta administrativa de cooperativa (E4-HU01): crea la cuenta operadora
 * on-chain (VALIDATOR_ROLE) y las credenciales de acceso de la cooperativa. */
export function altaCooperativa(
  dto: AltaCooperativaInput,
): Promise<AltaCooperativaResponse> {
  return api<AltaCooperativaResponse>('/empresas/cooperativas', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

// ─── E10-HU01: gestión de roles on-chain ───

export const ROLES_GOBERNABLES = [
  'MINTER_ROLE',
  'BURNER_ROLE',
  'VALIDATOR_ROLE',
  'EMERGENCY_ROLE',
] as const;

export type RolOnChain = (typeof ROLES_GOBERNABLES)[number];

export interface CuentaConRoles {
  direccionEVM: string;
  empresaId: string;
  razonSocial: string | null;
  roles: Record<RolOnChain, boolean>;
}

/** Cuentas custodiales con el estado on-chain (hasRole) de cada rol gobernable. */
export function listarCuentasConRoles(): Promise<CuentaConRoles[]> {
  return api<CuentaConRoles[]>('/admin/roles/cuentas');
}

export function otorgarRol(
  direccionEVM: string,
  rol: RolOnChain,
): Promise<{ txHash: string }> {
  return api<{ txHash: string }>('/admin/roles/otorgar', {
    method: 'POST',
    body: JSON.stringify({ direccionEVM, rol }),
  });
}

export function revocarRol(
  direccionEVM: string,
  rol: RolOnChain,
): Promise<{ txHash: string }> {
  return api<{ txHash: string }>('/admin/roles/revocar', {
    method: 'POST',
    body: JSON.stringify({ direccionEVM, rol }),
  });
}

// ─── E10-HU02: pausar/despausar el contrato con motivo ───

export interface EstadoContrato {
  pausado: boolean;
}

export function obtenerEstadoContrato(): Promise<EstadoContrato> {
  return api<EstadoContrato>('/admin/contrato/estado');
}

export function pausarContrato(motivo: string): Promise<{ txHash: string }> {
  return api<{ txHash: string }>('/admin/contrato/pausar', {
    method: 'POST',
    body: JSON.stringify({ motivo }),
  });
}

export function despausarContrato(motivo: string): Promise<{ txHash: string }> {
  return api<{ txHash: string }>('/admin/contrato/despausar', {
    method: 'POST',
    body: JSON.stringify({ motivo }),
  });
}

// ─── E3-HU04: aprobar/rechazar altas de empresa pendientes ───

export interface AprobarEmpresaResponse {
  empresa: Empresa;
  credencialesTemporales: {
    email: string;
    passwordTemporal: string;
  };
}

export function listarEmpresasPendientes(): Promise<Empresa[]> {
  return api<Empresa[]>('/empresas/pendientes');
}

export function aprobarEmpresa(id: string): Promise<AprobarEmpresaResponse> {
  return api<AprobarEmpresaResponse>(`/empresas/${id}/aprobar`, {
    method: 'PATCH',
  });
}

export function rechazarEmpresa(id: string): Promise<Empresa> {
  return api<Empresa>(`/empresas/${id}/rechazar`, { method: 'PATCH' });
}
