/** Fila de desempeño de una empresa en el ranking del mes (E7-HU01). */
export interface FilaRankingMes {
  posicion: number;
  empresaId: string;
  razonSocial: string;
  tokens: number;
  totalKg: number;
  cantidadAportes: number;
}

/** Resultado consolidado del ranking del mes en curso vía API (E7-HU01). */
export interface RankingMesResponse {
  mes: number;
  anio: number;
  actualizadoEn: string;
  totalEmpresas: number;
  totalTokens: number;
  totalKg: number;
  ranking: FilaRankingMes[];
}
