import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cx } from '@/lib/cx';
import { esMesEnCurso, fmtPct } from '../../dashboard/data';

// Piezas compartidas por los gráficos del dashboard: contenedor con título y
// pregunta que responde, tooltip y estilos de ejes de Recharts.

export const EJE = { fontSize: 11, fill: '#6B7076' };
export const GRILLA = '#E6E7E9';
export const VERDE = '#1D9E75';

export function ChartCard({
  title,
  question,
  actions,
  className,
  children,
}: {
  title: string;
  question?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card
      className={cx(
        'flex h-full flex-col p-5 shadow-sm break-inside-avoid',
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-eco-ink">{title}</h2>
          {question && (
            <p className="mt-0.5 text-xs text-eco-ink2">{question}</p>
          )}
        </div>
        {actions && <div className="print:hidden">{actions}</div>}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </Card>
  );
}

export function TooltipBox({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-40 rounded-lg border border-eco-border bg-white px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-semibold text-eco-ink">{title}</div>
      <div className="flex flex-col gap-0.5 text-eco-ink2">{children}</div>
    </div>
  );
}

export function TooltipRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {color && <Swatch color={color} />}
      <span className="flex-1">{label}</span>
      <span className="font-semibold text-eco-ink">{value}</span>
    </div>
  );
}

export function Swatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
      style={{ background: color }}
    />
  );
}

/** Variación con flecha; bajar no es alarma (gris, no rojo). */
export function Delta({
  value,
  suffix = '',
}: {
  value: number | null;
  suffix?: string;
}) {
  if (value === null) return null;
  const neutro = Math.abs(value) < 1;
  const Icon = neutro ? ArrowRight : value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cx(
        'inline-flex items-center gap-0.5 text-xs font-semibold',
        !neutro && value > 0 ? 'text-eco-org' : 'text-eco-ink2',
      )}
    >
      <Icon size={14} aria-hidden />
      {neutro
        ? 'Sin cambios'
        : `${value > 0 ? '+' : '−'}${fmtPct(Math.abs(value))}`}
      {suffix && <span className="font-normal text-eco-ink2"> {suffix}</span>}
    </span>
  );
}

export function SinDatos({
  label = 'No hay datos para los filtros seleccionados.',
}: {
  label?: string;
}) {
  return (
    <div className="flex h-full min-h-32 items-center justify-center text-center text-sm text-eco-ink2">
      {label}
    </div>
  );
}

export function NotaMesEnCurso({ meses }: { meses: { mes: string }[] }) {
  if (!meses.some((m) => esMesEnCurso(m.mes))) return null;
  return (
    <p className="mt-2 text-[11px] text-eco-ink3">
      * Mes en curso: datos parciales.
    </p>
  );
}

/** Selector segmentado chico para alternar vistas de un gráfico. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: Record<T, string>;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div
      className="inline-flex rounded-lg border border-eco-border-strong p-0.5"
      role="group"
      aria-label={label}
    >
      {(Object.keys(options) as T[]).map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={cx(
            'rounded-md px-2.5 py-1 text-xs font-semibold',
            value === v
              ? 'bg-eco-org-soft text-eco-org'
              : 'text-eco-ink2 hover:text-eco-ink',
          )}
        >
          {options[v]}
        </button>
      ))}
    </div>
  );
}

/** Bloque gris animado mientras cargan los datos. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cx('animate-pulse rounded-xl bg-eco-border/60', className)}
    />
  );
}
