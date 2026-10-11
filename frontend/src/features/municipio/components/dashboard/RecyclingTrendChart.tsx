import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import { cx } from '@/lib/cx';
import {
  etiquetaEje,
  etiquetaMes,
  fmtKg,
  fmtNum,
  nombreMaterial,
  type MesAgg,
} from '../../dashboard/data';
import {
  ChartCard,
  EJE,
  GRILLA,
  NotaMesEnCurso,
  SinDatos,
  TooltipBox,
  TooltipRow,
  VERDE,
} from './ChartCard';

type Vista = 'total' | 'material';

export function RecyclingTrendChart({
  data,
  materiales,
  color,
}: {
  data: MesAgg[];
  materiales: string[];
  color: (m: string) => string;
}) {
  const [vista, setVista] = useState<Vista>('total');
  const filas = data.map((m) => ({
    ...m,
    ...m.porMaterial,
    label: etiquetaEje(m.mes),
  }));

  const DetalleMes = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const m = payload[0].payload as MesAgg;
    return (
      <TooltipBox title={etiquetaMes(m.mes, true)}>
        <TooltipRow label="Total" value={fmtKg(m.total)} />
        {materiales
          .filter((mat) => m.porMaterial[mat])
          .map((mat) => (
            <TooltipRow
              key={mat}
              label={nombreMaterial(mat)}
              value={fmtKg(m.porMaterial[mat])}
              color={color(mat)}
            />
          ))}
        <div className="my-1 border-t border-eco-border" />
        <TooltipRow label="Aportes" value={fmtNum(m.aportes)} />
        <TooltipRow
          label="Organizaciones participantes"
          value={fmtNum(m.organizaciones)}
        />
      </TooltipBox>
    );
  };

  const ejes = (
    <>
      <CartesianGrid vertical={false} stroke={GRILLA} />
      <XAxis
        dataKey="label"
        tick={EJE}
        tickLine={false}
        axisLine={{ stroke: GRILLA }}
      />
      <YAxis
        tick={EJE}
        tickLine={false}
        axisLine={false}
        width={56}
        tickFormatter={(v: number) => `${fmtNum(v)} kg`}
      />
      <Tooltip
        content={<DetalleMes />}
        cursor={{ stroke: '#B5B8BC', strokeDasharray: '3 3' }}
      />
    </>
  );

  return (
    <ChartCard
      title="Evolución del volumen reciclado"
      question="¿Estamos reciclando más que antes? Kg por mes."
      actions={
        <div
          className="inline-flex rounded-lg border border-eco-border-strong p-0.5"
          role="group"
          aria-label="Vista del gráfico"
        >
          {(['total', 'material'] as Vista[]).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={vista === v}
              onClick={() => setVista(v)}
              className={cx(
                'rounded-md px-2.5 py-1 text-xs font-semibold',
                vista === v
                  ? 'bg-eco-org-soft text-eco-org'
                  : 'text-eco-ink2 hover:text-eco-ink',
              )}
            >
              {v === 'total' ? 'Total' : 'Por material'}
            </button>
          ))}
        </div>
      }
    >
      {filas.length === 0 ? (
        <SinDatos />
      ) : (
        <>
          <div
            className="h-72"
            role="img"
            aria-label="Gráfico de kilos reciclados por mes"
          >
            <ResponsiveContainer>
              {vista === 'total' ? (
                <AreaChart
                  data={filas}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="tendencia-total"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={VERDE} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={VERDE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {ejes}
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Kg totales"
                    stroke={VERDE}
                    strokeWidth={2}
                    fill="url(#tendencia-total)"
                    dot={{ r: 3, fill: VERDE }}
                    activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              ) : (
                <LineChart
                  data={filas}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  {ejes}
                  <Legend
                    iconType="plainline"
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(v: string) => (
                      <span className="text-eco-ink2">{nombreMaterial(v)}</span>
                    )}
                  />
                  {materiales.map((mat) => (
                    <Line
                      key={mat}
                      type="monotone"
                      dataKey={(r: Record<string, number>) => r[mat] ?? 0}
                      name={mat}
                      stroke={color(mat)}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                    />
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
          <NotaMesEnCurso meses={filas} />
        </>
      )}
    </ChartCard>
  );
}
