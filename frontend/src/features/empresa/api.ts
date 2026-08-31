import { api } from '@/lib/api';
import type { TipoMaterial } from '@/types';

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
