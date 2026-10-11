import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import {
  fmtKg,
  fmtNum,
  nombreMaterial,
  type OrganizacionAgg,
} from '../../dashboard/data';
import {
  ChartCard,
  EJE,
  GRILLA,
  SinDatos,
  TooltipBox,
  TooltipRow,
} from './ChartCard';

/** Barras apiladas horizontales: qué recicla cada organización (top 10 por kg). */
export function OrganizationMaterialChart({
  data,
  materiales,
  color,
  onSelect,
  title = 'Materiales por organización',
  question = 'No solo quién recicla más: qué recicla cada una.',
}: {
  data: OrganizacionAgg[];
  materiales: string[];
  color: (m: string) => string;
  onSelect?: (id: string) => void;
  title?: string;
  question?: string;
}) {
  const top = data.slice(0, 10);

  const Detalle = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const o = payload[0].payload as OrganizacionAgg;
    return (
      <TooltipBox title={o.nombre}>
        {materiales
          .filter((m) => o.kgPorMaterial[m])
          .map((m) => (
            <TooltipRow
              key={m}
              color={color(m)}
              label={nombreMaterial(m)}
              value={fmtKg(o.kgPorMaterial[m])}
            />
          ))}
        <div className="my-1 border-t border-eco-border" />
        <TooltipRow label="Total" value={fmtKg(o.kg)} />
      </TooltipBox>
    );
  };

  return (
    <ChartCard title={title} question={question}>
      {top.length === 0 ? (
        <SinDatos />
      ) : (
        <div
          style={{ height: top.length * 40 + 60 }}
          role="img"
          aria-label="Kilos por material de cada organización"
        >
          <ResponsiveContainer>
            <BarChart
              data={top}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} stroke={GRILLA} />
              <XAxis
                type="number"
                tick={EJE}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${fmtNum(v)} kg`}
              />
              <YAxis
                type="category"
                dataKey="nombre"
                width={130}
                tick={EJE}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<Detalle />} cursor={{ fill: '#F7F7F5' }} />
              <Legend
                iconType="square"
                wrapperStyle={{ fontSize: 12 }}
                formatter={(v: string) => (
                  <span className="text-eco-ink2">{nombreMaterial(v)}</span>
                )}
              />
              {materiales.map((m, i) => (
                <Bar
                  key={m}
                  name={m}
                  stackId="kg"
                  dataKey={(o: OrganizacionAgg) => o.kgPorMaterial[m] ?? 0}
                  fill={color(m)}
                  stroke="#fff"
                  strokeWidth={1}
                  barSize={18}
                  radius={i === materiales.length - 1 ? [0, 4, 4, 0] : 0}
                  className={onSelect && 'cursor-pointer'}
                  onClick={(o: OrganizacionAgg) => onSelect?.(o.id)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
