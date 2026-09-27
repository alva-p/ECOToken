import type { FilaRanking, PeriodoCerrado, RankingPublico } from './api';

// Datos de ejemplo para el deploy de demo sin backend (VITE_API_URL sin definir).
// Con backend configurado, api.ts nunca los usa: un backend caído sigue viendo
// el estado vacío en lugar de cifras inventadas.
const BASE: Array<[string, number, number]> = [
  ['Hospital Pasteur', 489, 1250],
  ['Supermercado Top', 412, 1050],
  ['Coop. Puente Verde', 376, 980],
  ['GreenPack', 318, 845],
  ['Textil Andina', 295, 790],
  ['Panadería El Trigal', 241, 640],
  ['Hotel Villa María', 227, 605],
  ['Cerámica del Sur', 192, 512],
  ['Escuela Técnica N°1', 162, 430],
  ['Farmacia Central', 146, 388],
];

// Del más reciente al más antiguo; factor de escala sobre BASE (crecimiento mensual).
const MESES: Array<[number, number, number]> = [
  [4, 2026, 1],
  [3, 2026, 0.89],
  [2, 2026, 0.8],
  [1, 2026, 0.71],
  [12, 2025, 0.62],
  [11, 2025, 0.55],
];

const redondear = (n: number) => Math.round(n * 10) / 10;

function armar([mes, anio, k]: [number, number, number]): RankingPublico {
  const data: FilaRanking[] = BASE.map(([razonSocial, kg, tokens], i) => ({
    posicion: i + 1,
    razonSocial,
    kgReciclados: redondear(kg * k),
    tokens: Math.round(tokens * k),
  }));
  return {
    mes,
    anio,
    fechaCierre: new Date(Date.UTC(anio, mes, 1)).toISOString(),
    empresas: data.length,
    totalKg: redondear(data.reduce((s, f) => s + f.kgReciclados, 0)),
    totalTokens: data.reduce((s, f) => s + f.tokens, 0),
    hashSnapshot: null,
    bloqueReferencia: null,
    data,
  };
}

const RANKINGS = MESES.map(armar);

export const periodosMock = (limite?: number): PeriodoCerrado[] =>
  RANKINGS.slice(0, limite).map((r) => ({
    mes: r.mes,
    anio: r.anio,
    fechaCierre: r.fechaCierre,
    empresas: r.empresas,
    totalKg: r.totalKg,
    totalTokens: r.totalTokens,
  }));

export const rankingMock = (periodo?: {
  mes: number;
  anio: number;
}): RankingPublico =>
  RANKINGS.find(
    (r) => !periodo || (r.mes === periodo.mes && r.anio === periodo.anio),
  ) ?? RANKINGS[0];
