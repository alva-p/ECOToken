import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { cx } from '@/lib/cx';
import {
  etiquetaMes,
  fmtKg,
  fmtNum,
  fmtPct,
} from '@/features/municipio/dashboard/data';
import { ChartCard } from '@/features/municipio/components/dashboard/ChartCard';
import type { Comparacion, Semana } from '../../dashboard/data';
import { textoHaceDias } from '../../dashboard/data';
import { Etapa } from './KpiCards';

/** Flecha y variación; bajar se muestra en gris, no en rojo (no es un tablero financiero). */
function Cambio({ pct, diff }: { pct: number | null; diff?: number }) {
  const v = pct ?? diff ?? null;
  if (v === null) return <span className="text-xs text-eco-ink3">—</span>;
  const neutro = pct !== null ? Math.abs(pct) < 1 : v === 0;
  const Icon = neutro ? ArrowRight : v > 0 ? ArrowUpRight : ArrowDownRight;
  const texto =
    pct !== null
      ? `${pct > 0 ? '+' : pct < 0 ? '−' : ''}${fmtPct(Math.abs(pct))}`
      : `${v > 0 ? '+' : v < 0 ? '−' : ''}${fmtNum(Math.abs(v))}`;
  return (
    <span
      className={cx(
        'inline-flex items-center justify-end gap-0.5 text-xs font-semibold tabular-nums',
        !neutro && v > 0 ? 'text-eco-org' : 'text-eco-ink2',
      )}
    >
      <Icon size={14} aria-hidden />
      {neutro ? 'Igual' : texto}
    </span>
  );
}

/** "Tu mes en EcoToken": resumen del mes en curso y comparación al mismo día del anterior. */
export function MonthSummaryCard({ c }: { c: Comparacion }) {
  const nombre = (m: string) => etiquetaMes(m, true).split(' ')[0];
  const filas = [
    {
      label: 'Kg reciclados',
      ant: fmtKg(c.anterior.kg),
      act: fmtKg(c.actual.kg),
      cambio: <Cambio pct={c.kg} />,
    },
    {
      label: 'Aportes',
      ant: fmtNum(c.anterior.aportes),
      act: fmtNum(c.actual.aportes),
      cambio: <Cambio pct={null} diff={c.aportes} />,
    },
    {
      label: 'ECO reconocidos',
      ant: fmtNum(c.anterior.puntos),
      act: fmtNum(c.actual.puntos),
      cambio: <Cambio pct={c.puntos} />,
    },
    {
      label: 'Tipos de material',
      ant: fmtNum(c.anterior.materiales),
      act: fmtNum(c.actual.materiales),
      cambio: (
        <Cambio pct={null} diff={c.actual.materiales - c.anterior.materiales} />
      ),
    },
  ];
  return (
    <ChartCard
      title="Tu mes en EcoToken"
      question={`Este mes vs. el anterior, del 1 al ${c.dia} de cada mes para comparar lo comparable.`}
      actions={<Etapa>Mes en curso</Etapa>}
    >
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-eco-bg p-3 text-sm">
        <div>
          <div className="text-lg font-bold text-eco-ink">
            {fmtKg(c.actual.kg)}
          </div>
          <div className="text-xs text-eco-ink2">reciclados</div>
        </div>
        <div>
          <div className="text-lg font-bold text-eco-ink">
            {fmtNum(c.actual.aportes)}
          </div>
          <div className="text-xs text-eco-ink2">aportes</div>
        </div>
        <div>
          <div className="text-lg font-bold text-eco-ink">
            {fmtNum(c.actual.puntos)}
          </div>
          <div className="text-xs text-eco-ink2">ECO reconocidos</div>
        </div>
        <div>
          <div className="text-lg font-bold text-eco-ink">
            {fmtNum(c.actual.materiales)}
          </div>
          <div className="text-xs text-eco-ink2">tipos de material</div>
        </div>
      </div>
      <table className="w-full text-sm">
        <caption className="sr-only">
          Comparación con el mes anterior al mismo día
        </caption>
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-eco-ink2">
            <th className="pb-2 text-left font-semibold" scope="col">
              <span className="sr-only">Métrica</span>
            </th>
            <th className="pb-2 text-right font-semibold" scope="col">
              {nombre(c.previo)}
            </th>
            <th className="pb-2 text-right font-semibold" scope="col">
              {nombre(c.mes)}
            </th>
            <th className="pb-2 text-right font-semibold" scope="col">
              Cambio
            </th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.label} className="border-t border-eco-border">
              <th
                scope="row"
                className="py-2 text-left font-normal text-eco-ink2"
              >
                {f.label}
              </th>
              <td className="py-2 text-right tabular-nums text-eco-ink2">
                {f.ant}
              </td>
              <td className="py-2 text-right font-semibold tabular-nums text-eco-ink">
                {f.act}
              </td>
              <td className="py-2 text-right">{f.cambio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChartCard>
  );
}

/** Frecuencia de participación: aportes por semana, este mes vs. el anterior. */
export function FrequencyCard({
  actual,
  anterior,
  mes,
  previo,
  ultimoAporte,
  mesesActivos,
}: {
  actual: Semana[];
  anterior: Semana[];
  mes: string;
  previo: string;
  ultimoAporte: number | null; // días desde el último aporte
  mesesActivos: number; // de los últimos 6
}) {
  const nombre = (m: string) => etiquetaMes(m, true).split(' ')[0];
  const max = Math.max(
    1,
    ...actual.map((s) => s.aportes),
    ...anterior.map((s) => s.aportes),
  );
  const semanas = Math.max(actual.length, anterior.length);
  return (
    <ChartCard
      title="Frecuencia de participación"
      question="Aportes por semana del mes (días 1–7, 8–14, …)."
    >
      <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-eco-bg p-3">
          <dt className="text-xs text-eco-ink2">Último aporte</dt>
          <dd className="font-semibold text-eco-ink">
            {ultimoAporte === null ? '—' : textoHaceDias(ultimoAporte)}
          </dd>
        </div>
        <div className="rounded-lg bg-eco-bg p-3">
          <dt className="text-xs text-eco-ink2">Meses con aportes</dt>
          <dd className="font-semibold text-eco-ink">
            {mesesActivos} de los últimos 6
          </dd>
        </div>
      </dl>
      <ul className="flex flex-col gap-2.5">
        {Array.from({ length: semanas }, (_, i) => {
          const a = actual[i]?.aportes ?? 0;
          const p = anterior[i]?.aportes ?? 0;
          return (
            <li
              key={i}
              className="grid grid-cols-[4.5rem_1fr] items-center gap-2 text-xs"
              aria-label={`Semana ${i + 1}: ${a} aportes en ${nombre(mes)}, ${p} en ${nombre(previo)}`}
            >
              <span className="text-eco-ink2">Semana {i + 1}</span>
              <div className="flex flex-col gap-1">
                {[
                  { n: a, cls: 'bg-eco-org' },
                  { n: p, cls: 'bg-eco-ink3' },
                ].map((b, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-eco-bg">
                      <div
                        className={cx(
                          'h-full rounded-full transition-[width] duration-500',
                          b.cls,
                        )}
                        style={{ width: `${(b.n / max) * 100}%` }}
                      />
                    </div>
                    <span className="w-4 text-right tabular-nums text-eco-ink2">
                      {b.n}
                    </span>
                  </div>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex gap-4 text-xs text-eco-ink2">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-full bg-eco-org" aria-hidden />{' '}
          {nombre(mes)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-full bg-eco-ink3" aria-hidden />{' '}
          {nombre(previo)}
        </span>
      </div>
    </ChartCard>
  );
}
