import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Building2,
  Clock,
  Coins,
  Recycle,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CierreMesBadge } from '@/components/CierreMesBadge';
import { LoadingState } from '@/components/ui/States';
import type { Empresa } from '@/types';
import { obtenerAportes } from '@/features/municipio/api';
import type { Aporte } from '@/features/municipio/dashboard/data';
import {
  coloresMateriales,
  fmtKg,
  fmtNum,
  porMaterial,
  porMes,
  porOrganizacion,
  resumir,
} from '@/features/municipio/dashboard/data';
import { MetricCard } from '@/features/municipio/components/dashboard/MetricCard';
import { MaterialDistributionChart } from '@/features/municipio/components/dashboard/MaterialDistributionChart';
import { RecyclingTrendChart } from '@/features/municipio/components/dashboard/RecyclingTrendChart';
import { OrganizationRankingChart } from '@/features/municipio/components/dashboard/OrganizationRankingChart';
import {
  listarEmpresas,
  listarEmpresasPendientes,
  listarUsuarios,
  obtenerEstadoContrato,
} from '../api';

// Panel de inicio del administrador: KPIs del sistema + gráficos de impacto,
// reusando el dashboard de municipio. Todo se deriva de endpoints existentes.
export function AdminOverviewPage() {
  const [aportes, setAportes] = useState<Aporte[] | null>(null);
  const [errorAportes, setErrorAportes] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [cooperativas, setCooperativas] = useState<Empresa[]>([]);
  const [pendientes, setPendientes] = useState<Empresa[]>([]);
  const [usuariosCount, setUsuariosCount] = useState<number | null>(null);
  const [contratoPausado, setContratoPausado] = useState<boolean | null>(null);

  function cargar() {
    setErrorAportes(false);
    setAportes(null);
    obtenerAportes()
      .then(setAportes)
      .catch(() => setErrorAportes(true));
    listarEmpresas('EMPRESA')
      .then(setEmpresas)
      .catch(() => undefined);
    listarEmpresas('COOPERATIVA')
      .then(setCooperativas)
      .catch(() => undefined);
    listarEmpresasPendientes()
      .then(setPendientes)
      .catch(() => undefined);
    listarUsuarios()
      .then((u) => setUsuariosCount(u.length))
      .catch(() => setUsuariosCount(null));
    obtenerEstadoContrato()
      .then((e) => setContratoPausado(e.pausado))
      .catch(() => setContratoPausado(null));
  }

  useEffect(() => {
    cargar();
  }, []);

  const d = useMemo(() => {
    const base = aportes ?? [];
    const materiales = [...new Set(base.map((a) => a.material))];
    return {
      color: coloresMateriales(materiales),
      materiales,
      resumen: resumir(base),
      material: porMaterial(base),
      mes: porMes(base),
      orgs: porOrganizacion(base),
    };
  }, [aportes]);

  const empresasActivas = empresas.filter(
    (e) => e.estado === 'APROBADA' && e.activa,
  ).length;
  const coopsActivas = cooperativas.filter((e) => e.activa).length;
  const enRevision = [...empresas, ...cooperativas].filter(
    (e) => e.estadoVerificacion === 'EN_REVISION',
  ).length;

  if (aportes === null && !errorAportes)
    return <LoadingState label="Cargando panel…" />;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-eco-ink">
            Panel de administración
          </h2>
          <p className="mt-0.5 text-sm text-eco-ink2">
            Resumen del sistema ECOToken: organizaciones, impacto y estado
            operativo.
          </p>
        </div>
        <CierreMesBadge />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Empresas activas"
          value={fmtNum(empresasActivas)}
          caption={`${empresas.length} en total`}
          icon={<Building2 size={16} />}
        />
        <MetricCard
          label="Pendientes de aprobar"
          value={fmtNum(pendientes.length)}
          caption="esperando revisión"
          icon={<Clock size={16} />}
        />
        <MetricCard
          label="Cooperativas"
          value={fmtNum(coopsActivas)}
          caption="validadoras activas"
          icon={<Recycle size={16} />}
        />
        <MetricCard
          label="Verificaciones en revisión"
          value={fmtNum(enRevision)}
          caption="KYB pendiente"
          icon={<BadgeCheck size={16} />}
        />
        <MetricCard
          label="Kg reciclados"
          value={fmtKg(d.resumen.kg)}
          caption="acumulado histórico"
          icon={<Scale size={16} />}
        />
        <MetricCard
          label="Tokens ECO"
          value={fmtNum(d.resumen.puntos)}
          caption="acuñados"
          icon={<Coins size={16} />}
        />
        <MetricCard
          label="Usuarios"
          value={usuariosCount === null ? '—' : fmtNum(usuariosCount)}
          caption="cuentas del sistema"
          icon={<Users size={16} />}
        />
        <MetricCard
          label="Contrato"
          value={
            contratoPausado === null ? (
              '—'
            ) : contratoPausado ? (
              <Badge color="danger">Pausado</Badge>
            ) : (
              <Badge color="org">Activo</Badge>
            )
          }
          caption="estado on-chain"
          icon={<ShieldCheck size={16} />}
        />
      </div>

      {errorAportes && (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-eco-ink2">
            No se pudieron cargar los datos de aportes.
          </p>
          <Button color="muni" variant="outline" onClick={cargar}>
            Reintentar
          </Button>
        </Card>
      )}

      {!errorAportes && (
        <>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <RecyclingTrendChart
                data={d.mes}
                materiales={d.materiales}
                color={d.color}
              />
            </div>
            <div className="xl:col-span-2">
              <MaterialDistributionChart data={d.material} color={d.color} />
            </div>
          </div>

          <OrganizationRankingChart data={d.orgs} onSelect={() => undefined} />
        </>
      )}
    </div>
  );
}
