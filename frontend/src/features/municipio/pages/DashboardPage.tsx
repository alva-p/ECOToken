import { useEffect, useMemo, useState } from 'react';
import { Recycle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';
import { listarMateriales } from '@/features/empresa/api';
import { obtenerAportes } from '../api';
import {
  COMPARACIONES,
  coloresMateriales,
  comparacionMensual,
  enRango,
  filtrarDimensiones,
  fmtFecha,
  fmtKg,
  fmtNum,
  fmtPct,
  insights,
  nombreMaterial,
  porMaterial,
  porMes,
  porOrganizacion,
  rangoComparacion,
  resumir,
  sinAportesEnPeriodo,
  variacion,
  type Aporte,
  type Filtros,
  type ModoComparacion,
} from '../dashboard/data';
import { descargarCsv, descargarExcel } from '../dashboard/exportar';
import { Delta, Swatch } from '../components/dashboard/ChartCard';
import { MetricCard } from '../components/dashboard/MetricCard';
import { DashboardFilters } from '../components/dashboard/DashboardFilters';
import { RecyclingTrendChart } from '../components/dashboard/RecyclingTrendChart';
import { MaterialDistributionChart } from '../components/dashboard/MaterialDistributionChart';
import { MonthlyComparisonChart } from '../components/dashboard/MonthlyComparisonChart';
import { ParticipationChart } from '../components/dashboard/ParticipationChart';
import { MaterialEvolutionChart } from '../components/dashboard/MaterialEvolutionChart';
import { OrganizationRankingChart } from '../components/dashboard/OrganizationRankingChart';
import { OrganizationShareChart } from '../components/dashboard/OrganizationShareChart';
import { OrganizationMaterialChart } from '../components/dashboard/OrganizationMaterialChart';
import { MaterialHeatmap } from '../components/dashboard/MaterialHeatmap';
import {
  ActivityCard,
  DiversityCard,
  PeriodSummaryCard,
} from '../components/dashboard/SummaryCards';
import { EnvironmentalInsights } from '../components/dashboard/EnvironmentalInsights';
import { OrganizationsTable } from '../components/dashboard/OrganizationsTable';
import { OrganizationDetailDrawer } from '../components/dashboard/OrganizationDetailDrawer';

const SIN_FILTROS: Filtros = {
  desde: '',
  hasta: '',
  material: '',
  busqueda: '',
};

// Panel de Gestión Ambiental de la municipalidad (E9-HU02 ampliada): todas las
// métricas se derivan de los aportes reales (GET /reportes/ingresos) en
// dashboard/data.ts; acá solo se combinan filtros y se reparten a los bloques.
export function MunicipioDashboardPage() {
  const [todos, setTodos] = useState<Aporte[] | null>(null);
  const [error, setError] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>(SIN_FILTROS);
  const [modo, setModo] = useState<ModoComparacion>('mes');
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [catalogo, setCatalogo] = useState<string[]>([]);

  const cargar = () => {
    setError(false);
    setTodos(null);
    obtenerAportes()
      .then(setTodos)
      .catch(() => setError(true));
  };
  useEffect(cargar, []);
  useEffect(() => {
    listarMateriales()
      .then((m) => setCatalogo(m.map((x) => x.nombre)))
      .catch(() => setCatalogo([]));
  }, []);

  const d = useMemo(() => {
    const base = todos ?? [];
    const { desde, hasta } = filtros;
    const color = coloresMateriales([
      ...catalogo,
      ...base.map((a) => a.material),
    ]);
    const materialesTodos = [...new Set(base.map((a) => a.material))].sort();
    const dims = filtrarDimensiones(base, filtros);
    const periodo = dims.filter((a) => enRango(a, desde, hasta));
    const rango = rangoComparacion(desde, hasta, modo);
    const previo = rango
      ? dims.filter((a) => enRango(a, rango.desde, rango.hasta))
      : [];
    const materiales = porMaterial(periodo);
    const organizaciones = porOrganizacion(periodo);
    const comparacion = comparacionMensual(periodo, dims);
    // Detalle y ranking ignoran la búsqueda: la posición es contra todas las organizaciones.
    const sinBusqueda = filtrarDimensiones(base, {
      ...filtros,
      busqueda: '',
    }).filter((a) => enRango(a, desde, hasta));
    return {
      color,
      materialesTodos,
      dims,
      periodo,
      previo,
      materiales,
      materialesPeriodo: materialesTodos.filter((m) =>
        materiales.some((x) => x.material === m),
      ),
      organizaciones,
      meses: porMes(periodo, desde, hasta),
      comparacion,
      resumen: resumir(periodo),
      resumenPrevio: previo.length ? resumir(previo) : null,
      puedeComparar: !!desde && dims.some((a) => a.fecha.slice(0, 10) < desde),
      sinAportes: sinAportesEnPeriodo(dims, periodo, desde),
      insights: insights(materiales, organizaciones, comparacion),
      sinBusqueda,
      rankingGeneral: porOrganizacion(sinBusqueda),
      nombres: [...new Set(base.map((a) => a.organizacion))].sort(),
    };
  }, [todos, filtros, modo, catalogo]);

  const toggleMaterial = (material: string) =>
    setFiltros((f) => ({
      ...f,
      material: f.material === material ? '' : material,
    }));

  const seleccionada = d.rankingGeneral.find((o) => o.id === seleccion) ?? null;
  const etiquetaComp = COMPARACIONES[modo].toLowerCase();
  const principal = d.materiales[0];

  return (
    <div className="flex flex-col gap-5">
      <DashboardFilters
        filtros={filtros}
        onChange={setFiltros}
        materiales={d.materialesTodos}
        organizaciones={d.nombres}
        comparacion={modo}
        onComparacion={setModo}
        puedeComparar={d.puedeComparar}
        onExportCsv={() => descargarCsv(d.periodo, filtros)}
        onExportExcel={() => descargarExcel(d.periodo, filtros)}
        exportDisabled={d.periodo.length === 0}
      />

      <div>
        <p className="text-sm text-eco-ink2">
          Seguimiento del reciclaje registrado por las organizaciones
          participantes de EcoToken.
        </p>
        <p className="hidden text-xs text-eco-ink2 print:block">
          Período: {filtros.desde ? fmtFecha(filtros.desde) : 'inicio'} –{' '}
          {filtros.hasta ? fmtFecha(filtros.hasta) : 'hoy'}
          {filtros.material &&
            ` · Material: ${nombreMaterial(filtros.material)}`}
          {filtros.busqueda && ` · Organización: ${filtros.busqueda}`}
        </p>
      </div>

      {error ? (
        <Card className="flex flex-col items-center gap-3 py-10 text-center text-sm text-eco-ink2">
          No se pudieron cargar los aportes registrados.
          <Button type="button" variant="outline" color="org" onClick={cargar}>
            Reintentar
          </Button>
        </Card>
      ) : !todos ? (
        <LoadingState label="Cargando datos de reciclaje…" />
      ) : todos.length === 0 ? (
        <Card className="py-10 text-center text-sm text-eco-ink2">
          Todavía no hay aportes registrados en la plataforma.
        </Card>
      ) : (
        <>
          {filtros.busqueda && d.organizaciones.length === 1 && (
            <button
              type="button"
              onClick={() => setSeleccion(d.organizaciones[0].id)}
              className="self-start rounded-full bg-eco-org-soft px-3 py-1.5 text-xs font-semibold text-eco-org hover:bg-eco-org hover:text-white print:hidden"
            >
              Ver detalle de {d.organizaciones[0].nombre} →
            </button>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              label="Organizaciones participantes"
              value={fmtNum(d.resumen.organizaciones)}
              caption="Organizaciones con aportes"
              footer={
                d.resumenPrevio &&
                d.resumen.organizaciones !== d.resumenPrevio.organizaciones && (
                  <span className="font-semibold text-eco-ink2">
                    {d.resumen.organizaciones > d.resumenPrevio.organizaciones
                      ? '↑ +'
                      : '↓ −'}
                    {Math.abs(
                      d.resumen.organizaciones - d.resumenPrevio.organizaciones,
                    )}{' '}
                    respecto al {etiquetaComp}
                  </span>
                )
              }
            />
            <MetricCard
              label="Material recuperado"
              value={fmtKg(d.resumen.kg)}
              caption="Total reciclado"
              footer={
                d.resumenPrevio && (
                  <Delta
                    value={variacion(d.resumen.kg, d.resumenPrevio.kg)}
                    suffix={`vs. ${etiquetaComp}`}
                  />
                )
              }
            />
            <MetricCard
              label="Aportes registrados"
              value={fmtNum(d.resumen.aportes)}
              caption={
                d.resumen.aportes
                  ? `${fmtKg(d.resumen.kg / d.resumen.aportes)} promedio por aporte`
                  : undefined
              }
              footer={
                d.resumenPrevio && (
                  <Delta
                    value={variacion(
                      d.resumen.aportes,
                      d.resumenPrevio.aportes,
                    )}
                    suffix={`vs. ${etiquetaComp}`}
                  />
                )
              }
            />
            <MetricCard
              label="Puntos ECO reconocidos"
              value={fmtNum(d.resumen.puntos)}
              caption="Reconocimiento ambiental otorgado"
            />
            <MetricCard
              label="Material principal"
              icon={<Recycle size={16} aria-hidden />}
              value={
                principal ? (
                  <span className="flex items-center gap-2">
                    <Swatch color={d.color(principal.material)} />
                    {nombreMaterial(principal.material)}
                  </span>
                ) : (
                  '—'
                )
              }
              caption={
                principal
                  ? `${fmtKg(principal.kg)} · ${fmtPct(principal.pct)} del total`
                  : undefined
              }
            />
          </div>

          {d.periodo.length === 0 ? (
            <Card className="py-10 text-center text-sm text-eco-ink2">
              No hay aportes registrados para los filtros seleccionados.
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <RecyclingTrendChart
                    data={d.meses}
                    materiales={d.materialesPeriodo}
                    color={d.color}
                  />
                </div>
                <div className="lg:col-span-2">
                  <MaterialDistributionChart
                    data={d.materiales}
                    color={d.color}
                    seleccionado={filtros.material}
                    onSelect={toggleMaterial}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <MonthlyComparisonChart data={d.comparacion} color={d.color} />
                <ParticipationChart data={d.meses} />
              </div>

              <MaterialEvolutionChart
                data={d.meses}
                materiales={d.materialesPeriodo}
                color={d.color}
              />

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <OrganizationRankingChart
                  data={d.organizaciones}
                  onSelect={setSeleccion}
                />
                <OrganizationShareChart
                  data={d.organizaciones}
                  onSelect={setSeleccion}
                />
              </div>

              <OrganizationMaterialChart
                data={d.organizaciones}
                materiales={d.materialesPeriodo}
                color={d.color}
                onSelect={setSeleccion}
              />

              <MaterialHeatmap
                data={d.organizaciones}
                materiales={d.materialesPeriodo}
                color={d.color}
                onSelect={setSeleccion}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <PeriodSummaryCard data={d.comparacion} />
                <DiversityCard materiales={d.materiales} color={d.color} />
                <ActivityCard
                  activas={d.resumen.organizaciones}
                  sinAportes={d.sinAportes}
                  referencia={filtros.desde || null}
                  onSelect={setSeleccion}
                />
              </div>

              <EnvironmentalInsights items={d.insights} />

              <OrganizationsTable
                data={d.organizaciones}
                onSelect={setSeleccion}
              />
            </>
          )}
        </>
      )}

      <OrganizationDetailDrawer
        organizacion={seleccionada}
        aportes={d.sinBusqueda.filter((a) => a.organizacionId === seleccion)}
        posicion={d.rankingGeneral.findIndex((o) => o.id === seleccion) + 1}
        totalOrganizaciones={d.rankingGeneral.length}
        desde={filtros.desde}
        hasta={filtros.hasta}
        color={d.color}
        onClose={() => setSeleccion(null)}
      />
    </div>
  );
}
