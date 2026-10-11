import { useState } from 'react';
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import {
  fmtKg,
  fmtNum,
  fmtPct,
  type OrganizacionAgg,
} from '../../dashboard/data';
import {
  ChartCard,
  EJE,
  SinDatos,
  TooltipBox,
  TooltipRow,
  VERDE,
} from './ChartCard';

type Orden = 'kg' | 'aportes' | 'puntos';

const ORDENES: Record<Orden, string> = {
  kg: 'Kg reciclados',
  aportes: 'Cantidad de aportes',
  puntos: 'Puntos ECO',
};

const valor = (o: OrganizacionAgg, orden: Orden) =>
  orden === 'kg'
    ? fmtKg(o.kg)
    : orden === 'aportes'
      ? `${fmtNum(o.aportes)} · ${fmtKg(o.promedio)}/aporte`
      : `${fmtNum(o.puntos)} ECO`;

function Detalle({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const o = payload[0].payload as OrganizacionAgg;
  return (
    <TooltipBox title={o.nombre}>
      <TooltipRow label="Kg reciclados" value={fmtKg(o.kg)} />
      <TooltipRow label="Del total" value={fmtPct(o.pct)} />
      <TooltipRow label="Aportes" value={fmtNum(o.aportes)} />
      <TooltipRow label="Promedio por aporte" value={fmtKg(o.promedio)} />
      <TooltipRow label="Puntos ECO" value={fmtNum(o.puntos)} />
      <div className="mt-1 text-[11px] text-eco-ink3">
        Clic para ver el detalle
      </div>
    </TooltipBox>
  );
}

/** Top 10 por volumen, frecuencia de aportes o puntos (cubre también "Frecuencia de participación"). */
export function OrganizationRankingChart({
  data,
  onSelect,
}: {
  data: OrganizacionAgg[];
  onSelect: (id: string) => void;
}) {
  const [orden, setOrden] = useState<Orden>('kg');
  const top = [...data]
    .sort((a, b) => b[orden] - a[orden])
    .slice(0, 10)
    .map((o) => ({ ...o, etiqueta: valor(o, orden) }));

  return (
    <ChartCard
      title="Organizaciones con mayor participación"
      question="¿Quiénes aportan más? Top 10."
      actions={
        <label className="flex items-center gap-2 text-xs text-eco-ink2">
          Ordenar por
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as Orden)}
            className="rounded-md border border-eco-border-strong bg-white px-2 py-1 text-xs text-eco-ink"
          >
            {(Object.keys(ORDENES) as Orden[]).map((o) => (
              <option key={o} value={o}>
                {ORDENES[o]}
              </option>
            ))}
          </select>
        </label>
      }
    >
      {top.length === 0 ? (
        <SinDatos />
      ) : (
        <div
          style={{ height: top.length * 40 + 8 }}
          role="img"
          aria-label={`Ranking de organizaciones por ${ORDENES[orden]}`}
        >
          <ResponsiveContainer>
            <BarChart
              data={top}
              layout="vertical"
              margin={{ top: 0, right: 150, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide dataKey={orden} />
              <YAxis
                type="category"
                dataKey="nombre"
                width={130}
                tick={EJE}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<Detalle />} cursor={{ fill: '#F7F7F5' }} />
              <Bar
                dataKey={orden}
                fill={VERDE}
                radius={[0, 4, 4, 0]}
                barSize={18}
                className="cursor-pointer"
                onClick={(o: OrganizacionAgg) => onSelect(o.id)}
              >
                <LabelList
                  dataKey="etiqueta"
                  position="right"
                  style={{ fontSize: 11, fill: '#0F1115', fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
