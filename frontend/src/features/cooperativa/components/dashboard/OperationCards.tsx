import { Link } from 'react-router-dom';
import { fechaAR } from '@/lib/fecha';
import {
  CalendarCheck,
  CheckCircle2,
  CircleAlert,
  ShieldCheck,
} from 'lucide-react';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { addressLink, txLogsLink } from '@/lib/explorer';
import {
  inicioMes,
  proximoCierre,
  restanteCierre,
  useAhora,
} from '@/lib/cierreMes';
import {
  fmtKg,
  fmtNum,
  fmtPct,
  nombreMaterial,
  type MaterialAgg,
} from '@/features/municipio/dashboard/data';
import {
  ChartCard,
  Delta,
  Swatch,
} from '@/features/municipio/components/dashboard/ChartCard';
import { Etapa, Kpi } from '@/features/empresa/components/dashboard/KpiCards';
import type { EntregaHistorial, MiCooperativa } from '../../api';
import type { ComparacionOp, ResumenOp } from '../../dashboard/data';

// ─── KPIs operativos ───

export function TodayCard({ hoy }: { hoy: ResumenOp }) {
  return (
    <Kpi
      destacado
      label="Material recibido hoy"
      etapa={<Etapa>Hoy</Etapa>}
      value={fmtNum(Math.round(hoy.kg * 10) / 10)}
      unit="kg"
    >
      {hoy.entregas === 0 ? (
        <span>Todavía no registraste entregas hoy.</span>
      ) : (
        <span>
          {fmtNum(hoy.entregas)} {hoy.entregas === 1 ? 'entrega' : 'entregas'} ·{' '}
          {fmtNum(hoy.organizaciones)}{' '}
          {hoy.organizaciones === 1
            ? 'organización atendida'
            : 'organizaciones atendidas'}{' '}
          · {fmtNum(hoy.materiales)}{' '}
          {hoy.materiales === 1 ? 'material' : 'materiales'}
        </span>
      )}
    </Kpi>
  );
}

const pct = (a: number, b: number) => (b > 0 ? ((a - b) / b) * 100 : null);

export function MonthVolumeCard({ c }: { c: ComparacionOp }) {
  return (
    <Kpi
      label="Recibido este mes"
      etapa={<Etapa>Mes en curso</Etapa>}
      value={fmtNum(Math.round(c.actual.kg * 10) / 10)}
      unit="kg"
    >
      {c.anterior.kg > 0 ? (
        <span className="flex flex-wrap items-center gap-1">
          <Delta value={pct(c.actual.kg, c.anterior.kg)} /> vs. mismo día del
          mes anterior
        </span>
      ) : (
        <span>Sin período anterior comparable</span>
      )}
    </Kpi>
  );
}

export function DeliveriesCard({ c }: { c: ComparacionOp }) {
  const { promedio } = c.actual;
  const dif =
    promedio !== null && c.anterior.promedio !== null
      ? promedio - c.anterior.promedio
      : null;
  return (
    <Kpi label="Entregas este mes" value={fmtNum(c.actual.entregas)}>
      <span>
        {promedio === null
          ? 'Sin entregas aún'
          : `${fmtKg(promedio)} promedio por entrega`}
      </span>
      {dif !== null && Math.abs(dif) >= 0.1 && (
        <span>
          {dif > 0 ? '↑' : '↓'} {fmtKg(Math.abs(dif))} respecto al mes anterior
        </span>
      )}
    </Kpi>
  );
}

export function OrganizationsCountCard({ c }: { c: ComparacionOp }) {
  return (
    <Kpi label="Organizaciones" value={fmtNum(c.actual.organizaciones)}>
      <span>con entregas este mes</span>
      {c.anterior.organizaciones > 0 && (
        <span>
          {fmtNum(c.anterior.organizaciones)} a esta altura del mes anterior
        </span>
      )}
    </Kpi>
  );
}

export function MainMaterialCard({
  material,
  color,
}: {
  material: MaterialAgg | null;
  color: (m: string) => string;
}) {
  return (
    <Kpi
      label="Material principal"
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
      <span>
        {material
          ? `${fmtKg(material.kg)} · ${fmtPct(material.pct)} del mes`
          : 'Sin entregas este mes'}
      </span>
    </Kpi>
  );
}

// ─── Últimas entregas ───

export function RecentDeliveries({
  entregas,
  color,
}: {
  entregas: EntregaHistorial[];
  color: (m: string) => string;
}) {
  return (
    <ChartCard
      title="Últimas entregas"
      question="Las 8 entregas más recientes que registraste."
      actions={
        <Link
          to="/cooperativa/historial"
          className="text-xs font-semibold text-eco-org hover:underline"
        >
          Ver historial completo →
        </Link>
      }
    >
      <Table
        columns={[
          { label: 'Fecha' },
          { label: 'Organización' },
          { label: 'Material' },
          { label: 'Peso', align: 'right' },
          { label: 'ECO', align: 'right' },
          { label: 'Comprobante', align: 'right' },
        ]}
        rows={entregas.map((e) => ({
          cells: [
            fechaAR(e.fecha),
            e.empresa,
            <span key="m" className="inline-flex items-center gap-2">
              <Swatch color={color(e.material)} />
              {nombreMaterial(e.material)}
            </span>,
            fmtKg(e.peso),
            fmtNum(e.tokens),
            e.txHash ? (
              <a
                key="c"
                href={txLogsLink(e.txHash)}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-eco-org hover:underline"
              >
                Ver ↗
              </a>
            ) : (
              <span key="c" className="text-xs text-eco-ink2">
                Pendiente
              </span>
            ),
          ],
        }))}
        emptyLabel="Todavía no registraste entregas."
      />
    </ChartCard>
  );
}

// ─── Cierre del período ───

export function MonthlyCloseSummary({ mes }: { mes: ResumenOp }) {
  const ahora = useAhora();
  const cierre = proximoCierre(ahora);
  const inicio = inicioMes(ahora);
  const { dias } = restanteCierre(ahora);
  const fecha = new Date(cierre - 1).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
  const progreso = Math.min(1, (ahora - inicio) / (cierre - inicio));
  return (
    <ChartCard title="Cierre del período">
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-eco-coop-soft text-eco-coop">
            <CalendarCheck size={22} aria-hidden />
          </span>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-eco-ink2">
              {fecha}
            </div>
            <div className="text-lg font-bold text-eco-ink">
              {dias === 0
                ? 'Cierra hoy'
                : `${dias} ${dias === 1 ? 'día restante' : 'días restantes'}`}
            </div>
          </div>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-eco-border"
          aria-hidden
        >
          <div
            className="h-full rounded-full bg-eco-coop"
            style={{ width: `${progreso * 100}%` }}
          />
        </div>
        <div className="text-sm text-eco-ink">
          Este mes registraste{' '}
          <strong>
            {fmtNum(mes.entregas)} {mes.entregas === 1 ? 'entrega' : 'entregas'}
          </strong>
          , <strong>{fmtKg(mes.kg)}</strong> de{' '}
          <strong>
            {fmtNum(mes.organizaciones)}{' '}
            {mes.organizaciones === 1 ? 'organización' : 'organizaciones'}
          </strong>{' '}
          en{' '}
          <strong>
            {fmtNum(mes.materiales)}{' '}
            {mes.materiales === 1 ? 'material' : 'materiales'}
          </strong>
          .
        </div>
        <p className="text-xs text-eco-ink2">
          Al cierre mensual, los aportes registrados forman parte del cálculo
          del ranking y de los certificados de cada organización.
        </p>
        <Link
          to="/cooperativa/cierre-de-mes"
          className="mt-auto text-xs font-semibold text-eco-org hover:underline"
        >
          Ver detalle del cierre →
        </Link>
      </div>
    </ChartCard>
  );
}

// ─── Validación y trazabilidad ───

export function ValidatorStatus({
  coop,
  mes,
}: {
  coop: MiCooperativa | null;
  mes: ResumenOp;
}) {
  const validador = coop?.validador ?? null;
  return (
    <ChartCard title="Validación y trazabilidad">
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-start gap-3">
          {validador === false ? (
            <CircleAlert
              size={20}
              aria-hidden
              className="mt-0.5 shrink-0 text-eco-danger"
            />
          ) : (
            <ShieldCheck
              size={20}
              aria-hidden
              className={
                validador
                  ? 'mt-0.5 shrink-0 text-eco-org'
                  : 'mt-0.5 shrink-0 text-eco-ink2'
              }
            />
          )}
          <div>
            <div className="text-sm font-semibold text-eco-ink">
              {validador === true
                ? 'Cooperativa autorizada'
                : validador === false
                  ? 'Autorización pendiente'
                  : 'Autorización no verificada'}
            </div>
            <p className="text-xs text-eco-ink2">
              {validador === true
                ? 'Podés registrar y validar entregas en EcoToken.'
                : validador === false
                  ? 'Tu cuenta todavía no está habilitada como validadora. Contactá a administración.'
                  : 'No se pudo consultar la red en este momento.'}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle2
            size={20}
            aria-hidden
            className="mt-0.5 shrink-0 text-eco-org"
          />
          <div>
            <div className="text-sm font-semibold text-eco-ink">
              Registros verificables
            </div>
            <p className="text-xs text-eco-ink2">
              Cada entrega queda asociada a un comprobante y a un registro
              público verificable.
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-eco-bg p-3">
            <dt className="text-xs text-eco-ink2">Registros del mes</dt>
            <dd className="font-semibold text-eco-ink">
              {fmtNum(mes.entregas)}
            </dd>
          </div>
          <div className="rounded-lg bg-eco-bg p-3">
            <dt className="text-xs text-eco-ink2">Confirmados en la red</dt>
            <dd className="font-semibold text-eco-ink">
              {fmtNum(mes.confirmadas)}
              {mes.entregas > mes.confirmadas && (
                <span className="ml-2">
                  <Badge>{mes.entregas - mes.confirmadas} pendientes</Badge>
                </span>
              )}
            </dd>
          </div>
        </dl>
        <details className="mt-auto text-xs text-eco-ink2">
          <summary className="cursor-pointer font-semibold text-eco-ink">
            Detalle técnico
          </summary>
          <dl className="mt-2 grid gap-1">
            <div>
              <dt className="inline">Rol on-chain: </dt>
              <dd className="inline font-mono">VALIDATOR_ROLE</dd>
            </div>
            <div>
              <dt className="inline">Red: </dt>
              <dd className="inline">Sepolia (Ethereum)</dd>
            </div>
            {coop?.walletAddress && (
              <div className="truncate">
                <dt className="inline">Billetera: </dt>
                <dd className="inline">
                  <a
                    href={addressLink(coop.walletAddress)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono hover:text-eco-org"
                  >
                    {coop.walletAddress.slice(0, 10)}…
                    {coop.walletAddress.slice(-8)} ↗
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </details>
      </div>
    </ChartCard>
  );
}
