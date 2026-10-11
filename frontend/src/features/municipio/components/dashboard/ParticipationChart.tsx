import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import {
  etiquetaEje,
  etiquetaMes,
  fmtNum,
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

function Detalle({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const m = payload[0].payload as MesAgg;
  return (
    <TooltipBox title={etiquetaMes(m.mes, true)}>
      <TooltipRow
        label="Organizaciones activas"
        value={fmtNum(m.organizaciones)}
      />
      <TooltipRow label="Aportes" value={fmtNum(m.aportes)} />
    </TooltipBox>
  );
}

export function ParticipationChart({ data }: { data: MesAgg[] }) {
  const filas = data.map((m) => ({ ...m, label: etiquetaEje(m.mes) }));
  return (
    <ChartCard
      title="Organizaciones participantes por mes"
      question="¿Crece la participación? Organizaciones con al menos un aporte."
    >
      {filas.length === 0 ? (
        <SinDatos />
      ) : (
        <>
          <div
            className="h-64"
            role="img"
            aria-label="Organizaciones participantes por mes"
          >
            <ResponsiveContainer>
              <BarChart
                data={filas}
                margin={{ top: 18, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke={GRILLA} />
                <XAxis
                  dataKey="label"
                  tick={EJE}
                  tickLine={false}
                  axisLine={{ stroke: GRILLA }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={EJE}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip content={<Detalle />} cursor={{ fill: '#F7F7F5' }} />
                <Bar
                  dataKey="organizaciones"
                  name="Organizaciones"
                  fill={VERDE}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                >
                  <LabelList
                    dataKey="organizaciones"
                    position="top"
                    style={{ fontSize: 11, fill: '#0F1115', fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <NotaMesEnCurso meses={filas} />
        </>
      )}
    </ChartCard>
  );
}
