import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  coloresMateriales,
  etiquetaMes,
  porMaterial,
} from '@/features/municipio/dashboard/data';
import { Skeleton } from '@/features/municipio/components/dashboard/ChartCard';
import { MaterialDistributionChart } from '@/features/municipio/components/dashboard/MaterialDistributionChart';
import { OrganizationMaterialChart } from '@/features/municipio/components/dashboard/OrganizationMaterialChart';
import { EnvironmentalInsights } from '@/features/municipio/components/dashboard/EnvironmentalInsights';
import { MaterialMixChart } from '@/features/empresa/components/dashboard/Charts';
import { materialesPorMes } from '@/features/empresa/dashboard/data';
import type { TipoMaterial } from '@/types';
import {
  listarMateriales,
  miCooperativa,
  misEntregas,
  type EntregaHistorial,
  type MiCooperativa,
} from '../api';
import {
  aAportes,
  actividadDiaria,
  calendario,
  comparar,
  delDia,
  delMes,
  entregasDeLaSemana,
  evolucion,
  hoyArt,
  insightsOperativos,
  organizaciones,
  resumir,
  type OrdenOrganizaciones,
} from '../dashboard/data';
import { RegistrarEntregaForm } from '../components/RegistrarEntregaForm';
import {
  DeliveriesCard,
  MainMaterialCard,
  MonthVolumeCard,
  MonthlyCloseSummary,
  OrganizationsCountCard,
  RecentDeliveries,
  TodayCard,
  ValidatorStatus,
} from '../components/dashboard/OperationCards';
import {
  DailyActivityChart,
  DeliveryHeatmap,
  MonthComparisonCard,
  MonthlyVolumeChart,
  OrganizationsCard,
} from '../components/dashboard/OperationCharts';

// Un año de entregas alcanza para la evolución de 6 meses y la comparación.
const DIAS_HISTORIA = 366;

// Panel Operativo de la cooperativa (E5-HU01 ampliada): registrar una entrega
// sigue siendo la acción principal, rodeada de la información de la operación.
// Las métricas salen de GET /ingresos/mis-entregas y se calculan en
// dashboard/data.ts (en hora argentina).
export function CooperativaDashboardPage() {
  const [entregas, setEntregas] = useState<EntregaHistorial[] | null>(null);
  const [error, setError] = useState(false);
  const [materiales, setMateriales] = useState<TipoMaterial[]>([]);
  const [coop, setCoop] = useState<MiCooperativa | null>(null);
  const [orden, setOrden] = useState<OrdenOrganizaciones>('kg');

  const cargar = useCallback(() => {
    setError(false);
    misEntregas(DIAS_HISTORIA)
      .then(setEntregas)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    cargar();
    listarMateriales()
      .then(setMateriales)
      .catch(() => setMateriales([]));
    miCooperativa()
      .then(setCoop)
      .catch(() => setCoop(null));
  }, [cargar]);

  const d = useMemo(() => {
    const base = aAportes(entregas ?? []);
    const hoy = hoyArt();
    const mes = hoy.slice(0, 7);
    const color = coloresMateriales([
      ...materiales.map((m) => m.nombre),
      ...base.map((a) => a.material),
    ]);
    const c = comparar(base, hoy);
    const delMesActual = delMes(base, mes);
    const materialesMes = porMaterial(delMesActual);
    const mezcla = materialesPorMes(
      base.map((a) => ({ ...a, peso: a.kg, tokens: a.puntos })),
      6,
      hoy,
    );
    // Fechas ya en hora argentina (fmtFecha formatea en UTC sin correrlas).
    const ultima = new Map<string, string>();
    for (const a of base) {
      const prev = ultima.get(a.organizacionId);
      if (!prev || a.fecha > prev) ultima.set(a.organizacionId, a.fecha);
    }
    return {
      hoy,
      mes,
      color,
      c,
      resumenHoy: resumir(delDia(base, hoy)),
      resumenMes: resumir(delMesActual),
      materialesMes,
      evolucion: evolucion(base, 6, hoy),
      diario: actividadDiaria(base, hoy),
      delMesActual,
      mezcla,
      enMezcla: [
        ...new Set(
          mezcla.flatMap((f) => Object.keys(f).filter((k) => k !== 'mes')),
        ),
      ].sort(),
      semanas: calendario(base, 12, hoy),
      insights: insightsOperativos(
        c,
        delMesActual,
        entregasDeLaSemana(base, hoy),
      ),
      ultima,
      ultimaEntrega: base.reduce<string | null>(
        (max, a) => (max === null || a.fecha > max ? a.fecha : max),
        null,
      ),
      recientes: (entregas ?? []).slice(0, 8),
    };
  }, [entregas, materiales]);

  const orgsMes = useMemo(
    () => organizaciones(d.delMesActual, orden),
    [d.delMesActual, orden],
  );

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-eco-ink">
            {coop?.razonSocial ?? 'Tu cooperativa'}
          </h2>
          <p className="mt-0.5 text-sm text-eco-ink2">
            Recepción, validación y trazabilidad de materiales reciclables.
          </p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-eco-ink2">
          Actividad de {etiquetaMes(d.mes, true).toLowerCase()}
        </span>
      </div>

      {error ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-sm text-eco-ink2">
            No se pudieron cargar tus entregas.
          </p>
          <Button color="coop" variant="outline" onClick={cargar}>
            Reintentar
          </Button>
        </Card>
      ) : entregas === null ? (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6"
          aria-busy
        >
          <Skeleton className="h-32 sm:col-span-2" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <TodayCard hoy={d.resumenHoy} />
          <MonthVolumeCard c={d.c} />
          <DeliveriesCard c={d.c} />
          <OrganizationsCountCard c={d.c} />
          <MainMaterialCard
            material={d.materialesMes[0] ?? null}
            color={d.color}
          />
        </div>
      )}

      {/* Acción principal: se puede registrar aunque las métricas no hayan cargado. */}
      <RegistrarEntregaForm
        materiales={materiales}
        color={d.color}
        ultimaEntrega={(id) => d.ultima.get(id) ?? null}
        onRegistrado={cargar}
      />

      {entregas && (
        <>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <MonthlyVolumeChart data={d.evolucion} />
            </div>
            <div className="xl:col-span-2">
              <MaterialDistributionChart
                title="Materiales recibidos este mes"
                question="Composición del material que registraste."
                data={d.materialesMes}
                color={d.color}
                vacio="Todavía no registraste entregas este mes."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <DailyActivityChart data={d.diario} hoy={d.hoy} />
            </div>
            <div className="xl:col-span-2">
              <MonthComparisonCard c={d.c} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <OrganizationMaterialChart
              title="¿Qué recibís de cada organización?"
              question="Kg por material de cada organización este mes."
              data={orgsMes}
              materiales={d.enMezcla}
              color={d.color}
            />
            <MaterialMixChart
              title="Evolución por material"
              question="Kg recibidos por material en cada mes."
              vacio="Todavía no registraste entregas en los últimos meses."
              data={d.mezcla}
              materiales={d.enMezcla}
              color={d.color}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <OrganizationsCard
              data={orgsMes}
              orden={orden}
              onOrden={setOrden}
              totalKg={d.resumenMes.kg}
            />
            <DeliveryHeatmap
              semanas={d.semanas}
              ultimaEntrega={d.ultimaEntrega}
            />
          </div>

          <EnvironmentalInsights items={d.insights} />

          <RecentDeliveries entregas={d.recientes} color={d.color} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <MonthlyCloseSummary mes={d.resumenMes} />
            <ValidatorStatus coop={coop} mes={d.resumenMes} />
          </div>
        </>
      )}
    </div>
  );
}
