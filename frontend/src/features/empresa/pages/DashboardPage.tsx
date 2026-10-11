import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { aHoraArgentina } from '@/lib/fecha';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import {
  listarPeriodos,
  obtenerMiPosicion,
  type MiPosicion,
  type PeriodoCerrado,
} from '@/features/ranking/api';
import {
  misCertificados,
  type MiCertificado,
} from '@/features/certificados/api';
import {
  coloresMateriales,
  etiquetaMes,
  fmtFecha,
  fmtKg,
  fmtNum,
  nombreMaterial,
} from '@/features/municipio/dashboard/data';
import {
  Segmented,
  Skeleton,
  Swatch,
} from '@/features/municipio/components/dashboard/ChartCard';
import { MaterialDistributionChart } from '@/features/municipio/components/dashboard/MaterialDistributionChart';
import { EnvironmentalInsights } from '@/features/municipio/components/dashboard/EnvironmentalInsights';
import {
  beneficiosOrganizacion,
  listarMateriales,
  miSaldo,
  misAportes,
  type BeneficiosOrganizacion,
  type MiSaldo,
} from '../api';
import {
  acumuladoDiario,
  alcanza,
  compararConMesAnterior,
  diasDesde,
  evolucionMensual,
  materialesPorMes,
  mesDe,
  porMaterial,
  porSemana,
  ultimoMesConAportes,
  insightsOrganizacion,
  type AporteOrg,
} from '../dashboard/data';
import {
  ContributionsSummaryCard,
  EcoBalanceCard,
  Etapa,
  MainMaterialCard,
  MonthlyImpactCard,
  RankingSummaryCard,
} from '../components/dashboard/KpiCards';
import {
  CurrentMonthProgressChart,
  MaterialMixChart,
  MonthlyEvolutionChart,
} from '../components/dashboard/Charts';
import {
  FrequencyCard,
  MonthSummaryCard,
} from '../components/dashboard/MonthCards';
import {
  CertificateSummary,
  EnvironmentalImpactCard,
  RecognitionCard,
  TraceabilitySummary,
} from '../components/dashboard/RecognitionCards';
import { BenefitsSection } from '../components/Benefits';

const POLL_SALDO_MS = 30_000;
// ponytail: el historial completo entra en una página de 500 (tope del
// endpoint); si una organización lo supera, sumar un endpoint de agregados.
const LIMITE_APORTES = 500;

type PeriodoMateriales = 'mes' | 'anterior' | '6m';

// Panel de Impacto Ambiental de la organización (E11-HU05 ampliada). Resume
// lo que reciclaste, tu reconocimiento, beneficios y trazabilidad; el detalle
// sigue en Historial, Ranking, Certificados y Beneficios. Todo sale de
// endpoints existentes y se calcula en dashboard/data.ts.
export function EmpresaDashboardPage() {
  const [aportes, setAportes] = useState<AporteOrg[] | null>(null);
  const [errorAportes, setErrorAportes] = useState(false);
  const [saldo, setSaldo] = useState<MiSaldo | null>(null);
  const [sinConexion, setSinConexion] = useState(false);
  // undefined = cargando, null = no hay rankings cerrados (o falló).
  const [posicion, setPosicion] = useState<MiPosicion | null | undefined>();
  const [cierre, setCierre] = useState<PeriodoCerrado | null>(null);
  // undefined = cargando, null = error.
  const [certificados, setCertificados] = useState<
    MiCertificado[] | null | undefined
  >();
  const [beneficios, setBeneficios] = useState<BeneficiosOrganizacion | null>(
    null,
  );
  const [errorBeneficios, setErrorBeneficios] = useState(false);
  const [catalogo, setCatalogo] = useState<string[]>([]);
  const [periodoMat, setPeriodoMat] = useState<PeriodoMateriales | null>(null);

  const cargarAportes = useCallback(() => {
    setErrorAportes(false);
    setAportes(null);
    misAportes({ limit: LIMITE_APORTES })
      // Fechas en hora argentina para agrupar por día/mes (ver lib/fecha.ts).
      .then((r) =>
        setAportes(
          r.data.map((a) => ({ ...a, fecha: aHoraArgentina(a.fecha) })),
        ),
      )
      .catch(() => setErrorAportes(true));
  }, []);

  const cargarBeneficios = useCallback(() => {
    beneficiosOrganizacion()
      .then((b) => {
        setBeneficios(b);
        setErrorBeneficios(false);
      })
      .catch(() => setErrorBeneficios(true));
  }, []);

  useEffect(() => {
    cargarAportes();
    cargarBeneficios();
    obtenerMiPosicion()
      .then(setPosicion)
      .catch(() => setPosicion(null));
    listarPeriodos(1)
      .then(([p]) => setCierre(p ?? null))
      .catch(() => setCierre(null));
    misCertificados()
      .then(setCertificados)
      .catch(() => setCertificados(null));
    listarMateriales()
      .then((m) => setCatalogo(m.map((x) => x.nombre)))
      .catch(() => setCatalogo([]));
  }, [cargarAportes, cargarBeneficios]);

  // Saldo en tiempo real (on-chain), como el panel anterior.
  useEffect(() => {
    let cancelado = false;
    const cargar = () =>
      miSaldo()
        .then((s) => {
          if (cancelado) return;
          setSaldo(s);
          setSinConexion(false);
        })
        .catch(() => !cancelado && setSinConexion(true));
    cargar();
    const t = setInterval(cargar, POLL_SALDO_MS);
    return () => {
      cancelado = true;
      clearInterval(t);
    };
  }, []);

  const d = useMemo(() => {
    const base = aportes ?? [];
    const color = coloresMateriales([
      ...catalogo,
      ...base.map((a) => a.material),
    ]);
    const comparacion = compararConMesAnterior(base);
    const { mes, previo } = comparacion;
    const evolucion = evolucionMensual(base, 6);
    const ultimoMes = ultimoMesConAportes(base);
    const delMes = (m: string) => base.filter((a) => mesDe(a) === m);
    const materialesMes = porMaterial(delMes(mes));
    const principalMes = materialesMes.length ? mes : ultimoMes;
    const principal = principalMes
      ? porMaterial(delMes(principalMes))[0]
      : null;
    const mezcla = materialesPorMes(base, 6);
    const enMezcla = [
      ...new Set(
        mezcla.flatMap((f) => Object.keys(f).filter((k) => k !== 'mes')),
      ),
    ].sort();
    const ultimo = base.reduce<string | null>(
      (max, a) => (max === null || a.fecha > max ? a.fecha : max),
      null,
    );
    return {
      color,
      comparacion,
      evolucion,
      materialesPorPeriodo: {
        mes: materialesMes,
        anterior: porMaterial(delMes(previo)),
        '6m': porMaterial(base.filter((a) => mesDe(a) >= evolucion[0].mes)),
      } as Record<PeriodoMateriales, ReturnType<typeof porMaterial>>,
      principal,
      principalMes,
      acumulado: acumuladoDiario(base),
      mezcla,
      enMezcla,
      semanas: {
        actual: porSemana(base, mes),
        anterior: porSemana(base, previo),
      },
      ultimoAporte: ultimo ? diasDesde(ultimo) : null,
      mesesActivos: evolucion.filter((p) => p.aportes > 0).length,
      kgTotal: base.reduce((s, a) => s + a.peso, 0),
      recientes: [...base]
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
        .slice(0, 5),
    };
  }, [aportes, catalogo]);

  // Período del donut: el mes en curso si ya tiene aportes; si no, el anterior.
  const periodoMateriales: PeriodoMateriales =
    periodoMat ??
    (d.materialesPorPeriodo.mes.length
      ? 'mes'
      : d.materialesPorPeriodo.anterior.length
        ? 'anterior'
        : '6m');

  const alcanzables = beneficios
    ? beneficios.beneficios.filter((b) => alcanza(b, beneficios.disponible))
        .length
    : 0;
  const insights = insightsOrganizacion({
    comparacion: d.comparacion,
    materiales: d.materialesPorPeriodo[periodoMateriales],
    posicion: posicion ?? null,
    beneficiosAlcanzables: alcanzables,
  });

  const { mes, previo } = d.comparacion;
  const nombreMes = (m: string) => etiquetaMes(m, true).split(' ')[0];

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      {/* Encabezado: organización y mes en curso */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-eco-ink">
            {saldo?.razonSocial ?? 'Tu organización'}
          </h2>
          <p className="mt-0.5 text-sm text-eco-ink2">
            Seguimiento de tus aportes, reconocimiento ambiental y evolución en
            EcoToken.
          </p>
        </div>
        <Etapa>{etiquetaMes(mes, true)} · mes en curso</Etapa>
      </div>

      {errorAportes ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-sm text-eco-ink2">
            No se pudieron cargar tus aportes.
          </p>
          <Button color="org" variant="outline" onClick={cargarAportes}>
            Reintentar
          </Button>
        </Card>
      ) : aportes === null ? (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6"
          aria-busy
        >
          <Skeleton className="h-36 sm:col-span-2" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
          <Skeleton className="h-80 sm:col-span-2 xl:col-span-4" />
          <Skeleton className="h-80 sm:col-span-2" />
        </div>
      ) : (
        <>
          {/* Impacto del mes */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <MonthlyImpactCard c={d.comparacion} />
            <EcoBalanceCard
              saldo={saldo?.saldo ?? null}
              reservado={beneficios?.reservado ?? 0}
              sinConexion={sinConexion}
            />
            <RankingSummaryCard posicion={posicion} />
            <ContributionsSummaryCard c={d.comparacion} />
            <MainMaterialCard
              material={d.principal}
              mes={d.principalMes}
              color={d.color}
            />
          </div>

          {/* Evolución y materiales */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <MonthlyEvolutionChart data={d.evolucion} />
            </div>
            <div className="xl:col-span-2">
              <MaterialDistributionChart
                title="Tus materiales"
                question="Composición de lo que reciclaste en el período."
                data={d.materialesPorPeriodo[periodoMateriales]}
                color={d.color}
                vacio="Sin aportes en este período."
                actions={
                  <Segmented
                    label="Período de materiales"
                    value={periodoMateriales}
                    onChange={setPeriodoMat}
                    options={{
                      mes: nombreMes(mes),
                      anterior: nombreMes(previo),
                      '6m': '6 meses',
                    }}
                  />
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <CurrentMonthProgressChart
                data={d.acumulado}
                mes={mes}
                previo={previo}
              />
            </div>
            <div className="xl:col-span-2">
              <MonthSummaryCard c={d.comparacion} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <MaterialMixChart
                data={d.mezcla}
                materiales={d.enMezcla}
                color={d.color}
              />
            </div>
            <div className="xl:col-span-2">
              <FrequencyCard
                actual={d.semanas.actual}
                anterior={d.semanas.anterior}
                mes={mes}
                previo={previo}
                ultimoAporte={d.ultimoAporte}
                mesesActivos={d.mesesActivos}
              />
            </div>
          </div>

          {/* Reconocimiento e impacto */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RecognitionCard posicion={posicion} cierre={cierre} />
            <EnvironmentalImpactCard
              kgRegistrados={d.kgTotal}
              aportes={aportes.length}
              certificados={certificados}
            />
          </div>

          <BenefitsSection
            datos={beneficios}
            error={errorBeneficios}
            onCambio={cargarBeneficios}
          />

          <EnvironmentalInsights items={insights} />

          {/* Últimos aportes */}
          <Card className="p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-eco-ink">
                  Últimos aportes
                </h2>
                <p className="mt-0.5 text-xs text-eco-ink2">
                  Tus 5 entregas más recientes, con su comprobante digital.
                </p>
              </div>
              <Link
                to="/empresa/aportes"
                className="text-xs font-semibold text-eco-org hover:underline"
              >
                Ver historial completo →
              </Link>
            </div>
            <Table
              columns={[
                { label: 'Fecha' },
                { label: 'Material' },
                { label: 'Peso', align: 'right' },
                { label: 'ECO', align: 'right' },
                { label: 'Comprobante', align: 'right' },
              ]}
              rows={d.recientes.map((a) => ({
                cells: [
                  fmtFecha(a.fecha),
                  <span key="m" className="inline-flex items-center gap-2">
                    <Swatch color={d.color(a.material)} />
                    {nombreMaterial(a.material)}
                  </span>,
                  fmtKg(a.peso),
                  fmtNum(a.tokens),
                  <Link
                    key="c"
                    to={`/empresa/aportes/${a.id}`}
                    className="font-semibold text-eco-org hover:underline"
                  >
                    Ver comprobante
                  </Link>,
                ],
              }))}
              emptyLabel="Todavía no registraste aportes."
            />
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CertificateSummary certificados={certificados} />
            <TraceabilitySummary wallet={saldo?.walletAddress ?? null} />
          </div>
        </>
      )}
    </div>
  );
}
