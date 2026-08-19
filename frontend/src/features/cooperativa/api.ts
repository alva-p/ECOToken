import { api } from '@/lib/api';
import type { Empresa } from '@/types';

/** Buscador de empresas adheridas APROBADAS, con autocompletado (E4-HU03). */
export function buscarEmpresas(query: string): Promise<Empresa[]> {
  return api<Empresa[]>(`/empresas/buscar?q=${encodeURIComponent(query)}`);
}
