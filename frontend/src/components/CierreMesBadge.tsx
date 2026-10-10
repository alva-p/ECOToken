import { Clock } from 'lucide-react';
import { restanteCierre, useAhora } from '@/lib/cierreMes';

const dos = (n: number) => String(n).padStart(2, '0');

/** Cuenta regresiva compacta al próximo cierre de mes (encabezado de todos los paneles). */
export function CierreMesBadge() {
  const { dias, horas, minutos, segundos } = restanteCierre(useAhora());
  return (
    <div
      className="flex items-center gap-2.5 rounded-lg border border-eco-border bg-eco-bg px-3 py-1.5"
      title="Al cierre se calcula el ranking y se emiten los certificados. Hora de Argentina (GMT-3)."
    >
      <Clock size={16} aria-hidden className="shrink-0 text-eco-ink2" />
      <div className="leading-tight">
        <div className="hidden text-[10px] font-semibold uppercase tracking-wide text-eco-ink2 sm:block">
          Cierre de mes
        </div>
        <div
          className="text-sm font-semibold tabular-nums text-eco-ink"
          aria-label={`Faltan ${dias} días, ${horas} horas y ${minutos} minutos para el cierre de mes`}
        >
          {dias}d {dos(horas)}h {dos(minutos)}m{' '}
          <span className="hidden sm:inline">{dos(segundos)}s</span>
        </div>
      </div>
    </div>
  );
}
