import {
  etiquetaMes,
  fmtKg,
  nombreMaterial,
  variacion,
  type comparacionMensual,
} from '../../dashboard/data';
import { ChartCard, Delta, SinDatos, Swatch } from './ChartCard';

export function MonthlyComparisonChart({
  data,
  color,
}: {
  data: ReturnType<typeof comparacionMensual>;
  color: (m: string) => string;
}) {
  return (
    <ChartCard
      title="Evolución respecto al mes anterior"
      question="Último mes del período contra el mes calendario previo."
    >
      {!data ? (
        <SinDatos label="No hay un mes anterior con aportes para comparar." />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg bg-eco-bg p-4 text-center">
            <div>
              <div className="text-xs text-eco-ink2">
                {etiquetaMes(data.previo, true)}
              </div>
              <div className="text-xl font-bold text-eco-ink2">
                {fmtKg(data.anterior.kg)}
              </div>
            </div>
            <span aria-hidden className="text-eco-ink3">
              →
            </span>
            <div>
              <div className="text-xs text-eco-ink2">
                {etiquetaMes(data.mes, true)}
              </div>
              <div className="text-xl font-bold text-eco-ink">
                {fmtKg(data.actual.kg)}
              </div>
              <Delta value={variacion(data.actual.kg, data.anterior.kg)} />
            </div>
          </div>
          <table className="w-full text-sm">
            <caption className="sr-only">Variación por material</caption>
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-eco-ink2">
                <th className="pb-1 font-semibold">Material</th>
                <th className="pb-1 text-right font-semibold">
                  {etiquetaMes(data.previo)}
                </th>
                <th className="pb-1 text-right font-semibold">
                  {etiquetaMes(data.mes)}
                </th>
                <th className="pb-1 text-right font-semibold">Variación</th>
              </tr>
            </thead>
            <tbody>
              {data.materiales.map((m) => (
                <tr key={m.material} className="border-t border-eco-border">
                  <td className="py-1.5">
                    <span className="flex items-center gap-2 text-eco-ink">
                      <Swatch color={color(m.material)} />
                      {nombreMaterial(m.material)}
                    </span>
                  </td>
                  <td className="py-1.5 text-right text-eco-ink2">
                    {fmtKg(m.kgAnterior)}
                  </td>
                  <td className="py-1.5 text-right text-eco-ink">
                    {fmtKg(m.kgActual)}
                  </td>
                  <td className="py-1.5 text-right">
                    {m.variacion === null ? (
                      <span className="text-xs font-semibold text-eco-org">
                        Nuevo
                      </span>
                    ) : (
                      <Delta value={m.variacion} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ChartCard>
  );
}
