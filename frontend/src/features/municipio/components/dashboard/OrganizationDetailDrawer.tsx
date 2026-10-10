import { useEffect, useRef } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import { ShieldCheck, X } from 'lucide-react';
import {
  etiquetaEje,
  etiquetaMes,
  fmtFecha,
  fmtKg,
  fmtNum,
  fmtPct,
  nombreMaterial,
  porMes,
  type Aporte,
  type MesAgg,
  type OrganizacionAgg,
} from '../../dashboard/data';
import {
  EJE,
  GRILLA,
  Swatch,
  TooltipBox,
  TooltipRow,
  VERDE,
} from './ChartCard';

function DetalleMes({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const m = payload[0].payload as MesAgg;
  return (
    <TooltipBox title={etiquetaMes(m.mes, true)}>
      <TooltipRow label="Kg" value={fmtKg(m.total)} />
      <TooltipRow label="Aportes" value={fmtNum(m.aportes)} />
    </TooltipBox>
  );
}

// Panel lateral con <dialog> nativo (foco, Escape y backdrop del navegador,
// mismo criterio que ConfirmModal) para no salir del dashboard.
export function OrganizationDetailDrawer({
  organizacion,
  aportes,
  posicion,
  totalOrganizaciones,
  desde,
  hasta,
  color,
  onClose,
}: {
  organizacion: OrganizacionAgg | null;
  aportes: Aporte[];
  posicion: number;
  totalOrganizaciones: number;
  desde: string;
  hasta: string;
  color: (m: string) => string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (organizacion && !d.open) d.showModal();
    if (!organizacion && d.open) d.close();
  }, [organizacion]);

  const o = organizacion;
  const serie = o
    ? porMes(aportes, desde, hasta).map((m) => ({
        ...m,
        label: etiquetaEje(m.mes),
      }))
    : [];
  const recientes = [...aportes]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 10);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="detalle-organizacion"
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-xl border-l border-eco-border bg-white p-0 backdrop:bg-black/40"
    >
      {o && (
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-eco-org">
                Detalle de organización
              </div>
              <h2
                id="detalle-organizacion"
                className="mt-0.5 text-xl font-bold text-eco-ink"
              >
                {o.nombre}
              </h2>
              <div className="text-xs text-eco-ink2">
                CUIT {o.cuit} · datos del período filtrado
              </div>
            </div>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={onClose}
              className="rounded-lg p-1.5 text-eco-ink2 hover:bg-eco-bg"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              [fmtKg(o.kg), 'reciclados'],
              [fmtNum(o.puntos), 'puntos ECO'],
              [fmtNum(o.aportes), 'aportes'],
            ].map(([v, l]) => (
              <div key={l} className="rounded-lg bg-eco-bg p-3">
                <div className="text-lg font-bold text-eco-ink">{v}</div>
                <div className="text-xs text-eco-ink2">{l}</div>
              </div>
            ))}
          </div>

          {o.verificados > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-eco-org/30 bg-eco-org-soft px-3 py-2 text-sm text-eco-org">
              <ShieldCheck size={16} aria-hidden />
              {o.verificados === o.aportes
                ? 'Todos los registros tienen trazabilidad verificable on-chain'
                : `${o.verificados} de ${o.aportes} registros con trazabilidad verificable on-chain`}
            </div>
          )}

          <section>
            <h3 className="mb-2 text-sm font-semibold text-eco-ink">
              Distribución por material
            </h3>
            <ul className="flex flex-col gap-2">
              {Object.entries(o.kgPorMaterial)
                .sort((a, b) => b[1] - a[1])
                .map(([m, kg]) => (
                  <li key={m} className="flex items-center gap-2 text-sm">
                    <Swatch color={color(m)} />
                    <span className="w-24 truncate text-eco-ink">
                      {nombreMaterial(m)}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-eco-bg">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${(kg / o.kg) * 100}%`,
                          background: color(m),
                        }}
                      />
                    </span>
                    <span className="w-20 text-right text-eco-ink2">
                      {fmtKg(kg)}
                    </span>
                  </li>
                ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-eco-ink">
              Evolución mensual
            </h3>
            <div
              className="h-44"
              role="img"
              aria-label={`Kilos por mes de ${o.nombre}`}
            >
              <ResponsiveContainer>
                <LineChart
                  data={serie}
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
                    width={48}
                    tickFormatter={(v: number) => `${fmtNum(v)} kg`}
                  />
                  <Tooltip content={<DetalleMes />} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke={VERDE}
                    strokeWidth={2}
                    dot={{ r: 3, fill: VERDE }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <h3 className="col-span-2 text-sm font-semibold text-eco-ink">
              Otros indicadores
            </h3>
            <span className="text-eco-ink2">Primer aporte</span>
            <span className="text-right text-eco-ink">
              {fmtFecha(o.primerAporte)}
            </span>
            <span className="text-eco-ink2">Último aporte</span>
            <span className="text-right text-eco-ink">
              {fmtFecha(o.ultimoAporte)}
            </span>
            <span className="text-eco-ink2">Promedio por aporte</span>
            <span className="text-right text-eco-ink">{fmtKg(o.promedio)}</span>
            <span className="text-eco-ink2">Participación en el total</span>
            <span className="text-right text-eco-ink">{fmtPct(o.pct)}</span>
            <span className="text-eco-ink2">Posición en el ranking</span>
            <span className="text-right text-eco-ink">
              {posicion > 0 ? `#${posicion} de ${totalOrganizaciones}` : '—'}
            </span>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-eco-ink">
              Historial reciente
            </h3>
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wide text-eco-ink2">
                <tr>
                  <th className="pb-1 font-semibold">Fecha</th>
                  <th className="pb-1 font-semibold">Material</th>
                  <th className="pb-1 text-right font-semibold">Kg</th>
                  <th className="pb-1 text-right font-semibold">Puntos ECO</th>
                </tr>
              </thead>
              <tbody>
                {recientes.map((a) => (
                  <tr key={a.id} className="border-t border-eco-border">
                    <td className="py-1.5 text-eco-ink2">
                      {fmtFecha(a.fecha)}
                    </td>
                    <td className="py-1.5">
                      <span className="flex items-center gap-2 text-eco-ink">
                        <Swatch color={color(a.material)} />
                        {nombreMaterial(a.material)}
                        {a.verificado && (
                          <ShieldCheck
                            size={13}
                            className="text-eco-org"
                            aria-label="Verificado on-chain"
                          />
                        )}
                      </span>
                    </td>
                    <td className="py-1.5 text-right text-eco-ink">
                      {fmtKg(a.kg)}
                    </td>
                    <td className="py-1.5 text-right text-eco-ink">
                      {fmtNum(a.puntos)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </dialog>
  );
}
