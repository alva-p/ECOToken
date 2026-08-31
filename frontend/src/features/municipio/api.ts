import { api } from '@/lib/api';

export interface VolumenPorEmpresa {
  empresaId: string;
  razonSocial: string;
  kgReciclados: number;
  tokensAcumulados: number;
  aportes: number;
}

export interface VolumenReciclado {
  data: VolumenPorEmpresa[];
  totalKg: number;
  totalTokens: number;
  empresasActivas: number;
  desde: string | null;
  hasta: string | null;
}

export interface VolumenFiltros {
  desde?: string;
  hasta?: string;
}

/** Volumen reciclado por canal empresarial en un período (E9-HU02). */
export function obtenerVolumen(
  filtros: VolumenFiltros = {},
): Promise<VolumenReciclado> {
  const params = new URLSearchParams();
  if (filtros.desde) params.set('desde', filtros.desde);
  if (filtros.hasta) params.set('hasta', filtros.hasta);
  const qs = params.toString();
  return api<VolumenReciclado>(`/reportes/volumen${qs ? `?${qs}` : ''}`);
}
