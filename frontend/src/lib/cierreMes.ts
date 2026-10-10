import { useEffect, useState } from 'react';

// Cierre de mes: el job mensual corre el día 1 a las 00:00 hora argentina.
const ART_MS = 3 * 3600_000; // Argentina: GMT-3 fijo, sin horario de verano.

/** Inicio del próximo mes (día 1, 00:00 hora argentina) como instante UTC. */
export function proximoCierre(ahora: number): number {
  const art = new Date(ahora - ART_MS);
  return Date.UTC(art.getUTCFullYear(), art.getUTCMonth() + 1, 1) + ART_MS;
}

/** Inicio del mes en curso (día 1, 00:00 hora argentina) como instante UTC. */
export function inicioMes(ahora: number): number {
  const art = new Date(ahora - ART_MS);
  return Date.UTC(art.getUTCFullYear(), art.getUTCMonth(), 1) + ART_MS;
}

/** Hora actual que se actualiza cada segundo. */
export function useAhora() {
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return ahora;
}

/** Días/horas/minutos/segundos que faltan para el próximo cierre. */
export function restanteCierre(ahora: number) {
  const resto = Math.max(0, proximoCierre(ahora) - ahora);
  return {
    dias: Math.floor(resto / 86_400_000),
    horas: Math.floor(resto / 3_600_000) % 24,
    minutos: Math.floor(resto / 60_000) % 60,
    segundos: Math.floor(resto / 1000) % 60,
  };
}
