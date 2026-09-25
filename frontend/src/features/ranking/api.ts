import { api } from '@/lib/api';

/** Período con ranking cerrado, con sus totales (E7-HU03). */
export interface PeriodoCerrado {
  mes: number;
  anio: number;
  fechaCierre: string | null;
  empresas: number;
  totalKg: number;
  totalTokens: number;
}

export interface FilaRanking {
  posicion: number;
  razonSocial: string;
  kgReciclados: number;
  tokens: number;
}

/** Ranking cerrado de un período, con el snapshot que lo respalda. */
export interface RankingPublico extends PeriodoCerrado {
  hashSnapshot: string | null;
  bloqueReferencia: number | null;
  data: FilaRanking[];
}

/** Períodos con ranking cerrado, del más reciente al más antiguo (público, sin login). */
export function listarPeriodos(limite?: number): Promise<PeriodoCerrado[]> {
  const qs = limite ? `?limite=${limite}` : '';
  return api<PeriodoCerrado[]>(`/ranking/publico/periodos${qs}`);
}

/** Ranking cerrado del período indicado; sin período, el último cerrado (público, sin login). */
export function obtenerRankingPublico(periodo?: {
  mes: number;
  anio: number;
}): Promise<RankingPublico> {
  const qs = periodo ? `?mes=${periodo.mes}&anio=${periodo.anio}` : '';
  return api<RankingPublico>(`/ranking/publico${qs}`);
}
