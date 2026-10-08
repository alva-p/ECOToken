import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { cx } from '@/lib/cx';
import { useAuth } from '@/providers/AuthContext';
import { ROLE_HOME } from '@/lib/auth';
import {
  listarPeriodos,
  obtenerMiPosicion,
  obtenerRankingPublico,
  type MiPosicion as MiPosicionDatos,
  type PeriodoCerrado,
  type RankingPublico,
} from '../api';
import {
  cantidadEmpresas,
  etiquetaPeriodo,
  variacionVsMesAnterior,
} from '../periodo';
import { RankingPreview } from '../components/RankingPreview';
import { RankingEstadisticas } from '../components/RankingEstadisticas';
import { PerfilDestacado } from '../components/PerfilDestacado';
import { Transparencia } from '../components/Transparencia';
import { Badge } from '@/components/ui/Badge';
import { MiPosicion } from '../components/MiPosicion';
import { SubtituloSeccion } from '../components/SubtituloSeccion';

const POR_PAGINA = 10;

function Tendencia({ t, nuevo }: { t: number | null; nuevo: boolean }) {
  if (nuevo) return <Badge color="org">Nuevo</Badge>;
  if (!t) return <span className="text-eco-ink3">—</span>;
  const sube = t > 0;
  const Icono = sube ? ArrowUp : ArrowDown;
  return (
    <span
      className={cx(
        'inline-flex items-center gap-0.5 text-xs font-semibold',
        sube ? 'text-eco-org' : 'text-eco-coop',
      )}
    >
      <Icono aria-hidden size={12} />
      {Math.abs(t)}
    </span>
  );
}

const inputClass =
  'w-full rounded-lg border border-eco-border-strong bg-eco-surface px-3 py-2 text-sm text-eco-ink focus:outline-none focus:ring-2 focus:ring-eco-org/30 sm:w-auto';

const fechaLarga = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

/** Lee ?mes=&anio= de la URL; null si faltan o no son números. */
function periodoDeUrl(params: URLSearchParams) {
  const mes = Number(params.get('mes'));
  const anio = Number(params.get('anio'));
  return mes && anio ? { mes, anio } : null;
}

// Sección pública sin login (E7-HU03): ranking mensual cerrado con selector de
// mes e histórico. El período viaja en la URL (?mes=8&anio=2026) para poder
// compartir un mes puntual por redes o QR.
export function RankingContenido({ enPanel = false }: { enPanel?: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [periodos, setPeriodos] = useState<PeriodoCerrado[] | null>(null);
  const [ranking, setRanking] = useState<RankingPublico | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(0);
  const [mia, setMia] = useState<MiPosicionDatos | null>(null);
  const [miaError, setMiaError] = useState(false);

  const pedido = periodoDeUrl(searchParams);
  const ultimo = periodos?.[0];
  const objetivo = pedido ?? (ultimo && { mes: ultimo.mes, anio: ultimo.anio });

  useEffect(() => {
    listarPeriodos(24)
      .then(setPeriodos)
      .catch(() => setError('No se pudo cargar el ranking.'));
  }, []);

  const objetivoMes = objetivo?.mes;
  const objetivoAnio = objetivo?.anio;
  useEffect(() => {
    if (objetivoMes === undefined || objetivoAnio === undefined) return;
    let vigente = true;
    setRanking(null);
    setError(null);
    obtenerRankingPublico({ mes: objetivoMes, anio: objetivoAnio })
      .then((r) => vigente && setRanking(r))
      .catch(
        () =>
          vigente && setError('No se pudo cargar el ranking de este período.'),
      );
    return () => {
      vigente = false;
    };
  }, [objetivoMes, objetivoAnio]);

  // Solo en el panel de empresa: dónde está la empresa logueada en este período.
  useEffect(() => {
    if (!enPanel || objetivoMes === undefined || objetivoAnio === undefined) {
      return;
    }
    let vigente = true;
    setMia(null);
    setMiaError(false);
    obtenerMiPosicion({ mes: objetivoMes, anio: objetivoAnio })
      .then((r) => vigente && setMia(r))
      .catch(() => vigente && setMiaError(true)); // el ranking general se muestra igual
    return () => {
      vigente = false;
    };
  }, [enPanel, objetivoMes, objetivoAnio]);

  const filas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return (ranking?.data ?? []).filter((f) =>
      f.razonSocial.toLowerCase().includes(q),
    );
  }, [ranking, busqueda]);
  const paginas = Math.max(1, Math.ceil(filas.length / POR_PAGINA));
  const visibles = filas.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA);

  function elegirPeriodo(mes: number, anio: number) {
    setPagina(0);
    setSearchParams({ mes: String(mes), anio: String(anio) });
  }

  async function compartir() {
    if (!ranking) return;
    const url = `${window.location.origin}/ranking?mes=${ranking.mes}&anio=${ranking.anio}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Ranking público ECOToken', url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }
    } catch {
      // El usuario canceló el diálogo de compartir: no hay nada que informar.
    }
  }

  const variacion =
    ranking && periodos ? variacionVsMesAnterior(ranking, periodos) : null;
  const maxKg = Math.max(...(periodos ?? []).map((p) => p.totalKg), 1);

  return (
    <div
      className={cx(
        'flex flex-col gap-8',
        !enPanel && 'mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10',
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {ranking?.fechaCierre && (
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-eco-org-soft px-3 py-1 text-xs font-semibold text-eco-org">
              <span className="h-1.5 w-1.5 rounded-full bg-eco-org" />
              Datos verificados · Cierre del {fechaLarga(ranking.fechaCierre)}
            </span>
          )}
          {!enPanel && (
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ranking público de empresas que reciclan
            </h1>
          )}
          <p className="mt-2 max-w-2xl text-sm text-eco-ink2 sm:text-base">
            Conocé qué empresas están reciclando y generando impacto ambiental
            positivo en Villa María. Solo se muestran rankings ya cerrados y
            certificados.
          </p>
        </div>
        {periodos && periodos.length > 0 && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor="periodo">
              Mes del ranking
            </label>
            <select
              id="periodo"
              className={inputClass}
              value={objetivo ? `${objetivo.anio}-${objetivo.mes}` : ''}
              onChange={(e) => {
                const [anio, mes] = e.target.value.split('-').map(Number);
                elegirPeriodo(mes, anio);
              }}
            >
              {!periodos.some(
                (p) => p.mes === objetivo?.mes && p.anio === objetivo?.anio,
              ) &&
                objetivo && (
                  <option value={`${objetivo.anio}-${objetivo.mes}`}>
                    {etiquetaPeriodo(objetivo)}
                  </option>
                )}
              {periodos.map((p) => (
                <option key={`${p.anio}-${p.mes}`} value={`${p.anio}-${p.mes}`}>
                  {etiquetaPeriodo(p)}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              color="org"
              onClick={compartir}
              disabled={!ranking}
            >
              {copiado ? 'Enlace copiado' : 'Compartir'}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Card className="text-sm text-eco-danger" role="alert">
          {error}
        </Card>
      )}

      {!periodos && !error && <LoadingState label="Cargando ranking…" />}

      {periodos?.length === 0 && (
        <Card>
          <EmptyState label="Todavía no hay rankings cerrados. El primero se publica al terminar el mes." />
        </Card>
      )}

      {periodos && periodos.length > 0 && !ranking && !error && (
        <LoadingState label="Cargando ranking…" />
      )}

      {ranking && (
        <>
          {enPanel && miaError && (
            <Card className="text-sm text-eco-danger" role="alert">
              No pudimos cargar tu posición. Probá recargar la página.
            </Card>
          )}
          {enPanel && mia && (
            <>
              <MiPosicion datos={mia} periodo={etiquetaPeriodo(ranking)} />
              <div className="border-t border-eco-border pt-8">
                <SubtituloSeccion
                  titulo="Ranking general"
                  detalle={`Todas las empresas participantes en ${etiquetaPeriodo(ranking)}`}
                />
              </div>
            </>
          )}
          <RankingPreview
            periodo={etiquetaPeriodo(ranking)}
            titulo="Las empresas que más reciclaron"
            mostrarEnlace={false}
            summary={[
              {
                label: 'Material reciclado',
                value: `${ranking.totalKg.toLocaleString('es-AR')} kg`,
                sub:
                  variacion === null
                    ? `en ${etiquetaPeriodo(ranking)}`
                    : `${variacion > 0 ? '+' : ''}${variacion}% vs. mes anterior`,
              },
              {
                label: 'Empresas reconocidas',
                value: ranking.empresas.toLocaleString('es-AR'),
                sub: 'participaron del ranking',
              },
              {
                label: 'Puntos ECO',
                value: ranking.totalTokens.toLocaleString('es-AR'),
                sub: 'reconocidos en el mes',
              },
            ]}
            podium={ranking.data.slice(0, 3).map((f) => ({
              rank: f.posicion as 1 | 2 | 3,
              name: f.razonSocial,
              kg: f.kgReciclados,
              eco: f.tokens,
            }))}
          />

          <section>
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-eco-org">
                  Ranking completo
                </div>
                <h2 className="mt-1 text-xl font-bold tracking-tight">
                  {cantidadEmpresas(ranking.empresas)} participantes
                </h2>
              </div>
              <label className="relative block w-full sm:w-64">
                <span className="sr-only">Buscar empresa</span>
                <Search
                  aria-hidden
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-eco-ink2"
                />
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPagina(0);
                  }}
                  placeholder="Buscar empresa…"
                  className={cx(inputClass, 'pl-8 sm:w-full')}
                />
              </label>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[30rem]">
                <Table
                  columns={[
                    { label: 'Pos.', width: '3rem' },
                    { label: 'Empresa' },
                    { label: 'Kg', align: 'right', width: '5rem' },
                    { label: 'Puntos ECO', align: 'right', width: '6rem' },
                    { label: 'Certif.', align: 'right', width: '4rem' },
                    { label: 'Tendencia', align: 'right', width: '5rem' },
                  ]}
                  rows={visibles.map((f) => ({
                    cells: [
                      <span
                        key="p"
                        className={cx(
                          'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                          f.posicion === 1 && 'bg-[#C9A227] text-white',
                          f.posicion === 2 && 'bg-[#9AA3AA] text-white',
                          f.posicion === 3 && 'bg-[#B8742E] text-white',
                          f.posicion > 3 && 'text-eco-ink2',
                        )}
                      >
                        {f.posicion}
                      </span>,
                      <span key="e" className="font-medium">
                        {f.razonSocial}
                        {enPanel && mia?.posicion === f.posicion && (
                          <span className="ml-2 align-middle">
                            <Badge color="org">Vos</Badge>
                          </span>
                        )}
                      </span>,
                      f.kgReciclados.toLocaleString('es-AR'),
                      <span key="t" className="font-semibold">
                        {f.tokens.toLocaleString('es-AR')}
                      </span>,
                      f.certificados,
                      <Tendencia key="d" t={f.tendencia} nuevo={f.nuevo} />,
                    ],
                  }))}
                  emptyLabel={
                    busqueda
                      ? 'Ninguna empresa coincide con la búsqueda.'
                      : 'Este mes no hubo aportes registrados.'
                  }
                />
              </div>
            </div>
            {filas.length > POR_PAGINA && (
              <div className="mt-3 flex items-center justify-between text-xs text-eco-ink2">
                <span>
                  Mostrando {pagina * POR_PAGINA + 1}–
                  {pagina * POR_PAGINA + visibles.length} de {filas.length}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    color="org"
                    disabled={pagina === 0}
                    onClick={() => setPagina(pagina - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    color="org"
                    disabled={pagina >= paginas - 1}
                    onClick={() => setPagina(pagina + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </section>

          {ranking.data.length > 0 && (
            <RankingEstadisticas
              data={ranking.data}
              materiales={ranking.materiales}
              totalKg={ranking.totalKg}
              co2Evitado={ranking.co2Evitado}
              periodos={periodos ?? []}
              actual={ranking}
            />
          )}

          {ranking.lider && (
            <PerfilDestacado
              lider={ranking.lider}
              periodo={etiquetaPeriodo(ranking)}
            />
          )}

          {ranking.fechaCierre && (
            <p className="break-words text-xs text-eco-ink2">
              Ranking cerrado el {fechaLarga(ranking.fechaCierre)}
              {ranking.bloqueReferencia !== null &&
                ` · bloque de referencia ${ranking.bloqueReferencia.toLocaleString('es-AR')}`}
              {ranking.hashSnapshot && (
                <>
                  {' '}
                  · huella del snapshot{' '}
                  <span className="font-mono" title={ranking.hashSnapshot}>
                    {ranking.hashSnapshot.slice(0, 12)}…
                  </span>
                </>
              )}
            </p>
          )}
        </>
      )}

      {periodos && periodos.length > 1 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold">Histórico</h2>
          <Card className="flex flex-col gap-1 p-2">
            {periodos.map((p) => {
              const activo =
                p.mes === objetivo?.mes && p.anio === objetivo?.anio;
              return (
                <button
                  key={`${p.anio}-${p.mes}`}
                  type="button"
                  onClick={() => elegirPeriodo(p.mes, p.anio)}
                  aria-current={activo ? 'true' : undefined}
                  className={cx(
                    'flex flex-col gap-1.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-eco-bg sm:flex-row sm:items-center sm:gap-3',
                    activo && 'bg-eco-org-soft hover:bg-eco-org-soft',
                  )}
                >
                  <span className="text-sm font-semibold sm:w-36 sm:shrink-0">
                    {etiquetaPeriodo(p)}
                  </span>
                  <span
                    aria-hidden
                    className="h-2.5 flex-1 overflow-hidden rounded bg-eco-border"
                  >
                    <span
                      className="block h-full rounded bg-eco-org"
                      style={{ width: `${(p.totalKg / maxKg) * 100}%` }}
                    />
                  </span>
                  <span className="text-xs text-eco-ink2 sm:w-44 sm:shrink-0 sm:text-right">
                    <b className="text-eco-ink">
                      {p.totalKg.toLocaleString('es-AR')} kg
                    </b>{' '}
                    · {cantidadEmpresas(p.empresas)}
                  </span>
                </button>
              );
            })}
          </Card>
        </section>
      )}

      <Transparencia />
    </div>
  );
}

// Versión pública (landing): mismo contenido que el ranking del panel de
// empresa (/empresa/ranking), con su propio encabezado.
export function RankingPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-eco-bg text-eco-ink">
      <header className="border-b border-eco-border bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" aria-label="ECOToken, volver al inicio">
            <img
              src="/logos/logo-ecotoken.png"
              alt="ECOToken"
              className="h-9 w-auto"
            />
          </Link>
          <Link
            to={user ? ROLE_HOME[user.rol] : '/login'}
            className="text-sm font-semibold text-eco-org"
          >
            {user ? 'Ir a mi panel' : 'Iniciar sesión'}
          </Link>
        </div>
      </header>

      <RankingContenido />
    </div>
  );
}
