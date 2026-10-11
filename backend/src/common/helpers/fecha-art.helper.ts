// Zona horaria única de EcoToken: Buenos Aires (GMT-3, sin horario de verano).
// Los instantes se guardan en UTC; los días y meses (cortes del ranking,
// certificados, "hoy", filtros por fecha) se calculan en hora argentina, igual
// que el cron de cierre y el frontend (frontend/src/lib/fecha.ts).

export const ZONA_AR = 'America/Argentina/Buenos_Aires';
const ART_MS = 3 * 3600_000;

/** Año, mes (1-12) y día de un instante, en hora argentina. */
export function partesArt(fecha = new Date()) {
  const d = new Date(fecha.getTime() - ART_MS);
  return {
    anio: d.getUTCFullYear(),
    mes: d.getUTCMonth() + 1,
    dia: d.getUTCDate(),
  };
}

/** Instante en que empieza un mes (día 1, 00:00 ART). `mes` 1-12; acepta desborde (13 = enero siguiente). */
export const inicioMesArt = (anio: number, mes: number) =>
  new Date(Date.UTC(anio, mes - 1, 1) + ART_MS);

/** Rango [desde, hasta) del mes en hora argentina, para filtros de Prisma. */
export const rangoMesArt = (mes: number, anio: number) => ({
  gte: inicioMesArt(anio, mes),
  lt: inicioMesArt(anio, mes + 1),
});

/** 00:00 ART de hoy, o de `diasAtras` días antes. */
export function inicioDiaArt(diasAtras = 0, ahora = new Date()) {
  const { anio, mes, dia } = partesArt(ahora);
  return new Date(Date.UTC(anio, mes - 1, dia - diasAtras) + ART_MS);
}

/**
 * Filtro de fecha "desde"/"hasta" recibido como texto. Un día suelto
 * (YYYY-MM-DD) se toma completo en hora argentina: desde = 00:00, hasta =
 * 23:59:59.999. Un ISO con hora se respeta tal cual.
 */
export function limiteDiaArt(texto: string, extremo: 'desde' | 'hasta'): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return new Date(texto);
  const inicio = Date.parse(texto) + ART_MS;
  return new Date(extremo === 'desde' ? inicio : inicio + 86_400_000 - 1);
}
