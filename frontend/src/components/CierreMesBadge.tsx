import { CalendarClock } from 'lucide-react';
import {
  inicioMes,
  proximoCierre,
  restanteCierre,
  useAhora,
} from '@/lib/cierreMes';

/** "21 días restantes", o horas cuando ya es el último día. */
function textoRestante(dias: number, horas: number) {
  if (dias > 1) return `${dias} días restantes`;
  if (dias === 1) return '1 día restante';
  return horas > 0 ? `Cierra hoy · ${horas} h` : 'Cierra en minutos';
}

/** Próximo cierre de mes con días restantes y progreso del mes (encabezado de todos los paneles). */
export function CierreMesBadge() {
  const ahora = useAhora();
  const cierre = proximoCierre(ahora);
  const inicio = inicioMes(ahora);
  const { dias, horas } = restanteCierre(ahora);
  // El cierre corre el día 1 a las 00:00: el último día del mes es el que cierra.
  const ultimoDia = new Date(cierre - 1).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
  const progreso = Math.min(1, (ahora - inicio) / (cierre - inicio));
  const restante = textoRestante(dias, horas);

  return (
    <div
      className="flex items-center gap-2.5 rounded-lg border border-eco-border bg-eco-bg px-3 py-1.5"
      title="Al cierre se calcula el ranking oficial y se emiten los certificados. Hora de Argentina (GMT-3)."
      aria-label={`Próximo cierre: ${ultimoDia}. ${restante}.`}
    >
      <CalendarClock size={16} aria-hidden className="shrink-0 text-eco-ink2" />
      <div className="leading-tight">
        <div className="hidden text-[10px] font-semibold uppercase tracking-wide text-eco-ink2 sm:block">
          Próximo cierre · {ultimoDia}
        </div>
        <div className="text-sm font-semibold tabular-nums text-eco-ink">
          {restante}
        </div>
        <div
          aria-hidden
          className="mt-1 hidden h-1 w-full overflow-hidden rounded-full bg-eco-border sm:block"
        >
          <div
            className="h-full rounded-full bg-eco-org"
            style={{ width: `${progreso * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
