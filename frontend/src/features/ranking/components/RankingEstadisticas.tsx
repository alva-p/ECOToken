import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import type { FilaRanking, MaterialKg, PeriodoCerrado } from '../api';

const COLORES = [
  '#1D9E75',
  '#3F6FB5',
  '#BA7517',
  '#8A8F95',
  '#534AB7',
  '#B5B8BC',
];

const kg = (n: number) => `${n.toLocaleString('es-AR')} kg`;

export function Titulo({ children, sub }: { children: string; sub: string }) {
  return (
    <>
      <h3 className="text-sm font-semibold text-eco-ink">{children}</h3>
      <p className="mb-4 text-xs text-eco-ink2">{sub}</p>
    </>
  );
}

function TopKg({ data }: { data: FilaRanking[] }) {
  const top = data.slice(0, 8);
  const max = Math.max(...top.map((f) => f.kgReciclados), 1);
  return (
    <Card className="p-5">
      <Titulo sub="Empresas con mayor volumen">Top 8 — kg reciclados</Titulo>
      <ul className="flex flex-col gap-2.5">
        {top.map((f, i) => (
          <li key={f.posicion} className="flex items-center gap-3 text-xs">
            <span className="w-28 shrink-0 truncate text-eco-ink sm:w-36">
              {f.razonSocial}
            </span>
            <span className="h-3 flex-1 overflow-hidden rounded bg-eco-bg">
              <span
                className="block h-full rounded"
                style={{
                  width: `${(f.kgReciclados / max) * 100}%`,
                  background: i === 0 ? '#1D9E75' : '#7CC4AA',
                }}
              />
            </span>
            <span className="w-16 shrink-0 text-right font-semibold">
              {kg(f.kgReciclados)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

const R = 40;
const C = 2 * Math.PI * R;

export function Distribucion({
  materiales,
  total,
  titulo = 'Distribución por material',
}: {
  materiales: MaterialKg[];
  total: number;
  titulo?: string;
}) {
  const suma = materiales.reduce((s, m) => s + m.kg, 0) || 1;
  let acumulado = 0;
  return (
    <Card className="p-5">
      <Titulo sub={`${kg(total)} reciclados en el mes`}>{titulo}</Titulo>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-8">
        <svg
          viewBox="0 0 100 100"
          className="h-44 w-44 shrink-0 -rotate-90"
          role="img"
          aria-label="Distribución del material reciclado"
        >
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="#F7F7F5"
            strokeWidth="16"
          />
          {materiales.map((m, i) => {
            const largo = (m.kg / suma) * C;
            const el = (
              <circle
                key={m.material}
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={COLORES[i % COLORES.length]}
                strokeWidth="16"
                strokeDasharray={`${largo} ${C - largo}`}
                strokeDashoffset={-acumulado}
              />
            );
            acumulado += largo;
            return el;
          })}
        </svg>
        <ul className="grid grid-cols-[auto_auto_auto] items-center gap-x-3 gap-y-2 text-xs">
          {materiales.map((m, i) => (
            <li key={m.material} className="contents">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: COLORES[i % COLORES.length] }}
              />
              <span className="text-eco-ink">{m.material}</span>
              <span className="text-right font-semibold">
                {Math.round((m.kg / suma) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

const MES_CORTO = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export interface PuntoSerie {
  mes: number;
  anio?: number;
  totalKg: number;
}

/** Línea de kg por mes con detalle al pasar el mouse; `serie` va del más viejo al más nuevo. */
export function Evolucion({
  serie,
  titulo = 'Evolución mensual',
}: {
  serie: PuntoSerie[];
  titulo?: string;
}) {
  const [activo, setActivo] = useState<number | null>(null);
  if (serie.length < 2) return null;

  const W = 300;
  const H = 120;
  const max = Math.max(...serie.map((p) => p.totalKg), 1);
  const x = (i: number) => i / (serie.length - 1);
  const y = (p: PuntoSerie) => (H - (p.totalKg / max) * (H - 10) - 5) / H;
  const linea = serie.map((p, i) => `${x(i) * W},${y(p) * H}`).join(' ');

  // Con el mouse (o el dedo) se elige el mes más cercano al cursor.
  function mover(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const rel = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
    setActivo(Math.round(rel * (serie.length - 1)));
  }

  const sel = activo === null ? null : serie[activo];
  const previo = activo !== null && activo > 0 ? serie[activo - 1] : null;
  const etiqueta = (p: PuntoSerie) =>
    `${MES_CORTO[p.mes - 1]}${p.anio ? ` ${p.anio}` : ''}`;

  return (
    <Card className="p-5">
      <Titulo sub={`kg reciclados · últimos ${serie.length} meses`}>
        {titulo}
      </Titulo>
      {/* Alto fijo: el gráfico no agranda la tarjeta; trazo y punto no se deforman. */}
      <div
        className="relative h-40 touch-pan-y"
        onPointerMove={mover}
        onPointerDown={mover}
        onPointerLeave={() => setActivo(null)}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
          role="img"
          aria-label="Evolución mensual de kg reciclados"
        >
          <polygon
            points={`0,${H} ${linea} ${W},${H}`}
            fill="#1D9E75"
            opacity="0.1"
          />
          <polyline
            points={linea}
            fill="none"
            stroke="#1D9E75"
            strokeWidth="2"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {/* Punto del último mes (o del mes bajo el cursor) y guía vertical. */}
        {[sel ? activo! : serie.length - 1].map((i) => (
          <span key={i}>
            {sel && (
              <span
                aria-hidden
                className="absolute inset-y-0 w-px bg-eco-org/30"
                style={{ left: `${x(i) * 100}%` }}
              />
            )}
            <span
              aria-hidden
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-eco-org"
              style={{ left: `${x(i) * 100}%`, top: `${y(serie[i]) * 100}%` }}
            />
          </span>
        ))}
        {sel && (
          <div
            role="status"
            className="pointer-events-none absolute z-10 -translate-y-full whitespace-nowrap rounded-lg bg-eco-ink px-3 py-2 text-xs text-white shadow-lg"
            style={{
              left: `${x(activo!) * 100}%`,
              top: `calc(${y(sel) * 100}% - 12px)`,
              transform: `translate(${
                activo! < 2
                  ? '0'
                  : activo! > serie.length - 3
                    ? '-100%'
                    : '-50%'
              }, -100%)`,
            }}
          >
            <div className="text-white/60">{etiqueta(sel)}</div>
            <div className="text-sm font-bold">{kg(sel.totalKg)}</div>
            {previo && (
              <div
                className={
                  sel.totalKg >= previo.totalKg
                    ? 'text-[#7CE0BB]'
                    : 'text-[#F2B382]'
                }
              >
                {sel.totalKg >= previo.totalKg ? '+' : '−'}
                {kg(
                  Math.abs(
                    Math.round((sel.totalKg - previo.totalKg) * 10) / 10,
                  ),
                )}{' '}
                vs. mes anterior
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-eco-ink2">
        <span>{MES_CORTO[serie[0].mes - 1]}</span>
        <span className="font-semibold text-eco-org">
          {kg(serie[serie.length - 1].totalKg)}
        </span>
        <span>{MES_CORTO[serie[serie.length - 1].mes - 1]}</span>
      </div>
    </Card>
  );
}

function Impacto({
  co2,
  certificados,
  empresas,
}: {
  co2: number;
  certificados: number;
  empresas: number;
}) {
  const items = [
    [
      'CO₂ evitado',
      `${co2.toLocaleString('es-AR')} kg`,
      'según certificados del mes',
    ],
    [
      'Certificados',
      certificados.toLocaleString('es-AR'),
      'emitidos hasta hoy',
    ],
    [
      'Participantes',
      empresas.toLocaleString('es-AR'),
      'empresas en el cierre',
    ],
  ];
  return (
    <Card className="p-5">
      <Titulo sub="Lo que dejó el mes">Impacto ambiental</Titulo>
      <ul className="flex flex-col gap-3">
        {items.map(([label, valor, sub]) => (
          <li
            key={label}
            className="flex items-baseline justify-between gap-3 border-b border-eco-border pb-2 last:border-0 last:pb-0"
          >
            <div>
              <div className="text-xs font-semibold text-eco-ink">{label}</div>
              <div className="text-[11px] text-eco-ink2">{sub}</div>
            </div>
            <div className="text-lg font-bold text-eco-org">{valor}</div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Últimos 12 meses cerrados hasta `actual`, del más viejo al más nuevo. */
function serieDe(
  periodos: PeriodoCerrado[],
  actual: { mes: number; anio: number },
): PuntoSerie[] {
  const clave = (p: { mes: number; anio: number }) => p.anio * 12 + p.mes;
  return periodos
    .filter((p) => clave(p) <= clave(actual))
    .slice(0, 12)
    .reverse();
}

export function RankingEstadisticas({
  data,
  materiales,
  totalKg,
  co2Evitado,
  periodos,
  actual,
}: {
  data: FilaRanking[];
  materiales: MaterialKg[];
  totalKg: number;
  co2Evitado: number;
  periodos: PeriodoCerrado[];
  actual: { mes: number; anio: number };
}) {
  const certificados = data.reduce((s, f) => s + f.certificados, 0);
  return (
    <section>
      <div className="text-xs font-semibold uppercase tracking-wide text-eco-org">
        Estadísticas visuales
      </div>
      <h2 className="mb-4 mt-1 text-xl font-bold tracking-tight">
        Cómo reciclaron las empresas este mes
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <TopKg data={data} />
        {materiales.length > 0 ? (
          <Distribucion materiales={materiales} total={totalKg} />
        ) : (
          <Impacto
            co2={co2Evitado}
            certificados={certificados}
            empresas={data.length}
          />
        )}
        <Evolucion serie={serieDe(periodos, actual)} />
        {materiales.length > 0 && (
          <Impacto
            co2={co2Evitado}
            certificados={certificados}
            empresas={data.length}
          />
        )}
      </div>
    </section>
  );
}
