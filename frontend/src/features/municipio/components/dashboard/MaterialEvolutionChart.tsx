import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import {
  etiquetaEje,
  etiquetaMes,
  fmtKg,
  fmtNum,
  fmtPct,
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
} from './ChartCard';

export function MaterialEvolutionChart({
  data,
  materiales,
  color,
}: {
  data: MesAgg[];
  materiales: string[];
  color: (m: string) => string;
}) {
  const filas = data.map((m) => ({ ...m, label: etiquetaEje(m.mes) }));

  const Detalle = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const m = payload[0].payload as MesAgg;
    return (
      <TooltipBox title={etiquetaMes(m.mes, true)}>
        {materiales
          .filter((mat) => m.porMaterial[mat])
          .map((mat) => (
            <TooltipRow
              key={mat}
              color={color(mat)}
              label={nombreMaterial(mat)}
              value={`${fmtKg(m.porMaterial[mat])} · ${fmtPct((m.porMaterial[mat] / m.total) * 100)}`}
            />
          ))}
        <div className="my-1 border-t border-eco-border" />
        <TooltipRow label="Total" value={fmtKg(m.total)} />
      </TooltipBox>
    );
  };

  return (
    <ChartCard
      title="Evolución mensual por tipo de material"
      question="¿Cambia la composición del reciclaje con el tiempo?"
    >
      {filas.length === 0 ? (
        <SinDatos />
      ) : (
        <>
          <div
            className="h-72"
            role="img"
            aria-label="Kilos por material apilados por mes"
          >
            <ResponsiveContainer>
              <AreaChart
                data={filas}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
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
                  content={<Detalle />}
                  cursor={{ stroke: '#B5B8BC', strokeDasharray: '3 3' }}
                />
                <Legend
                  iconType="square"
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(v: string) => (
                    <span className="text-eco-ink2">{nombreMaterial(v)}</span>
                  )}
                />
                {materiales.map((mat) => (
                  <Area
                    key={mat}
                    type="monotone"
                    stackId="1"
                    name={mat}
                    dataKey={(r: MesAgg) => r.porMaterial[mat] ?? 0}
                    stroke="#fff"
                    strokeWidth={1.5}
                    fill={color(mat)}
                    fillOpacity={0.85}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <NotaMesEnCurso meses={filas} />
        </>
      )}
    </ChartCard>
  );
}
