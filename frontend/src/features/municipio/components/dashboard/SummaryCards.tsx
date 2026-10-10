import { Card } from '@/components/ui/Card';
import {
  etiquetaMes,
  fmtKg,
  fmtNum,
  nombreMaterial,
  variacion,
  type comparacionMensual,
  type MaterialAgg,
  type OrganizacionAgg,
} from '../../dashboard/data';
import { Delta, Swatch } from './ChartCard';

const titulo = 'text-xs font-semibold uppercase tracking-wide text-eco-ink2';

export function DiversityCard({
  materiales,
  color,
}: {
  materiales: MaterialAgg[];
  color: (m: string) => string;
}) {
  return (
    <Card className="p-5 shadow-sm">
      <div className={titulo}>Diversidad de materiales</div>
      <div className="mt-1 text-3xl font-bold text-eco-ink">
        {materiales.length}
      </div>
      <div className="text-xs text-eco-ink2">
        tipos de materiales recuperados
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
        {materiales.map((m) => (
          <span
            key={m.material}
            className="flex items-center gap-1.5 text-xs text-eco-ink"
          >
            <Swatch color={color(m.material)} />
            {nombreMaterial(m.material)}
          </span>
        ))}
      </div>
    </Card>
  );
}

/** Quién participó antes del período y no registró aportes dentro de él. */
export function ActivityCard({
  activas,
  sinAportes,
  referencia,
  onSelect,
}: {
  activas: number;
  sinAportes: OrganizacionAgg[];
  referencia: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <Card className="p-5 shadow-sm">
      <div className={titulo}>Actividad en el período</div>
      <div className="mt-2 flex gap-6">
        <div>
          <div className="text-3xl font-bold text-eco-ink">{activas}</div>
          <div className="text-xs text-eco-ink2">con aportes</div>
        </div>
        {referencia && (
          <div>
            <div className="text-3xl font-bold text-eco-ink2">
              {sinAportes.length}
            </div>
            <div className="text-xs text-eco-ink2">
              sin aportes en el período
            </div>
          </div>
        )}
      </div>
      {!referencia ? (
        <p className="mt-3 text-xs text-eco-ink3">
          Elegí un período para ver qué organizaciones dejaron de aportar.
        </p>
      ) : sinAportes.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1 text-xs">
          {sinAportes.slice(0, 4).map((o) => (
            <li key={o.id} className="flex justify-between gap-2">
              <button
                type="button"
                onClick={() => onSelect(o.id)}
                className="truncate text-eco-ink hover:text-eco-org hover:underline"
              >
                {o.nombre}
              </button>
              <span className="shrink-0 text-eco-ink2">
                último:{' '}
                {o.ultimoAporte.slice(0, 10).split('-').reverse().join('/')}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-eco-ink2">
          Todas las organizaciones con historial aportaron en el período.
        </p>
      )}
    </Card>
  );
}

export function PeriodSummaryCard({
  data,
}: {
  data: ReturnType<typeof comparacionMensual>;
}) {
  if (!data) return null;
  const difOrgs = data.actual.organizaciones - data.anterior.organizaciones;
  return (
    <Card className="border-eco-org/30 bg-eco-org-soft/40 p-5 shadow-sm">
      <div className={titulo}>
        Resumen del mes · {etiquetaMes(data.mes, true)}
      </div>
      <div className="mt-2 text-2xl font-bold text-eco-ink">
        {fmtKg(data.actual.kg)} reciclados
      </div>
      <div className="mt-1 grid grid-cols-3 gap-2 text-xs text-eco-ink2">
        <span>
          <b className="text-eco-ink">{fmtNum(data.actual.organizaciones)}</b>{' '}
          organizaciones
        </span>
        <span>
          <b className="text-eco-ink">{fmtNum(data.actual.aportes)}</b> aportes
        </span>
        <span>
          <b className="text-eco-ink">{fmtNum(data.actual.puntos)}</b> puntos
          ECO
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        <Delta
          value={variacion(data.actual.kg, data.anterior.kg)}
          suffix={`kg vs ${etiquetaMes(data.previo, true).split(' ')[0].toLowerCase()}`}
        />
        {difOrgs !== 0 && (
          <span className="text-xs font-semibold text-eco-ink2">
            {difOrgs > 0 ? '+' : '−'}
            {Math.abs(difOrgs)} organización{Math.abs(difOrgs) > 1 ? 'es' : ''}{' '}
            participante{Math.abs(difOrgs) > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </Card>
  );
}
