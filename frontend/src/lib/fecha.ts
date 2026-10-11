// Zona horaria única de EcoToken: Buenos Aires (GMT-3, sin horario de verano).
// Todos los paneles muestran y agrupan fechas en esta zona, igual que el
// cierre de mes y el backend (backend/src/common/helpers/fecha-art.helper.ts).

export const ZONA_AR = 'America/Argentina/Buenos_Aires';
const ART_MS = 3 * 3600_000;

/**
 * ISO desplazado a hora argentina: sus primeros 10 caracteres son el día
 * local y los 7 primeros el mes. Para agrupar sin depender del navegador.
 */
export const aHoraArgentina = (iso: string) =>
  new Date(Date.parse(iso) - ART_MS).toISOString();

/** Día de hoy en Buenos Aires (YYYY-MM-DD). */
export const hoyArt = (ahora = Date.now()) =>
  new Date(ahora - ART_MS).toISOString().slice(0, 10);

/** Fecha (dd/mm/aaaa u otro formato vía `opciones`) de un instante, en hora argentina. */
export const fechaAR = (
  fecha: string | number | Date,
  opciones: Intl.DateTimeFormatOptions = {},
) =>
  new Date(fecha).toLocaleDateString('es-AR', {
    timeZone: ZONA_AR,
    ...opciones,
  });
