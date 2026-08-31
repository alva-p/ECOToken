import { useId, useState, type PointerEvent } from 'react';

export interface PuntoImpacto {
  label: string;
  kg: number;
}

interface ImpactoChartProps {
  data: PuntoImpacto[];
}

const WIDTH = 600;
const HEIGHT = 118;
const PAD_X = 4;
const PAD_TOP = 14;
const PAD_BOTTOM = 20;

// Gráfico de línea del material recuperado (landing pública): antes era un
// degradé CSS decorativo sin datos reales detrás — "no se entiende". Esta es
// una serie única (sin leyenda necesaria, per dataviz skill) con hover +
// crosshair; los valores siguen siendo de ejemplo (E11-HU04), E7-HU03 los
// reemplaza por datos reales del backend.
export function ImpactoChart({ data }: ImpactoChartProps) {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);

  const min = Math.min(...data.map((d) => d.kg));
  const max = Math.max(...data.map((d) => d.kg));
  const rangoY = max - min || 1;
  const innerW = WIDTH - PAD_X * 2;
  const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const puntos = data.map((d, i) => ({
    ...d,
    x: PAD_X + (i / (data.length - 1)) * innerW,
    y: PAD_TOP + innerH - ((d.kg - min) / rangoY) * innerH,
  }));

  const lineaPath = puntos
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${lineaPath} L${puntos[puntos.length - 1].x.toFixed(1)},${(PAD_TOP + innerH).toFixed(1)} L${puntos[0].x.toFixed(1)},${(PAD_TOP + innerH).toFixed(1)} Z`;

  function actualizarHover(event: PointerEvent<SVGSVGElement>) {
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const xRelativo = ((event.clientX - rect.left) / rect.width) * WIDTH;
    let masCercano = 0;
    let distanciaMin = Infinity;
    puntos.forEach((p, i) => {
      const distancia = Math.abs(p.x - xRelativo);
      if (distancia < distanciaMin) {
        distanciaMin = distancia;
        masCercano = i;
      }
    });
    setHover(masCercano);
  }

  const activo = hover !== null ? puntos[hover] : null;

  return (
    <div className="impacto-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="impacto-chart-svg"
        onPointerMove={actualizarHover}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`Kg reciclados por período, de ${data[0].label} a ${data[data.length - 1].label}: sube de ${min.toLocaleString('es-AR')} a ${max.toLocaleString('es-AR')} kg`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#baff3c" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#baff3c" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grilla horizontal, recesiva */}
        {[0, 0.5, 1].map((t) => {
          const y = PAD_TOP + innerH * t;
          return (
            <line
              key={t}
              x1={PAD_X}
              x2={WIDTH - PAD_X}
              y1={y}
              y2={y}
              stroke="rgba(174, 255, 197, 0.1)"
              strokeWidth={1}
            />
          );
        })}

        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path
          d={lineaPath}
          fill="none"
          stroke="#baff3c"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Crosshair + punto activo */}
        {activo && (
          <line
            x1={activo.x}
            x2={activo.x}
            y1={PAD_TOP}
            y2={PAD_TOP + innerH}
            stroke="rgba(238, 249, 241, 0.35)"
            strokeWidth={1}
          />
        )}

        {puntos.map((p, i) => {
          const esUltimo = i === puntos.length - 1;
          const esActivo = hover === i;
          if (!esUltimo && !esActivo) return null;
          return (
            <circle
              key={p.label}
              cx={p.x}
              cy={p.y}
              r={esActivo ? 5 : 4}
              fill="#baff3c"
              stroke="#0b1a15"
              strokeWidth={2}
            />
          );
        })}

        {/* Hit areas: una franja por punto, más fácil de acertar que la línea */}
        {puntos.map((p, i) => (
          <rect
            key={`hit-${p.label}`}
            x={p.x - innerW / data.length / 2}
            y={0}
            width={innerW / data.length}
            height={HEIGHT}
            fill="transparent"
            tabIndex={0}
            role="button"
            aria-label={`${p.label}: ${p.kg.toLocaleString('es-AR')} kg`}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
          />
        ))}
      </svg>

      {data.map((d, i) => (
        <span
          key={d.label}
          className="chart-label"
          style={{
            left: i === 0 ? 2 : undefined,
            right: i === data.length - 1 ? 2 : undefined,
            display: i === 0 || i === data.length - 1 ? 'block' : 'none',
          }}
        >
          {d.label}
        </span>
      ))}

      {activo && (
        <div
          className="impacto-chart-tooltip"
          style={{ left: `${(activo.x / WIDTH) * 100}%` }}
        >
          <strong>{activo.kg.toLocaleString('es-AR')} kg</strong>
          <span>{activo.label}</span>
        </div>
      )}
    </div>
  );
}
