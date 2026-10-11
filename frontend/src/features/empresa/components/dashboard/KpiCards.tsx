import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cx } from '@/lib/cx';
import type { MiPosicion } from '@/features/ranking/api';
import {
  etiquetaMes,
  fmtKg,
  fmtNum,
  fmtPct,
  nombreMaterial,
} from '@/features/municipio/dashboard/data';
import {
  Delta,
  Swatch,
} from '@/features/municipio/components/dashboard/ChartCard';
import type { Comparacion, MaterialMes } from '../../dashboard/data';

/** Etiqueta chica que separa datos en curso de datos ya cerrados. */
export function Etapa({
  cerrado,
  children,
}: {
  cerrado?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        cerrado
          ? 'bg-eco-muni-soft text-eco-muni'
          : 'bg-eco-org-soft text-eco-org',
      )}
    >
      {children}
    </span>
  );
}

function Kpi({
  label,
  etapa,
  value,
  unit,
  children,
  destacado,
}: {
  label: string;
  etapa?: ReactNode;
  value: ReactNode;
  unit?: string;
  children?: ReactNode;
  destacado?: boolean;
}) {
  return (
    <Card
      className={cx(
        'flex flex-col gap-1.5 p-5 shadow-sm',
        destacado && 'border-eco-org/30 bg-eco-org-soft/50 sm:col-span-2',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-eco-ink2">
          {label}
        </span>
        {etapa}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cx(
            'font-bold tracking-tight text-eco-ink tabular-nums',
            destacado ? 'text-4xl' : 'text-3xl',
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-sm font-semibold text-eco-org">{unit}</span>
        )}
      </div>
      <div className="flex flex-col gap-1 text-xs text-eco-ink2">
        {children}
      </div>
    </Card>
  );
}

/** Kg del mes en curso: la métrica principal del panel (impacto real, no saldo). */
export function MonthlyImpactCard({ c }: { c: Comparacion }) {
  const mesPrevio = etiquetaMes(c.previo, true).split(' ')[0].toLowerCase();
  return (
    <Kpi
      destacado
      label="Material reciclado"
      etapa={<Etapa>Mes en curso</Etapa>}
      value={fmtNum(Math.round(c.actual.kg * 10) / 10)}
      unit="kg"
    >
      {c.actual.aportes === 0 ? (
        <span>
          Todavía no registraste aportes este mes.
          {c.anterior.kg > 0 &&
            ` A esta altura de ${mesPrevio} llevabas ${fmtKg(c.anterior.kg)}.`}
        </span>
      ) : (
        <>
          <span className="flex flex-wrap items-center gap-1">
            <Delta value={c.kg} />
            <span>
              vs. {mesPrevio} al día {c.dia}
            </span>
          </span>
          <span>
            {fmtNum(c.actual.aportes)}{' '}
            {c.actual.aportes === 1
              ? 'aporte registrado'
              : 'aportes registrados'}
          </span>
        </>
      )}
    </Kpi>
  );
}

export function EcoBalanceCard({
  saldo,
  reservado,
  sinConexion,
}: {
  saldo: number | null;
  reservado: number;
  sinConexion: boolean;
}) {
  return (
    <Kpi
      label="Puntos ECO"
      etapa={
        sinConexion ? (
          <Badge color="danger">Sin conexión</Badge>
        ) : (
          <Badge color="org">En tiempo real</Badge>
        )
      }
      value={saldo === null ? '—' : fmtNum(saldo)}
      unit="ECO"
    >
      <span>Saldo actual · reconocimiento ambiental acumulado</span>
      {reservado > 0 && (
        <span>{fmtNum(reservado)} ECO reservados en canjes</span>
      )}
    </Kpi>
  );
}

export function RankingSummaryCard({
  posicion,
}: {
  posicion: MiPosicion | null | undefined;
}) {
  const periodo =
    posicion &&
    etiquetaMes(
      `${posicion.anio}-${String(posicion.mes).padStart(2, '0')}`,
      true,
    );
  return (
    <Kpi
      label="Última posición"
      etapa={<Etapa cerrado>Ranking cerrado</Etapa>}
      value={posicion?.posicion ? `#${posicion.posicion}` : '—'}
    >
      {posicion === undefined ? (
        <span>Cargando…</span>
      ) : posicion === null ? (
        <span>Todavía no hay rankings cerrados.</span>
      ) : posicion.participa ? (
        <span>
          {periodo} · de {fmtNum(posicion.totalEmpresas)}{' '}
          {posicion.totalEmpresas === 1 ? 'organización' : 'organizaciones'}
        </span>
      ) : (
        <span>Sin aportes computados en {periodo}.</span>
      )}
      <Link
        to="/empresa/ranking"
        className="font-semibold text-eco-org hover:underline"
      >
        Ver ranking →
      </Link>
    </Kpi>
  );
}

export function ContributionsSummaryCard({ c }: { c: Comparacion }) {
  const { aportes, kg } = c.actual;
  return (
    <Kpi
      label="Aportes"
      etapa={<Etapa>Este mes</Etapa>}
      value={fmtNum(aportes)}
    >
      <span>
        {aportes > 0
          ? `${fmtKg(kg / aportes)} promedio por aporte`
          : 'Sin entregas registradas aún'}
      </span>
      {c.anterior.aportes > 0 && (
        <span>{fmtNum(c.anterior.aportes)} a esta altura del mes anterior</span>
      )}
    </Kpi>
  );
}

export function MainMaterialCard({
  material,
  mes,
  color,
}: {
  material: MaterialMes | null;
  mes: string | null;
  color: (m: string) => string;
}) {
  return (
    <Kpi
      label="Material principal"
      etapa={mes && <Etapa>{etiquetaMes(mes, true)}</Etapa>}
      value={
        material ? (
          <span className="flex items-center gap-2 text-2xl uppercase">
            <Swatch color={color(material.material)} />
            {nombreMaterial(material.material)}
          </span>
        ) : (
          '—'
        )
      }
    >
      {material ? (
        <span>
          {fmtKg(material.kg)} · {fmtPct(material.pct)} del mes
        </span>
      ) : (
        <span>Todavía no registraste aportes.</span>
      )}
    </Kpi>
  );
}
