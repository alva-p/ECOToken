import {
  fmtKg,
  nombreMaterial,
  type OrganizacionAgg,
} from '../../dashboard/data';
import { ChartCard, SinDatos, Swatch } from './ChartCard';

/** Matriz organización × material; intensidad = kg (una sola tonalidad) y el valor siempre escrito. */
export function MaterialHeatmap({
  data,
  materiales,
  color,
  onSelect,
}: {
  data: OrganizacionAgg[];
  materiales: string[];
  color: (m: string) => string;
  onSelect: (id: string) => void;
}) {
  const max = Math.max(
    ...data.flatMap((o) => Object.values(o.kgPorMaterial)),
    1,
  );
  return (
    <ChartCard
      title="Distribución de materiales por organización"
      question="Especialización y ausencias de un vistazo. Más oscuro = más kg."
    >
      {data.length === 0 ? (
        <SinDatos />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] border-separate border-spacing-1 text-xs">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="text-left font-semibold text-eco-ink2"
                >
                  Organización
                </th>
                {materiales.map((m) => (
                  <th
                    key={m}
                    scope="col"
                    className="font-semibold text-eco-ink2"
                  >
                    <span className="inline-flex items-center gap-1">
                      <Swatch color={color(m)} />
                      {nombreMaterial(m)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 12).map((o) => (
                <tr key={o.id}>
                  <th
                    scope="row"
                    className="max-w-40 truncate text-left font-medium"
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(o.id)}
                      className="truncate text-eco-ink hover:text-eco-org hover:underline"
                    >
                      {o.nombre}
                    </button>
                  </th>
                  {materiales.map((m) => {
                    const kg = o.kgPorMaterial[m] ?? 0;
                    const t = kg / max;
                    return (
                      <td
                        key={m}
                        title={`${o.nombre} · ${nombreMaterial(m)}: ${fmtKg(kg)}`}
                        className="rounded px-2 py-2 text-center font-semibold"
                        style={{
                          background: kg
                            ? `rgba(29,158,117,${0.1 + t * 0.85})`
                            : '#F7F7F5',
                          color: t > 0.5 ? '#fff' : kg ? '#0F1115' : '#B5B8BC',
                        }}
                      >
                        {kg ? fmtKg(kg) : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ChartCard>
  );
}
