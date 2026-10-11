import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
  nombreMaterial,
} from '@/features/municipio/dashboard/data';
import {
  ChartCard,
  EJE,
  GRILLA,
  NotaMesEnCurso,
  Segmented,
  SinDatos,
  Swatch,
  TooltipBox,
  TooltipRow,
  VERDE,
} from '@/features/municipio/components/dashboard/ChartCard';
import type { PuntoDia, PuntoMes } from '../../dashboard/data';

const GRIS = '#9a9a96';

const ejeX = {
  tick: EJE,
  tickLine: false,
  axisLine: { stroke: GRILLA },
} as const;
const cursor = { stroke: '#B5B8BC', strokeDasharray: '3 3' };

// ─── Tu evolución mensual ───

type Metrica = 'kg' | 'aportes' | 'puntos';
const METRICAS: Record<Metrica, string> = {
  kg: 'Kg reciclados',
  aportes: 'Aportes',
  puntos: 'Puntos ECO',
};
const fmtMetrica: Record<Metrica, (n: number) => string> = {
  kg: fmtKg,
  aportes: fmtNum,
  puntos: (n) => `${fmtNum(n)} ECO`,
};

function DetalleMes({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as PuntoMes;
  return (
    <TooltipBox title={etiquetaMes(p.mes, true)}>
      <TooltipRow label="Reciclados" value={fmtKg(p.kg)} />
      <TooltipRow label="Aportes" value={fmtNum(p.aportes)} />
      <TooltipRow label="Reconocidos" value={`${fmtNum(p.puntos)} ECO`} />
    </TooltipBox>
  );
}

export function MonthlyEvolutionChart({ data }: { data: PuntoMes[] }) {
  const [metrica, setMetrica] = useState<Metrica>('kg');
  const filas = data.map((p) => ({ ...p, label: etiquetaEje(p.mes) }));
  const vacio = data.every((p) => p.aportes === 0);
  return (
    <ChartCard
      title="Tu evolución mensual"
      question="¿Estás aumentando o disminuyendo tu participación? Últimos 6 meses."
      actions={
        <Segmented
          label="Métrica del gráfico"
          value={metrica}
          options={METRICAS}
          onChange={setMetrica}
        />
      }
    >
      {vacio ? (
        <SinDatos label="Todavía no registraste aportes en los últimos meses." />
      ) : (
        <>
          <div
            className="h-64"
            role="img"
            aria-label={`${METRICAS[metrica]} por mes`}
          >
            <ResponsiveContainer>
              <AreaChart
                data={filas}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="evo-relleno" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={VERDE} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={VERDE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={GRILLA} />
                <XAxis dataKey="label" {...ejeX} />
                <YAxis
                  tick={EJE}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  allowDecimals={metrica === 'kg'}
                  tickFormatter={(v: number) => fmtMetrica[metrica](v)}
                />
                <Tooltip content={<DetalleMes />} cursor={cursor} />
                <Area
                  type="monotone"
                  dataKey={metrica}
                  stroke={VERDE}
                  strokeWidth={2}
                  fill="url(#evo-relleno)"
                  dot={{ r: 4, fill: VERDE, stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <NotaMesEnCurso meses={data} />
        </>
      )}
    </ChartCard>
  );
}

// ─── Reciclaje acumulado este mes ───

export function CurrentMonthProgressChart({
  data,
  mes,
  previo,
}: {
  data: PuntoDia[];
  mes: string;
  previo: string;
}) {
  const nombre = (m: string) => etiquetaMes(m, true).split(' ')[0];
  const hoyDia = data.filter((d) => d.actual !== null).length;
  const hoyPunto = data[hoyDia - 1];
  const hayPrevio = data.some((d) => (d.anterior ?? 0) > 0);

  const Detalle = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload as PuntoDia;
    return (
      <TooltipBox title={`Día ${d.dia}`}>
        {d.actual !== null && (
          <TooltipRow
            label={nombre(mes)}
            value={fmtKg(d.actual)}
            color={VERDE}
          />
        )}
        {d.anterior !== null && hayPrevio && (
          <TooltipRow
            label={nombre(previo)}
            value={fmtKg(d.anterior)}
            color={GRIS}
          />
        )}
      </TooltipBox>
    );
  };

  return (
    <ChartCard
      title="Reciclaje acumulado este mes"
      question="Kg acumulados día a día, con el mes anterior como referencia."
    >
      <div
        className="h-56"
        role="img"
        aria-label="Kg acumulados por día del mes"
      >
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke={GRILLA} />
            <XAxis dataKey="dia" {...ejeX} ticks={[1, 7, 14, 21, 28]} />
            <YAxis
              tick={EJE}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(v: number) => `${fmtNum(v)} kg`}
            />
            <Tooltip content={<Detalle />} cursor={cursor} />
            {hayPrevio && (
              <Line
                type="stepAfter"
                dataKey="anterior"
                stroke={GRIS}
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                animationDuration={500}
              />
            )}
            <Line
              type="stepAfter"
              dataKey="actual"
              stroke={VERDE}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-eco-ink2">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-eco-org" aria-hidden /> {nombre(mes)}{' '}
          (en curso)
        </span>
        {hayPrevio && (
          <span className="flex items-center gap-1.5">
            <span
              className="w-4 border-t-2 border-dashed border-[#9a9a96]"
              aria-hidden
            />
            {nombre(previo)}
          </span>
        )}
      </div>
      {hoyPunto && hayPrevio && (
        <p className="mt-2 text-sm text-eco-ink">
          A esta altura de {nombre(previo).toLowerCase()} llevabas{' '}
          <strong>{fmtKg(hoyPunto.anterior ?? 0)}</strong>; este mes llevás{' '}
          <strong>{fmtKg(hoyPunto.actual ?? 0)}</strong>.
        </p>
      )}
    </ChartCard>
  );
}

// ─── Cómo cambió lo que reciclás ───

export function MaterialMixChart({
  data,
  materiales,
  color,
  title = 'Cómo cambió lo que reciclás',
  question = 'Kg por material en cada mes: ¿mantenés o diversificás lo que entregás?',
  vacio = 'Todavía no registraste aportes en los últimos meses.',
}: {
  data: Record<string, number | string>[];
  materiales: string[];
  color: (m: string) => string;
  title?: string;
  question?: string;
  vacio?: string;
}) {
  const filas = data.map((f) => ({
    ...f,
    label: etiquetaEje(f.mes as string),
  }));
  const Detalle = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const f = payload[0].payload as Record<string, number | string>;
    const total = materiales.reduce((s, m) => s + ((f[m] as number) ?? 0), 0);
    return (
      <TooltipBox title={etiquetaMes(f.mes as string, true)}>
        {materiales
          .filter((m) => f[m])
          .map((m) => (
            <TooltipRow
              key={m}
              label={nombreMaterial(m)}
              value={fmtKg(f[m] as number)}
              color={color(m)}
            />
          ))}
        <div className="my-1 border-t border-eco-border" />
        <TooltipRow label="Total" value={fmtKg(total)} />
      </TooltipBox>
    );
  };
  return (
    <ChartCard title={title} question={question}>
      {materiales.length === 0 ? (
        <SinDatos label={vacio} />
      ) : (
        <>
          <div
            className="h-60"
            role="img"
            aria-label="Kg por material y por mes"
          >
            <ResponsiveContainer>
              <BarChart
                data={filas}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke={GRILLA} />
                <XAxis dataKey="label" {...ejeX} />
                <YAxis
                  tick={EJE}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(v: number) => `${fmtNum(v)} kg`}
                />
                <Tooltip content={<Detalle />} cursor={{ fill: '#F7F7F5' }} />
                {materiales.map((m) => (
                  <Bar
                    key={m}
                    dataKey={m}
                    stackId="mat"
                    fill={color(m)}
                    stroke="#fff"
                    strokeWidth={1}
                    maxBarSize={44}
                    animationDuration={500}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-eco-ink2">
            {materiales.map((m) => (
              <li key={m} className="flex items-center gap-1.5">
                <Swatch color={color(m)} />
                {nombreMaterial(m)}
              </li>
            ))}
          </ul>
          <NotaMesEnCurso meses={data as { mes: string }[]} />
        </>
      )}
    </ChartCard>
  );
}
