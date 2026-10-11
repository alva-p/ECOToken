// Métricas del Panel Operativo de la cooperativa. Funciones puras sobre las
// entregas que registró (GET /ingresos/mis-entregas); se verifican con
// data.check.mjs.
//
// Las fechas se pasan a hora argentina (GMT-3) antes de agrupar: para la
// operación diaria "hoy" tiene que ser el día del depósito, no el día UTC.

// Extensión .ts explícita: data.check.mjs lo importa con Node sin bundler.
import {
  etiquetaMes,
  fmtKg,
  fmtNum,
  fmtPct,
  mesAnterior,
  nombreMaterial,
  porMaterial,
  porOrganizacion,
  variacion,
  type Aporte,
  type Insight,
} from '../../municipio/dashboard/data.ts';

import { aHoraArgentina } from '../../../lib/fecha.ts';

export { hoyArt } from '../../../lib/fecha.ts';

export interface EntregaLike {
  id: string;
  fecha: string;
  empresaId: string;
  empresa: string;
  material: string;
  peso: number;
  tokens: number;
  txHash: string | null;
}

/** Entregas → aportes del panel municipal (en hora argentina), para reutilizar sus agregados. */
export const aAportes = (entregas: EntregaLike[]): Aporte[] =>
  entregas.map((e) => ({
    id: e.id,
    fecha: aHoraArgentina(e.fecha),
    organizacionId: e.empresaId,
    organizacion: e.empresa,
    cuit: '',
    material: e.material,
    kg: e.peso,
    puntos: e.tokens,
    verificado: e.txHash !== null,
  }));

const dia = (a: Aporte) => a.fecha.slice(0, 10);
const mes = (a: Aporte) => a.fecha.slice(0, 7);
const diaDelMes = (a: Aporte) => Number(a.fecha.slice(8, 10));

export interface ResumenOp {
  kg: number;
  entregas: number;
  organizaciones: number;
  materiales: number;
  puntos: number;
  promedio: number | null; // kg por entrega; null sin entregas
  confirmadas: number; // con transacción on-chain
}

export function resumir(aportes: Aporte[]): ResumenOp {
  const kg = aportes.reduce((s, a) => s + a.kg, 0);
  return {
    kg,
    entregas: aportes.length,
    organizaciones: new Set(aportes.map((a) => a.organizacionId)).size,
    materiales: new Set(aportes.map((a) => a.material)).size,
    puntos: aportes.reduce((s, a) => s + a.puntos, 0),
    promedio: aportes.length ? kg / aportes.length : null,
    confirmadas: aportes.filter((a) => a.verificado).length,
  };
}

export const delDia = (aportes: Aporte[], d: string) =>
  aportes.filter((a) => dia(a) === d);

/** Entregas de un mes, opcionalmente solo hasta el día `hasta` inclusive. */
export const delMes = (aportes: Aporte[], m: string, hasta = 31) =>
  aportes.filter((a) => mes(a) === m && diaDelMes(a) <= hasta);

export interface ComparacionOp {
  mes: string;
  previo: string;
  dia: number;
  actual: ResumenOp;
  anterior: ResumenOp;
}

/** Mes en curso contra el anterior cortado al mismo día (mes parcial vs. parcial). */
export function comparar(aportes: Aporte[], ref: string): ComparacionOp {
  const m = ref.slice(0, 7);
  const previo = mesAnterior(m);
  const d = Number(ref.slice(8, 10));
  return {
    mes: m,
    previo,
    dia: d,
    actual: resumir(delMes(aportes, m, d)),
    anterior: resumir(delMes(aportes, previo, d)),
  };
}

export interface PuntoMesOp extends ResumenOp {
  mes: string;
}

/** Últimos `n` meses hasta el de `ref`, continuos (meses sin entregas en 0). */
export function evolucion(
  aportes: Aporte[],
  n: number,
  ref: string,
): PuntoMesOp[] {
  const meses = [ref.slice(0, 7)];
  while (meses.length < n) meses.unshift(mesAnterior(meses[0]));
  return meses.map((m) => ({ mes: m, ...resumir(delMes(aportes, m)) }));
}

const diasDelMes = (m: string) => {
  const [y, mm] = m.split('-').map(Number);
  return new Date(Date.UTC(y, mm, 0)).getUTCDate();
};

export interface PuntoDiaOp {
  dia: number;
  fecha: string;
  kg: number | null; // null = día que todavía no llegó
  entregas: number;
}

/** Kg por día del mes de `ref`; los días futuros quedan en null. */
export function actividadDiaria(aportes: Aporte[], ref: string): PuntoDiaOp[] {
  const m = ref.slice(0, 7);
  const hoy = Number(ref.slice(8, 10));
  return Array.from({ length: diasDelMes(m) }, (_, i) => {
    const fecha = `${m}-${String(i + 1).padStart(2, '0')}`;
    const del = delDia(aportes, fecha);
    return {
      dia: i + 1,
      fecha,
      kg: i + 1 <= hoy ? del.reduce((s, a) => s + a.kg, 0) : null,
      entregas: del.length,
    };
  });
}

export interface CeldaCalendario {
  fecha: string;
  entregas: number;
  kg: number;
  futuro: boolean;
}

const sumarDias = (fecha: string, n: number) =>
  new Date(Date.parse(fecha) + n * 86_400_000).toISOString().slice(0, 10);

/**
 * Calendario de las últimas `semanas` semanas (lunes a domingo) que terminan
 * en la semana de `ref`. Cada columna es una semana.
 */
export function calendario(
  aportes: Aporte[],
  semanas: number,
  ref: string,
): CeldaCalendario[][] {
  const lunesDeRef = sumarDias(ref, -((new Date(ref).getUTCDay() + 6) % 7));
  const inicio = sumarDias(lunesDeRef, -7 * (semanas - 1));
  const porDia = new Map<string, { entregas: number; kg: number }>();
  for (const a of aportes) {
    const c = porDia.get(dia(a)) ?? { entregas: 0, kg: 0 };
    c.entregas += 1;
    c.kg += a.kg;
    porDia.set(dia(a), c);
  }
  return Array.from({ length: semanas }, (_, s) =>
    Array.from({ length: 7 }, (_, d) => {
      const fecha = sumarDias(inicio, s * 7 + d);
      return {
        fecha,
        entregas: porDia.get(fecha)?.entregas ?? 0,
        kg: porDia.get(fecha)?.kg ?? 0,
        futuro: fecha > ref,
      };
    }),
  );
}

/** Entregas de la semana en curso (lunes a hoy). */
export function entregasDeLaSemana(aportes: Aporte[], ref: string) {
  const lunes = sumarDias(ref, -((new Date(ref).getUTCDay() + 6) % 7));
  return aportes.filter((a) => dia(a) >= lunes && dia(a) <= ref).length;
}

export type OrdenOrganizaciones = 'kg' | 'aportes' | 'ultimoAporte';

/** Organizaciones atendidas, ordenadas por kg, entregas o última entrega. */
export function organizaciones(aportes: Aporte[], orden: OrdenOrganizaciones) {
  return porOrganizacion(aportes).sort((a, b) =>
    orden === 'ultimoAporte'
      ? b.ultimoAporte.localeCompare(a.ultimoAporte)
      : b[orden] - a[orden],
  );
}

// ─── Datos destacados (reglas fijas, sin IA) ───

export function insightsOperativos(
  c: ComparacionOp,
  aportesMes: Aporte[],
  semana: number,
): Insight[] {
  const out: Insight[] = [];
  const mesPrevio = etiquetaMes(c.previo, true).split(' ')[0].toLowerCase();
  const v = variacion(c.actual.kg, c.anterior.kg);
  if (v !== null && Math.abs(v) >= 1) {
    out.push({
      icono: v > 0 ? 'sube' : 'baja',
      texto: `Recibiste un ${fmtPct(Math.abs(v))} ${v > 0 ? 'más' : 'menos'} de material que a esta altura de ${mesPrevio} (del 1 al ${c.dia}).`,
    });
  }
  const materiales = porMaterial(aportesMes);
  if (materiales.length > 1) {
    out.push({
      icono: 'material',
      texto: `${nombreMaterial(materiales[0].material)} representa el ${fmtPct(materiales[0].pct)} del volumen recibido este mes.`,
    });
  }
  if (c.actual.organizaciones > 0) {
    out.push({
      icono: 'organizacion',
      texto: `${fmtNum(c.actual.organizaciones)} ${c.actual.organizaciones === 1 ? 'organización realizó' : 'organizaciones realizaron'} entregas este mes.`,
    });
  }
  if (c.actual.promedio !== null) {
    out.push({
      icono: 'participacion',
      texto: `El peso promedio por entrega este mes es de ${fmtKg(c.actual.promedio)}.`,
    });
  }
  if (semana > 0) {
    out.push({
      icono: 'participacion',
      texto: `Esta semana registraste ${fmtNum(semana)} ${semana === 1 ? 'entrega' : 'entregas'}.`,
    });
  }
  return out;
}
