import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  fmtFecha,
  fmtKg,
  fmtNum,
  fmtPct,
  nombreMaterial,
  type OrganizacionAgg,
} from '@/features/municipio/dashboard/data';
import {
  ChartCard,
  EJE,
  GRILLA,
  NotaMesEnCurso,
  Segmented,
  SinDatos,
  TooltipBox,
  TooltipRow,
  VERDE,
} from '@/features/municipio/components/dashboard/ChartCard';
import { Cambio } from '@/features/empresa/components/dashboard/MonthCards';
import { Etapa } from '@/features/empresa/components/dashboard/KpiCards';
import type {
  CeldaCalendario,
  ComparacionOp,
  OrdenOrganizaciones,
  PuntoDiaOp,
  PuntoMesOp,
} from '../../dashboard/data';

const ejeX = {
  tick: EJE,
  tickLine: false,
  axisLine: { stroke: GRILLA },
} as const;
const fmtDia = (fecha: string) =>
  new Date(`${fecha}T12:00:00Z`).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
const nombreMes = (m: string) => etiquetaMes(m, true).split(' ')[0];

// ─── Evolución mensual ───

type MetricaMes = 'kg' | 'entregas';

export function MonthlyVolumeChart({ data }: { data: PuntoMesOp[] }) {
  const [metrica, setMetrica] = useState<MetricaMes>('kg');
  const filas = data.map((p) => ({ ...p, label: etiquetaEje(p.mes) }));
  const Detalle = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload as PuntoMesOp;
    return (
      <TooltipBox title={etiquetaMes(p.mes, true)}>
        <TooltipRow label="Recibidos" value={fmtKg(p.kg)} />
        <TooltipRow label="Entregas" value={fmtNum(p.entregas)} />
        <TooltipRow label="Organizaciones" value={fmtNum(p.organizaciones)} />
      </TooltipBox>
    );
  };
  return (
    <ChartCard
      title="Evolución mensual"
      question="¿Está creciendo el volumen que procesa la cooperativa? Últimos 6 meses."
      actions={
        <Segmented
          label="Métrica del gráfico"
          value={metrica}
          onChange={setMetrica}
          options={{ kg: 'Kg recibidos', entregas: 'Entregas' }}
        />
      }
    >
      {data.every((p) => p.entregas === 0) ? (
        <SinDatos label="Todavía no registraste entregas en los últimos meses." />
      ) : (
        <>
          <div
            className="h-64"
            role="img"
            aria-label="Material recibido por mes"
          >
            <ResponsiveContainer>
              <AreaChart
                data={filas}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="coop-evo" x1="0" y1="0" x2="0" y2="1">
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
                  width={60}
                  allowDecimals={metrica === 'kg'}
                  tickFormatter={(v: number) =>
                    metrica === 'kg' ? `${fmtNum(v)} kg` : fmtNum(v)
                  }
                />
                <Tooltip
                  content={<Detalle />}
                  cursor={{ stroke: '#B5B8BC', strokeDasharray: '3 3' }}
                />
                <Area
                  type="monotone"
                  dataKey={metrica}
                  stroke={VERDE}
                  strokeWidth={2}
                  fill="url(#coop-evo)"
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

// ─── Actividad del mes (kg por día) ───

export function DailyActivityChart({
  data,
  hoy,
}: {
  data: PuntoDiaOp[];
  hoy: string;
}) {
  const Detalle = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload as PuntoDiaOp;
    if (d.kg === null) return null;
    return (
      <TooltipBox title={fmtDia(d.fecha)}>
        <TooltipRow label="Recibidos" value={fmtKg(d.kg)} />
        <TooltipRow label="Entregas" value={fmtNum(d.entregas)} />
      </TooltipBox>
    );
  };
  const hayDatos = data.some((d) => (d.kg ?? 0) > 0);
  return (
    <ChartCard
      title="Actividad del mes"
      question={`Kg registrados por día en ${nombreMes(hoy.slice(0, 7)).toLowerCase()}.`}
      actions={<Etapa>Mes en curso</Etapa>}
    >
      {!hayDatos ? (
        <SinDatos label="Todavía no registraste entregas este mes." />
      ) : (
        <div
          className="h-56"
          role="img"
          aria-label="Kilos recibidos por día del mes"
        >
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke={GRILLA} />
              <XAxis
                dataKey="dia"
                {...ejeX}
                interval="preserveStartEnd"
                minTickGap={8}
              />
              <YAxis
                tick={EJE}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v: number) => `${fmtNum(v)} kg`}
              />
              <Tooltip content={<Detalle />} cursor={{ fill: '#F7F7F5' }} />
              <Bar
                dataKey="kg"
                radius={[4, 4, 0, 0]}
                maxBarSize={22}
                animationDuration={500}
              >
                {data.map((d) => (
                  <Cell
                    key={d.dia}
                    fill={d.fecha === hoy ? '#BA7517' : VERDE}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {hayDatos && (
        <p className="mt-2 text-[11px] text-eco-ink2">
          <span
            className="mr-1 inline-block h-2 w-2 rounded-sm bg-eco-coop"
            aria-hidden
          />
          Hoy
        </p>
      )}
    </ChartCard>
  );
}

// ─── Este mes vs. mes anterior ───

export function MonthComparisonCard({ c }: { c: ComparacionOp }) {
  const v = (a: number, b: number) => (b > 0 ? ((a - b) / b) * 100 : null);
  const { actual: a, anterior: p } = c;
  const filas = [
    [
      'Kg recibidos',
      fmtKg(p.kg),
      fmtKg(a.kg),
      <Cambio key="1" pct={v(a.kg, p.kg)} />,
    ],
    [
      'Entregas',
      fmtNum(p.entregas),
      fmtNum(a.entregas),
      <Cambio key="2" pct={v(a.entregas, p.entregas)} />,
    ],
    [
      'Organizaciones',
      fmtNum(p.organizaciones),
      fmtNum(a.organizaciones),
      <Cambio key="3" pct={v(a.organizaciones, p.organizaciones)} />,
    ],
    [
      'Peso promedio',
      p.promedio === null ? '—' : fmtKg(p.promedio),
      a.promedio === null ? '—' : fmtKg(a.promedio),
      <Cambio
        key="4"
        pct={
          a.promedio !== null && p.promedio !== null
            ? v(a.promedio, p.promedio)
            : null
        }
      />,
    ],
  ] as const;
  return (
    <ChartCard
      title="Este mes vs. mes anterior"
      question={`Del 1 al ${c.dia} de cada mes, para comparar períodos equivalentes.`}
    >
      <table className="w-full text-sm">
        <caption className="sr-only">
          Comparación con el mes anterior al mismo día
        </caption>
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-eco-ink2">
            <th scope="col" className="pb-2 text-left font-semibold">
              <span className="sr-only">Métrica</span>
            </th>
            <th scope="col" className="pb-2 text-right font-semibold">
              {nombreMes(c.previo)}
            </th>
            <th scope="col" className="pb-2 text-right font-semibold">
              {nombreMes(c.mes)}
            </th>
            <th scope="col" className="pb-2 text-right font-semibold">
              Cambio
            </th>
          </tr>
        </thead>
        <tbody>
          {filas.map(([label, ant, act, cambio]) => (
            <tr key={label} className="border-t border-eco-border">
              <th
                scope="row"
                className="py-2.5 text-left font-normal text-eco-ink2"
              >
                {label}
              </th>
              <td className="py-2.5 text-right tabular-nums text-eco-ink2">
                {ant}
              </td>
              <td className="py-2.5 text-right font-semibold tabular-nums text-eco-ink">
                {act}
              </td>
              <td className="py-2.5 text-right">{cambio}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[11px] text-eco-ink2">
        Un peso promedio menor no es necesariamente negativo: puede reflejar más
        entregas chicas.
      </p>
    </ChartCard>
  );
}

// ─── Organizaciones participantes ───

const ORDENES: Record<OrdenOrganizaciones, string> = {
  kg: 'Kg',
  aportes: 'Entregas',
  ultimoAporte: 'Última',
};

export function OrganizationsCard({
  data,
  orden,
  onOrden,
  totalKg,
}: {
  data: OrganizacionAgg[];
  orden: OrdenOrganizaciones;
  onOrden: (o: OrdenOrganizaciones) => void;
  totalKg: number;
}) {
  const max = Math.max(1, ...data.map((o) => o.kg));
  const top = data.slice(0, 8);
  return (
    <ChartCard
      title="Organizaciones participantes"
      question="Quiénes te entregan material en el período."
      actions={
        <Segmented
          label="Ordenar organizaciones por"
          value={orden}
          onChange={onOrden}
          options={ORDENES}
        />
      }
    >
      {top.length === 0 ? (
        <SinDatos label="Sin entregas en el período." />
      ) : (
        <div className="flex h-full flex-col">
          <ul className="flex flex-col gap-3">
            {top.map((o) => (
              <li key={o.id}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate font-semibold text-eco-ink">
                    {o.nombre}
                  </span>
                  <span className="shrink-0 tabular-nums text-eco-ink">
                    {fmtKg(o.kg)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-eco-bg">
                  <div
                    className="h-full rounded-full bg-eco-org transition-[width] duration-500"
                    style={{ width: `${(o.kg / max) * 100}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-eco-ink2">
                  {fmtNum(o.aportes)} {o.aportes === 1 ? 'entrega' : 'entregas'}{' '}
                  · {fmtPct(totalKg > 0 ? (o.kg / totalKg) * 100 : 0)} del total
                  · última {fmtFecha(o.ultimoAporte)} ·{' '}
                  {nombreMaterial(o.materialPrincipal)}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-4">
            <Link
              to="/cooperativa/historial"
              className="text-xs font-semibold text-eco-org hover:underline"
            >
              {data.length > top.length
                ? `Ver las ${data.length} organizaciones →`
                : 'Ver todas las entregas →'}
            </Link>
          </div>
        </div>
      )}
    </ChartCard>
  );
}

// ─── Frecuencia de entregas (calendario) ───

const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
// Secuencial de un solo tono (verde EcoToken), claro → oscuro.
const NIVELES = ['#EEF0F1', '#C6E8DA', '#7FCBAD', '#3FAE84', '#1D7A57'];

export function DeliveryHeatmap({
  semanas,
  ultimaEntrega,
}: {
  semanas: CeldaCalendario[][];
  ultimaEntrega: string | null;
}) {
  const max = Math.max(1, ...semanas.flat().map((c) => c.entregas));
  const nivel = (n: number) =>
    n === 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4));
  const activos = semanas.flat().filter((c) => c.entregas > 0).length;
  return (
    <ChartCard
      title="Frecuencia de entregas"
      question={`Últimas ${semanas.length} semanas. Más intenso = más entregas ese día.`}
    >
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <div
          className="flex flex-col gap-1 pr-1 text-[10px] text-eco-ink2"
          aria-hidden
        >
          {DIAS.map((d, i) => (
            <span key={i} className="flex h-4 items-center">
              {d}
            </span>
          ))}
        </div>
        {semanas.map((semana) => (
          <div key={semana[0].fecha} className="flex flex-col gap-1">
            {semana.map((c) => (
              <span
                key={c.fecha}
                role={c.futuro ? undefined : 'img'}
                aria-hidden={c.futuro || undefined}
                aria-label={
                  c.futuro
                    ? undefined
                    : `${fmtDia(c.fecha)}: ${c.entregas} entregas, ${fmtKg(c.kg)}`
                }
                title={
                  c.futuro
                    ? undefined
                    : `${fmtDia(c.fecha)}\n${c.entregas} entregas · ${fmtKg(c.kg)}`
                }
                className={cx('h-4 w-4 rounded-[3px]', c.futuro && 'opacity-0')}
                style={{ background: NIVELES[nivel(c.entregas)] }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-eco-ink2">
        <span>
          {fmtNum(activos)} días con entregas
          {ultimaEntrega && ` · última: ${fmtFecha(ultimaEntrega)}`}
        </span>
        <span className="flex items-center gap-1" aria-hidden>
          Menos
          {NIVELES.map((c) => (
            <span
              key={c}
              className="h-3 w-3 rounded-[3px]"
              style={{ background: c }}
            />
          ))}
          Más
        </span>
      </div>
    </ChartCard>
  );
}
