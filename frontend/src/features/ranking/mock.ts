import type {
  FilaRanking,
  MaterialKg,
  PeriodoCerrado,
  RankingPublico,
} from './api';

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
  ['Frigorífico Río Tercero', 138, 366],
  ['Universidad Nacional de Villa María', 131, 349],
  ['Clínica Regional del Centro', 124, 331],
  ['Metalúrgica San Martín', 117, 312],
  ['Cooperativa Agrícola del Sur', 109, 290],
  ['Molino Los Andes', 101, 268],
  ['Ferretería Industrial Norte', 94, 251],
  ['Gimnasio Vital', 86, 229],
  ['Librería El Ateneo Local', 78, 207],
  ['Estación de Servicio Ruta 9', 71, 189],
];

// Del más reciente al más antiguo; factor de escala sobre BASE (crecimiento mensual).
const MESES: Array<[number, number, number]> = [
  [4, 2026, 1],
  [3, 2026, 0.92],
  [2, 2026, 0.85],
  [1, 2026, 0.78],
  [12, 2025, 0.83],
  [11, 2025, 0.7],
  [10, 2025, 0.63],
  [9, 2025, 0.57],
  [8, 2025, 0.49],
  [7, 2025, 0.42],
  [6, 2025, 0.34],
  [5, 2025, 0.27],
];

const redondear = (n: number) => Math.round(n * 10) / 10;

// Variación determinista por empresa y mes (±15 %) para que el orden cambie
// entre períodos sin depender de Math.random.
const ruido = (i: number, mes: number) =>
  1 + Math.sin(i * 7.3 + mes * 3.1) * 0.15;

function armar([mes, anio, k]: [number, number, number]): RankingPublico {
  const data: FilaRanking[] = BASE.map(([razonSocial, kg, tokens], i) => {
    const f = k * ruido(i, mes);
    return {
      posicion: 0,
      razonSocial,
      kgReciclados: redondear(kg * f),
      tokens: Math.round(tokens * f),
      certificados: Math.max(1, Math.round((tokens / 120) * k)),
      tendencia: null,
      nuevo: false,
    };
  })
    .sort((a, b) => b.tokens - a.tokens)
    .map((fila, i) => ({ ...fila, posicion: i + 1 }));
  return {
    mes,
    anio,
    fechaCierre: new Date(Date.UTC(anio, mes, 1)).toISOString(),
    empresas: data.length,
    totalKg: redondear(data.reduce((s, f) => s + f.kgReciclados, 0)),
    totalTokens: data.reduce((s, f) => s + f.tokens, 0),
    hashSnapshot: null,
    bloqueReferencia: null,
    co2Evitado: 0,
    materiales: [],
    lider: null,
    data,
  };
}

const MATERIALES: Array<[string, number]> = [
  ['Cartón', 0.37],
  ['Plástico PET', 0.24],
  ['Vidrio', 0.18],
  ['Papel', 0.12],
  ['Metal', 0.06],
  ['Otros', 0.03],
];
const CO2_POR_KG = 1.12;

const BRUTOS = MESES.map(armar);

// Segunda pasada: tendencia contra el mes siguiente en la lista (el anterior
// en el tiempo), reparto de materiales y perfil del líder.
const RANKINGS = BRUTOS.map((r, i) => {
  const previo = BRUTOS[i + 1];
  const posPrevia = new Map(
    previo?.data.map((f) => [f.razonSocial, f.posicion]),
  );
  const data = r.data.map((f) => {
    const p = posPrevia.get(f.razonSocial);
    return {
      ...f,
      tendencia: previo && p !== undefined ? p - f.posicion : null,
      nuevo: !!previo && p === undefined,
    };
  });
  const reparto = (kg: number): MaterialKg[] =>
    MATERIALES.map(([material, parte]) => ({
      material,
      kg: redondear(kg * parte),
    }));
  const top = data[0];
  return {
    ...r,
    data,
    co2Evitado: redondear(r.totalKg * CO2_POR_KG),
    materiales: reparto(r.totalKg),
    lider: {
      razonSocial: top.razonSocial,
      kgReciclados: top.kgReciclados,
      tokens: top.tokens,
      certificados: top.certificados,
      co2Evitado: redondear(top.kgReciclados * CO2_POR_KG),
      mesesConsecutivos: MESES.length - i,
      materiales: reparto(top.kgReciclados),
    },
  };
});

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
