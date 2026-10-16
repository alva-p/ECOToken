import { api } from '@/lib/api';
import type { TipoMaterial } from '@/types';
import type { Beneficio, Canje } from '@/features/municipio/api';

/** Fila del historial de aportes (E6-HU02): ya viene aplanada por el backend. */
export interface AporteHistorial {
  id: string;
  fecha: string;
  cooperativa: string | null;
  material: string;
  peso: number;
  tokens: number;
}

export interface MisAportesFiltros {
  page?: number;
  limit?: number;
  desde?: string;
  hasta?: string;
  tipoMaterialId?: string;
}

export interface MisAportesResponse {
  data: AporteHistorial[];
  total: number;
  page: number;
  limit: number;
}

function buildQuery(filtros: MisAportesFiltros): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filtros)) {
    if (value) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/** Historial paginado de aportes de la empresa logueada, para auditoría interna. */
export function misAportes(
  filtros: MisAportesFiltros = {},
): Promise<MisAportesResponse> {
  return api<MisAportesResponse>(`/ingresos/mis-aportes${buildQuery(filtros)}`);
}

/** Tipos de material, para el filtro del historial. */
export function listarMateriales(): Promise<TipoMaterial[]> {
  return api<TipoMaterial[]>('/materiales');
}

/** Comprobante digital de un aporte puntual (E5-HU03). */
export interface ComprobanteAporte {
  id: string;
  fecha: string;
  cooperativa: string | null;
  material: string;
  peso: number;
  tokens: number;
  estado: string;
  txHash: string | null;
}

export function comprobanteAporte(id: string): Promise<ComprobanteAporte> {
  return api<ComprobanteAporte>(`/ingresos/${id}/comprobante`);
}

export interface MiSaldo {
  saldo: number;
  walletAddress: string | null;
  razonSocial: string | null;
}

/** Saldo actual de tokens ECO, dirección EVM y razón social de la organización logueada (E6-HU01). */
export function miSaldo(): Promise<MiSaldo> {
  return api<MiSaldo>('/tokens/mi-saldo');
}

// ─── Beneficios municipales ───

export interface BeneficioDisponible extends Beneficio {
  /** null = sin límite de cupos. */
  cuposDisponibles: number | null;
}

/** Catálogo vigente, saldo y canjes propios. disponible = saldo − ECO reservados en canjes no rechazados. */
export interface BeneficiosOrganizacion {
  saldo: number;
  reservado: number;
  disponible: number;
  beneficios: BeneficioDisponible[];
  canjes: Canje[];
}

export const beneficiosOrganizacion = () =>
  api<BeneficiosOrganizacion>('/beneficios/organizacion');

export const canjearBeneficio = (id: string) =>
  api<Canje>(`/beneficios/${id}/canjear`, { method: 'POST' });

// ─── Mi Perfil + verificación (E3-HU05 / E3-HU06) ───

export type EstadoVerificacion =
  | 'SIN_VERIFICAR'
  | 'EN_REVISION'
  | 'VERIFICADA'
  | 'RECHAZADA';

export type TipoDocumento =
  | 'ACTA_CONSTITUCION'
  | 'LICENCIA_COMERCIAL'
  | 'DOCUMENTO_IMPOSITIVO'
  | 'FACTURA_SERVICIOS';

/** Datos de la empresa logueada para la pantalla "Mi Perfil". */
export interface MiPerfil {
  id: string;
  razonSocial: string;
  cuit: string;
  emailContacto: string | null;
  domicilio: string | null;
  representanteLegal: string | null;
  pais: string | null;
  codigoPostal: string | null;
  telefono: string | null;
  sitioWeb: string | null;
  descripcion: string | null;
  estado: string;
  estadoVerificacion: EstadoVerificacion;
  /** Ruta del logo en el servidor (null = sin logo). Para mostrarlo usar `urlLogoEmpresa`. */
  logoUrl: string | null;
}

/** Perfil de la empresa logueada. */
export const obtenerMiPerfil = () => api<MiPerfil>('/empresas/me');

/** Campos editables del perfil propio (no incluye CUIT). */
export interface ActualizarPerfilInput {
  razonSocial?: string;
  emailContacto?: string;
  telefono?: string;
  domicilio?: string;
  codigoPostal?: string;
  pais?: string;
  sitioWeb?: string;
  representanteLegal?: string;
  descripcion?: string;
}

/** Edita el perfil de la empresa logueada. */
export const actualizarMiPerfil = (dto: ActualizarPerfilInput) =>
  api<MiPerfil>('/empresas/me', {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/** URL pública del logo de una empresa (para usar en un <img>). */
export function urlLogoEmpresa(
  empresaId: string,
  version?: number | string,
): string {
  const v = version != null ? `?v=${version}` : '';
  return `${API_BASE}/empresas/${empresaId}/logo${v}`;
}

/** Sube/actualiza el logo de la empresa logueada (multipart). */
export async function subirLogo(archivo: File): Promise<void> {
  const token = localStorage.getItem('token');
  const body = new FormData();
  body.append('logo', archivo);
  const res = await fetch(`${API_BASE}/empresas/me/logo`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
}

/**
 * Sube un documento de verificación (E3-HU05) de la empresa. Usa FormData, por
 * eso no pasa por el wrapper `api` (que fuerza Content-Type JSON): el navegador
 * arma el multipart con su boundary.
 */
export async function subirDocumentoVerificacion(
  empresaId: string,
  tipo: TipoDocumento,
  archivo: File,
): Promise<void> {
  const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const token = localStorage.getItem('token');
  const body = new FormData();
  body.append('tipo', tipo);
  body.append('archivo', archivo);
  const res = await fetch(
    `${API_URL}/empresas/${empresaId}/documentos-verificacion`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body,
    },
  );
  if (!res.ok) throw new Error(`API ${res.status}`);
}
