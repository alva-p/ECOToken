import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from 'recharts';
import { cx } from '@/lib/cx';
import {
  fmtKg,
  fmtNum,
  fmtPct,
  nombreMaterial,
  type MaterialAgg,
} from '../../dashboard/data';
import {
  ChartCard,
  SinDatos,
  Swatch,
  TooltipBox,
  TooltipRow,
} from './ChartCard';

function Detalle({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const m = payload[0].payload as MaterialAgg;
  return (
    <TooltipBox title={nombreMaterial(m.material)}>
      <TooltipRow label="Recuperado" value={fmtKg(m.kg)} />
      <TooltipRow label="Del total" value={fmtPct(m.pct)} />
      <TooltipRow label="Aportes" value={fmtNum(m.aportes)} />
    </TooltipBox>
  );
}

/** Donut de composición; clic en un material lo usa como filtro del dashboard. */
export function MaterialDistributionChart({
  data,
  color,
  seleccionado,
  onSelect,
}: {
  data: MaterialAgg[];
  color: (m: string) => string;
  seleccionado: string;
  onSelect: (material: string) => void;
}) {
  const total = data.reduce((s, m) => s + m.kg, 0);
  return (
    <ChartCard
      title="¿Qué se está reciclando?"
      question="Composición del material recuperado. Clic en un material para filtrar."
    >
      {data.length === 0 ? (
        <SinDatos />
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col 2xl:flex-row">
          <div
            className="relative h-52 w-52 shrink-0"
            role="img"
            aria-label="Distribución de materiales reciclados"
          >
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="kg"
                  nameKey="material"
                  innerRadius="62%"
                  outerRadius="100%"
                  paddingAngle={data.length > 1 ? 1.5 : 0}
                  stroke="#fff"
                  strokeWidth={2}
                  onClick={(d: MaterialAgg) => onSelect(d.material)}
                  className="cursor-pointer"
                >
                  {data.map((m) => (
                    <Cell
                      key={m.material}
                      fill={color(m.material)}
                      opacity={
                        seleccionado && seleccionado !== m.material ? 0.35 : 1
                      }
                    />
                  ))}
                </Pie>
                <Tooltip content={<Detalle />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-eco-ink">
                {fmtKg(total)}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-eco-ink2">
                Total
              </span>
            </div>
          </div>
          <ul className="flex w-full flex-col gap-1">
            {data.map((m) => (
              <li key={m.material}>
                <button
                  type="button"
                  aria-pressed={seleccionado === m.material}
                  onClick={() => onSelect(m.material)}
                  className={cx(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-eco-bg',
                    seleccionado === m.material && 'bg-eco-org-soft',
                  )}
                >
                  <Swatch color={color(m.material)} />
                  <span className="flex-1 truncate text-eco-ink">
                    {nombreMaterial(m.material)}
                  </span>
                  <span className="text-xs text-eco-ink2">{fmtKg(m.kg)}</span>
                  <span className="w-12 text-right text-xs font-semibold text-eco-ink">
                    {fmtPct(m.pct)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  );
}
