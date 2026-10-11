// Métricas del Panel de Impacto Ambiental de la organización. Funciones puras
// sobre los aportes propios (GET /ingresos/mis-aportes) y el resto de datos que
// ya expone el backend; se verifican con data.check.mjs.
//
// Glosario (no son lo mismo y se etiquetan distinto en la UI):
//  - kg registrados: suma de los aportes cargados por la cooperativa.
//  - kg del ranking: los que cuenta el cierre mensual (GET /ranking/publico/mio).
//  - kg certificados: snapshot del certificado emitido al cierre.
// Los meses se agrupan por fecha UTC, igual que el panel municipal.

// Extensión .ts explícita: data.check.mjs lo importa con Node sin bundler.
import {
  etiquetaMes,
  fmtKg,
  fmtNum,
  fmtPct,
  hoy,
  mesAnterior,
  nombreMaterial,
  variacion,
  type Insight,
} from '../../municipio/dashboard/data.ts';

export interface AporteOrg {
  id: string;
  fecha: string; // ISO
  material: string;
  peso: number;
  tokens: number;
}

export const mesDe = (a: AporteOrg) => a.fecha.slice(0, 7);
const diaDe = (a: AporteOrg) => Number(a.fecha.slice(8, 10));
const sumar = <T>(xs: T[], f: (x: T) => number) =>
  xs.reduce((s, x) => s + f(x), 0);

export const diasDelMes = (mes: string) => {
  const [y, m] = mes.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
};

export interface ResumenMes {
  kg: number;
  aportes: number;
  puntos: number;
  materiales: number;
}

/** Totales de un mes, opcionalmente solo hasta el día `hastaDia` inclusive. */
export function resumenMes(
  aportes: AporteOrg[],
  mes: string,
  hastaDia = 31,
): ResumenMes {
  const delMes = aportes.filter(
    (a) => mesDe(a) === mes && diaDe(a) <= hastaDia,
  );
  return {
    kg: sumar(delMes, (a) => a.peso),
    aportes: delMes.length,
    puntos: sumar(delMes, (a) => a.tokens),
    materiales: new Set(delMes.map((a) => a.material)).size,
  };
}

export interface Comparacion {
  mes: string;
  previo: string;
  /** Último día comparado: hoy en el mes en curso. Ambos meses se cortan acá. */
  dia: number;
  actual: ResumenMes;
  anterior: ResumenMes;
  kg: number | null; // variación %
  aportes: number; // diferencia absoluta
  puntos: number | null; // variación %
}

/**
 * Mes en curso contra el mes anterior al mismo día ("del 1 al 10 de cada
 * mes"): comparar un mes parcial con uno completo leería cualquier mes en
 * curso como una caída.
 */
export function compararConMesAnterior(
  aportes: AporteOrg[],
  ref = hoy(),
): Comparacion {
  const mes = ref.slice(0, 7);
  const previo = mesAnterior(mes);
  const dia = Number(ref.slice(8, 10));
  const actual = resumenMes(aportes, mes, dia);
  const anterior = resumenMes(aportes, previo, dia);
  return {
    mes,
    previo,
    dia,
    actual,
    anterior,
    kg: variacion(actual.kg, anterior.kg),
    aportes: actual.aportes - anterior.aportes,
    puntos: variacion(actual.puntos, anterior.puntos),
  };
}

export interface PuntoMes extends ResumenMes {
  mes: string;
}

/** Últimos `n` meses hasta el de `ref`, continuos (los meses sin aportes van en 0). */
export function evolucionMensual(
  aportes: AporteOrg[],
  n = 6,
  ref = hoy(),
): PuntoMes[] {
  const meses = [ref.slice(0, 7)];
  while (meses.length < n) meses.unshift(mesAnterior(meses[0]));
  return meses.map((mes) => ({ mes, ...resumenMes(aportes, mes) }));
}

export interface PuntoDia {
  dia: number;
  actual: number | null; // null = día que todavía no llegó
  anterior: number | null; // null = el mes anterior es más corto
}

/** Kg acumulados día a día del mes en curso, con el mes anterior como referencia. */
export function acumuladoDiario(aportes: AporteOrg[], ref = hoy()): PuntoDia[] {
  const mes = ref.slice(0, 7);
  const previo = mesAnterior(mes);
  const hasta = Number(ref.slice(8, 10));
  const nPrevio = diasDelMes(previo);
  const porDia = (m: string) => {
    const kg = new Array<number>(32).fill(0);
    for (const a of aportes) if (mesDe(a) === m) kg[diaDe(a)] += a.peso;
    return kg;
  };
  const kgActual = porDia(mes);
  const kgPrevio = porDia(previo);
  const out: PuntoDia[] = [];
  let accA = 0;
  let accP = 0;
  for (let dia = 1; dia <= diasDelMes(mes); dia++) {
    accA += kgActual[dia];
    accP += kgPrevio[dia];
    out.push({
      dia,
      actual: dia <= hasta ? accA : null,
      anterior: dia <= nPrevio ? accP : null,
    });
  }
  return out;
}

export interface MaterialMes {
  material: string;
  kg: number;
  aportes: number;
  pct: number;
}

/** Kg por material de los aportes dados, de mayor a menor. */
export function porMaterial(aportes: AporteOrg[]): MaterialMes[] {
  const total = sumar(aportes, (a) => a.peso);
  const mapa = new Map<string, MaterialMes>();
  for (const a of aportes) {
    const m = mapa.get(a.material) ?? {
      material: a.material,
      kg: 0,
      aportes: 0,
      pct: 0,
    };
    m.kg += a.peso;
    m.aportes += 1;
    mapa.set(a.material, m);
  }
  return [...mapa.values()]
    .map((m) => ({ ...m, pct: total > 0 ? (m.kg / total) * 100 : 0 }))
    .sort((a, b) => b.kg - a.kg);
}

/** Último mes (≤ ref) con algún aporte, o null si no hay ninguno. */
export function ultimoMesConAportes(aportes: AporteOrg[], ref = hoy()) {
  const meses = aportes
    .map(mesDe)
    .filter((m) => m <= ref.slice(0, 7))
    .sort();
  return meses[meses.length - 1] ?? null;
}

/** Filas {mes, MATERIAL: kg} para barras apiladas de los últimos `n` meses. */
export function materialesPorMes(aportes: AporteOrg[], n = 6, ref = hoy()) {
  return evolucionMensual(aportes, n, ref).map(({ mes }) => {
    const fila: Record<string, number | string> = { mes };
    for (const m of porMaterial(aportes.filter((a) => mesDe(a) === mes))) {
      fila[m.material] = m.kg;
    }
    return fila;
  });
}

export interface Semana {
  semana: number; // 1..5 (días 1-7, 8-14, …)
  aportes: number;
  kg: number;
}

/** Aportes por semana del mes (semanas de calendario fijas de 7 días). */
export function porSemana(aportes: AporteOrg[], mes: string): Semana[] {
  const n = Math.ceil(diasDelMes(mes) / 7);
  const out = Array.from({ length: n }, (_, i) => ({
    semana: i + 1,
    aportes: 0,
    kg: 0,
  }));
  for (const a of aportes) {
    if (mesDe(a) !== mes) continue;
    const s = out[Math.floor((diaDe(a) - 1) / 7)];
    s.aportes += 1;
    s.kg += a.peso;
  }
  return out;
}

/** Días enteros entre una fecha ISO y `ref` (YYYY-MM-DD). */
export function diasDesde(fecha: string, ref = hoy()) {
  return Math.round(
    (Date.parse(ref) - Date.parse(fecha.slice(0, 10))) / 86_400_000,
  );
}

export function textoHaceDias(dias: number) {
  if (dias <= 0) return 'Hoy';
  if (dias === 1) return 'Ayer';
  return `Hace ${dias} días`;
}

// ─── Beneficios ───

export interface BeneficioSaldo {
  costoTokens: number;
  cuposDisponibles: number | null;
}

/** Se puede solicitar: hay cupo y alcanza el saldo disponible. */
export const alcanza = (b: BeneficioSaldo, disponible: number) =>
  b.cuposDisponibles !== 0 && b.costoTokens <= disponible;

/** Días hasta el vencimiento (inclusive del último día); null si no vence. */
export function diasParaVencer(vigenteHasta: string | null, ref = hoy()) {
  return vigenteHasta ? 0 - diasDesde(vigenteHasta, ref) : null;
}

// ─── Datos destacados (reglas fijas, sin IA) ───

export function insightsOrganizacion({
  comparacion,
  materiales,
  posicion,
  beneficiosAlcanzables,
}: {
  comparacion: Comparacion;
  materiales: MaterialMes[];
  posicion: { posicion: number | null; mes: number; anio: number } | null;
  beneficiosAlcanzables: number;
}): Insight[] {
  const out: Insight[] = [];
  const { kg, aportes, previo, dia } = comparacion;
  const mesPrevio = etiquetaMes(previo, true).split(' ')[0].toLowerCase();
  if (kg !== null && Math.abs(kg) >= 1) {
    out.push({
      icono: kg > 0 ? 'sube' : 'baja',
      texto: `Reciclaste un ${fmtPct(Math.abs(kg))} ${kg > 0 ? 'más' : 'menos'} que a esta altura de ${mesPrevio} (del 1 al ${dia}).`,
    });
  }
  if (aportes !== 0 && comparacion.anterior.aportes > 0) {
    out.push({
      icono: 'participacion',
      texto: `Realizaste ${fmtNum(Math.abs(aportes))} ${Math.abs(aportes) === 1 ? 'aporte' : 'aportes'} ${aportes > 0 ? 'más' : 'menos'} que a esta altura de ${mesPrevio}.`,
    });
  }
  if (materiales.length > 1) {
    out.push({
      icono: 'material',
      texto: `${nombreMaterial(materiales[0].material)} representa el ${fmtPct(materiales[0].pct)} de lo que reciclaste (${fmtKg(materiales[0].kg)}).`,
    });
  }
  if (posicion?.posicion === 1) {
    out.push({
      icono: 'ranking',
      texto: `Lideraste el último ranking mensual cerrado (${etiquetaMes(`${posicion.anio}-${String(posicion.mes).padStart(2, '0')}`, true)}).`,
    });
  } else if (posicion?.posicion) {
    out.push({
      icono: 'ranking',
      texto: `Quedaste #${posicion.posicion} en el último ranking mensual cerrado.`,
    });
  }
  if (beneficiosAlcanzables > 0) {
    out.push({
      icono: 'beneficio',
      texto: `Con tu saldo disponible podés solicitar ${beneficiosAlcanzables} ${beneficiosAlcanzables === 1 ? 'beneficio' : 'beneficios'}.`,
    });
  }
  return out;
}
