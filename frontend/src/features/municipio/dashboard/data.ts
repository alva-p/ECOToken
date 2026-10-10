// Métricas del Panel de Gestión Ambiental. Todo se deriva en el cliente a
// partir de los aportes planos de GET /reportes/ingresos: funciones puras,
// sin estado, para poder testearlas con data.check.ts.

export interface Aporte {
  id: string;
  fecha: string; // ISO
  organizacionId: string;
  organizacion: string;
  cuit: string;
  material: string;
  kg: number;
  puntos: number;
  verificado: boolean;
}

export interface Filtros {
  desde: string; // YYYY-MM-DD o ''
  hasta: string;
  material: string; // '' = todos
  busqueda: string;
}

export type ModoComparacion = 'mes' | 'periodo' | 'anio';

export const COMPARACIONES: Record<ModoComparacion, string> = {
  mes: 'Mes anterior',
  periodo: 'Mismo período anterior',
  anio: 'Año anterior',
};

// ─── Formato ───

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export const fmtKg = (n: number) =>
  `${n.toLocaleString('es-AR', { maximumFractionDigits: 1 })} kg`;
export const fmtNum = (n: number) => n.toLocaleString('es-AR');
export const fmtPct = (n: number) =>
  `${n.toLocaleString('es-AR', { maximumFractionDigits: 1 })}%`;
export const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { timeZone: 'UTC' });

/** '2026-09' → 'sep 26' (ejes) o 'Septiembre 2026' (tooltips). */
export function etiquetaMes(mes: string, larga = false) {
  const nombre = MESES[Number(mes.slice(5, 7)) - 1];
  return larga
    ? `${nombre[0].toUpperCase()}${nombre.slice(1)} ${mes.slice(0, 4)}`
    : `${nombre.slice(0, 3)} ${mes.slice(2, 4)}`;
}

/** El mes actual todavía no cerró: se marca con * para no leerlo como una caída. */
export const esMesEnCurso = (mes: string) => mes === hoy().slice(0, 7);
export const etiquetaEje = (mes: string) =>
  `${etiquetaMes(mes)}${esMesEnCurso(mes) ? '*' : ''}`;

/** Título con mayúscula inicial para nombres de material ('PLÁSTICO' → 'Plástico'). */
export const nombreMaterial = (m: string) =>
  m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();

// ─── Color por material ───

// Paleta categórica validada (dataviz skill, references/palette.md): orden
// fijo, nunca ciclada. El color sigue al material, no a su ranking.
const PALETA = [
  '#2a78d6',
  '#eb6834',
  '#1baf7a',
  '#eda100',
  '#e87ba4',
  '#008300',
  '#4a3aa7',
  '#e34948',
];
const OTRO = '#9a9a96';

/** Asigna un color estable por material (orden alfabético sobre todo el histórico). */
export function coloresMateriales(aportes: Aporte[]) {
  const nombres = [...new Set(aportes.map((a) => a.material))].sort();
  const mapa = new Map(nombres.map((m, i) => [m, PALETA[i] ?? OTRO]));
  return (material: string) => mapa.get(material) ?? OTRO;
}

// ─── Fechas y períodos ───

const iso = (d: Date) => d.toISOString().slice(0, 10);
const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d));

export function hoy() {
  return iso(new Date());
}

export type Preset = 'mes' | 'mesAnterior' | '3m' | '6m' | 'anio' | 'todo';

export const PRESETS: Record<Preset, string> = {
  mes: 'Este mes',
  mesAnterior: 'Mes anterior',
  '3m': 'Últimos 3 meses',
  '6m': 'Últimos 6 meses',
  anio: 'Este año',
  todo: 'Todo',
};

export function rangoPreset(
  p: Preset,
  ref = hoy(),
): { desde: string; hasta: string } {
  const y = Number(ref.slice(0, 4));
  const m = Number(ref.slice(5, 7)) - 1;
  switch (p) {
    case 'mes':
      return { desde: iso(utc(y, m, 1)), hasta: ref };
    case 'mesAnterior':
      return { desde: iso(utc(y, m - 1, 1)), hasta: iso(utc(y, m, 0)) };
    case '3m':
      return { desde: iso(utc(y, m - 2, 1)), hasta: ref };
    case '6m':
      return { desde: iso(utc(y, m - 5, 1)), hasta: ref };
    case 'anio':
      return { desde: `${y}-01-01`, hasta: ref };
    case 'todo':
      return { desde: '', hasta: '' };
  }
}

function desplazar(fecha: string, meses: number) {
  const [y, m, d] = fecha.split('-').map(Number);
  // Recorta al último día del mes destino (31/03 - 1 mes → 28/02).
  const ultimo = utc(y, m - 1 + meses + 1, 0).getUTCDate();
  return iso(utc(y, m - 1 + meses, Math.min(d, ultimo)));
}

/**
 * Período con el que se compara el filtro actual. Sin "desde" no hay un
 * período acotado contra el que comparar → null (la UI oculta la variación).
 */
export function rangoComparacion(
  desde: string,
  hasta: string,
  modo: ModoComparacion,
): { desde: string; hasta: string } | null {
  if (!desde) return null;
  const h = hasta || hoy();
  if (modo === 'mes')
    return { desde: desplazar(desde, -1), hasta: desplazar(h, -1) };
  if (modo === 'anio')
    return { desde: desplazar(desde, -12), hasta: desplazar(h, -12) };
  const dias = Math.round((Date.parse(h) - Date.parse(desde)) / 86_400_000) + 1;
  const fin = new Date(Date.parse(desde) - 86_400_000);
  return {
    desde: iso(new Date(fin.getTime() - (dias - 1) * 86_400_000)),
    hasta: iso(fin),
  };
}

// ─── Filtros ───

export const enRango = (a: Aporte, desde: string, hasta: string) => {
  const dia = a.fecha.slice(0, 10);
  return (!desde || dia >= desde) && (!hasta || dia <= hasta);
};

/** Filtros de material y organización (todo menos el período). */
export function filtrarDimensiones(aportes: Aporte[], f: Filtros) {
  const q = f.busqueda.trim().toLowerCase();
  const qDigitos = q.replace(/\D/g, '');
  return aportes.filter(
    (a) =>
      (!f.material || a.material === f.material) &&
      (!q ||
        a.organizacion.toLowerCase().includes(q) ||
        (qDigitos.length > 0 && a.cuit.replace(/\D/g, '').includes(qDigitos))),
  );
}

// ─── Agregados ───

export interface Resumen {
  kg: number;
  puntos: number;
  aportes: number;
  organizaciones: number;
}

export function resumir(aportes: Aporte[]): Resumen {
  return {
    kg: aportes.reduce((s, a) => s + a.kg, 0),
    puntos: aportes.reduce((s, a) => s + a.puntos, 0),
    aportes: aportes.length,
    organizaciones: new Set(aportes.map((a) => a.organizacionId)).size,
  };
}

/** Variación porcentual; null si no hay base comparable. */
export const variacion = (actual: number, anterior: number) =>
  anterior > 0 ? ((actual - anterior) / anterior) * 100 : null;

export interface MaterialAgg {
  material: string;
  kg: number;
  aportes: number;
  pct: number;
}

export function porMaterial(aportes: Aporte[]): MaterialAgg[] {
  const total = aportes.reduce((s, a) => s + a.kg, 0) || 1;
  const m = new Map<string, MaterialAgg>();
  for (const a of aportes) {
    const x = m.get(a.material) ?? {
      material: a.material,
      kg: 0,
      aportes: 0,
      pct: 0,
    };
    x.kg += a.kg;
    x.aportes += 1;
    m.set(a.material, x);
  }
  return [...m.values()]
    .map((x) => ({ ...x, pct: (x.kg / total) * 100 }))
    .sort((a, b) => b.kg - a.kg);
}

export interface OrganizacionAgg {
  id: string;
  nombre: string;
  cuit: string;
  kg: number;
  puntos: number;
  aportes: number;
  pct: number;
  promedio: number;
  materialPrincipal: string;
  kgPorMaterial: Record<string, number>;
  primerAporte: string;
  ultimoAporte: string;
  verificados: number;
}

export function porOrganizacion(aportes: Aporte[]): OrganizacionAgg[] {
  const total = aportes.reduce((s, a) => s + a.kg, 0) || 1;
  const m = new Map<string, OrganizacionAgg>();
  for (const a of aportes) {
    const o = m.get(a.organizacionId) ?? {
      id: a.organizacionId,
      nombre: a.organizacion,
      cuit: a.cuit,
      kg: 0,
      puntos: 0,
      aportes: 0,
      pct: 0,
      promedio: 0,
      materialPrincipal: '',
      kgPorMaterial: {},
      primerAporte: a.fecha,
      ultimoAporte: a.fecha,
      verificados: 0,
    };
    o.kg += a.kg;
    o.puntos += a.puntos;
    o.aportes += 1;
    o.kgPorMaterial[a.material] = (o.kgPorMaterial[a.material] ?? 0) + a.kg;
    if (a.fecha < o.primerAporte) o.primerAporte = a.fecha;
    if (a.fecha > o.ultimoAporte) o.ultimoAporte = a.fecha;
    if (a.verificado) o.verificados += 1;
    m.set(a.organizacionId, o);
  }
  return [...m.values()]
    .map((o) => ({
      ...o,
      pct: (o.kg / total) * 100,
      promedio: o.kg / o.aportes,
      materialPrincipal: Object.entries(o.kgPorMaterial).sort(
        (a, b) => b[1] - a[1],
      )[0][0],
    }))
    .sort((a, b) => b.kg - a.kg);
}

export interface MesAgg {
  mes: string; // YYYY-MM
  total: number;
  aportes: number;
  organizaciones: number;
  puntos: number;
  porMaterial: Record<string, number>;
}

const siguienteMes = (mes: string) => {
  const [y, m] = mes.split('-').map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
};
export const mesAnterior = (mes: string) => {
  const [y, m] = mes.split('-').map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
};

/** Serie mensual continua (los meses sin aportes quedan en 0, no se saltean). */
export function porMes(aportes: Aporte[], desde = '', hasta = ''): MesAgg[] {
  if (aportes.length === 0) return [];
  const meses = aportes.map((a) => a.fecha.slice(0, 7)).sort();
  const inicio = desde ? desde.slice(0, 7) : meses[0];
  const fin = hasta ? hasta.slice(0, 7) : meses[meses.length - 1];
  const serie = new Map<string, MesAgg & { orgs: Set<string> }>();
  for (let mes = inicio; mes <= fin; mes = siguienteMes(mes)) {
    serie.set(mes, {
      mes,
      total: 0,
      aportes: 0,
      organizaciones: 0,
      puntos: 0,
      porMaterial: {},
      orgs: new Set(),
    });
  }
  for (const a of aportes) {
    const x = serie.get(a.fecha.slice(0, 7));
    if (!x) continue;
    x.total += a.kg;
    x.aportes += 1;
    x.puntos += a.puntos;
    x.porMaterial[a.material] = (x.porMaterial[a.material] ?? 0) + a.kg;
    x.orgs.add(a.organizacionId);
  }
  return [...serie.values()].map(({ orgs, ...x }) => ({
    ...x,
    organizaciones: orgs.size,
  }));
}

/**
 * Último mes con aportes del período contra el mes calendario previo (con los
 * mismos filtros de material/organización, aunque caiga fuera del período).
 */
export function comparacionMensual(periodo: Aporte[], todos: Aporte[]) {
  if (periodo.length === 0) return null;
  const mes = periodo
    .map((a) => a.fecha.slice(0, 7))
    .sort()
    .at(-1)!;
  const previo = mesAnterior(mes);
  const actual = todos.filter((a) => a.fecha.startsWith(mes));
  const anterior = todos.filter((a) => a.fecha.startsWith(previo));
  if (anterior.length === 0) return null;
  const matsActual = porMaterial(actual);
  const matsAnterior = new Map(
    porMaterial(anterior).map((m) => [m.material, m.kg]),
  );
  const materiales = [
    ...new Set([...matsActual.map((m) => m.material), ...matsAnterior.keys()]),
  ];
  return {
    mes,
    previo,
    actual: resumir(actual),
    anterior: resumir(anterior),
    materiales: materiales
      .map((material) => {
        const kgActual =
          matsActual.find((m) => m.material === material)?.kg ?? 0;
        const kgAnterior = matsAnterior.get(material) ?? 0;
        return {
          material,
          kgActual,
          kgAnterior,
          variacion: variacion(kgActual, kgAnterior),
        };
      })
      .sort((a, b) => b.kgActual - a.kgActual),
  };
}

/** Organizaciones con aportes antes del período pero ninguno dentro. */
export function sinAportesEnPeriodo(
  todos: Aporte[],
  periodo: Aporte[],
  desde: string,
) {
  if (!desde) return [];
  const activas = new Set(periodo.map((a) => a.organizacionId));
  return porOrganizacion(
    todos.filter((a) => a.fecha.slice(0, 10) < desde),
  ).filter((o) => !activas.has(o.id));
}

// ─── Insights verificables ───

export interface Insight {
  icono: 'sube' | 'baja' | 'material' | 'organizacion' | 'participacion';
  texto: string;
}

export function insights(
  materiales: MaterialAgg[],
  organizaciones: OrganizacionAgg[],
  comparacion: ReturnType<typeof comparacionMensual>,
): Insight[] {
  const out: Insight[] = [];
  if (comparacion) {
    const v = variacion(comparacion.actual.kg, comparacion.anterior.kg);
    if (v !== null && Math.abs(v) >= 1) {
      out.push({
        icono: v > 0 ? 'sube' : 'baja',
        texto: `El volumen reciclado ${v > 0 ? 'aumentó' : 'disminuyó'} un ${fmtPct(Math.abs(v))} en ${etiquetaMes(comparacion.mes, true)} respecto a ${etiquetaMes(comparacion.previo, true)}.`,
      });
    }
    const { organizaciones: o1 } = comparacion.anterior;
    const { organizaciones: o2 } = comparacion.actual;
    if (o1 !== o2) {
      out.push({
        icono: 'participacion',
        texto: `La cantidad de organizaciones participantes ${o2 > o1 ? 'aumentó' : 'bajó'} de ${o1} a ${o2}.`,
      });
    }
  }
  if (materiales.length > 1) {
    out.push({
      icono: 'material',
      texto: `${nombreMaterial(materiales[0].material)} representa el ${fmtPct(materiales[0].pct)} del material recuperado.`,
    });
  }
  if (organizaciones.length > 1) {
    out.push({
      icono: 'organizacion',
      texto: `${organizaciones[0].nombre} concentra el ${fmtPct(organizaciones[0].pct)} del volumen registrado.`,
    });
  }
  return out;
}
