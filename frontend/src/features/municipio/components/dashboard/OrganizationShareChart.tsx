import {
  ResponsiveContainer,
  Tooltip,
  Treemap,
  type TooltipProps,
} from 'recharts';
import { fmtKg, fmtPct, type OrganizacionAgg } from '../../dashboard/data';
import { ChartCard, SinDatos, TooltipBox, TooltipRow } from './ChartCard';

interface Celda {
  x: number;
  y: number;
  width: number;
  height: number;
  nombre?: string;
  pct?: number;
  id?: string;
  depth?: number;
}

// Una sola tonalidad (verde EcoToken) con intensidad según participación: la
// organización no es una categoría de color, el tamaño ya codifica el valor.
function celda(onSelect: (id: string) => void) {
  return function Celda({
    x,
    y,
    width,
    height,
    nombre,
    pct = 0,
    id,
    depth,
  }: Celda) {
    if (depth !== 1) return <g />;
    const alpha = 0.35 + Math.min(pct / 100, 1) * 0.65;
    const grande = width > 70 && height > 34;
    return (
      <g onClick={() => id && onSelect(id)} className="cursor-pointer">
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={4}
          fill={`rgba(29,158,117,${alpha})`}
          stroke="#fff"
          strokeWidth={2}
        />
        {grande && (
          <>
            <text
              x={x + 8}
              y={y + 18}
              fontSize={12}
              fontWeight={600}
              fill="#fff"
            >
              {nombre && nombre.length > width / 7
                ? `${nombre.slice(0, Math.floor(width / 7) - 1)}…`
                : nombre}
            </text>
            <text x={x + 8} y={y + 33} fontSize={11} fill="#fff">
              {fmtPct(pct)}
            </text>
          </>
        )}
      </g>
    );
  };
}

function Detalle({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const o = payload[0].payload as OrganizacionAgg;
  return (
    <TooltipBox title={o.nombre}>
      <TooltipRow label="Del total" value={fmtPct(o.pct)} />
      <TooltipRow label="Kg reciclados" value={fmtKg(o.kg)} />
    </TooltipBox>
  );
}

export function OrganizationShareChart({
  data,
  onSelect,
}: {
  data: OrganizacionAgg[];
  onSelect: (id: string) => void;
}) {
  const Celda = celda(onSelect);
  return (
    <ChartCard
      title="Participación por organización"
      question="¿Qué porcentaje del total aporta cada participante?"
    >
      {data.length === 0 ? (
        <SinDatos />
      ) : (
        <>
          <div
            className="h-64"
            role="img"
            aria-label="Treemap de participación de cada organización en el total"
          >
            <ResponsiveContainer>
              <Treemap
                data={data}
                dataKey="kg"
                nameKey="nombre"
                isAnimationActive={false}
                content={<Celda x={0} y={0} width={0} height={0} />}
              >
                <Tooltip content={<Detalle />} />
              </Treemap>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 flex flex-col gap-1 text-xs">
            {data.slice(0, 5).map((o) => (
              <li key={o.id} className="flex justify-between gap-2">
                <span className="truncate text-eco-ink">{o.nombre}</span>
                <span className="font-semibold text-eco-ink">
                  {fmtPct(o.pct)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </ChartCard>
  );
}
