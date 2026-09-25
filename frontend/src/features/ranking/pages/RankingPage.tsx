import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { cx } from '@/lib/cx';
import {
  listarPeriodos,
  obtenerRankingPublico,
  type PeriodoCerrado,
  type RankingPublico,
} from '../api';
import {
  cantidadEmpresas,
  etiquetaPeriodo,
  variacionVsMesAnterior,
} from '../periodo';
import { RankingPreview } from '../components/RankingPreview';

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
export function RankingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [periodos, setPeriodos] = useState<PeriodoCerrado[] | null>(null);
  const [ranking, setRanking] = useState<RankingPublico | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

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

  function elegirPeriodo(mes: number, anio: number) {
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
          <Link to="/login" className="text-sm font-semibold text-eco-org">
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ranking público
            </h1>
            <p className="mt-1 max-w-xl text-sm text-eco-ink2">
              Las empresas reconocidas cada mes por su aporte ambiental. Solo se
              muestran rankings ya cerrados.
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
                  <option
                    key={`${p.anio}-${p.mes}`}
                    value={`${p.anio}-${p.mes}`}
                  >
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
              <h2 className="mb-3 text-sm font-semibold">
                Ranking completo · {etiquetaPeriodo(ranking)}
              </h2>
              <Table
                columns={[
                  { label: '#', width: '2.5rem' },
                  { label: 'Empresa' },
                  { label: 'Kg', align: 'right', width: '5rem' },
                  { label: 'Puntos ECO', align: 'right', width: '6rem' },
                ]}
                rows={ranking.data.map((f) => ({
                  cells: [
                    <span key="p" className="font-semibold text-eco-ink2">
                      {f.posicion}
                    </span>,
                    <span key="e" className="font-medium">
                      {f.razonSocial}
                    </span>,
                    f.kgReciclados.toLocaleString('es-AR'),
                    <span key="t" className="font-semibold">
                      {f.tokens.toLocaleString('es-AR')}
                    </span>,
                  ],
                }))}
                emptyLabel="Este mes no hubo aportes registrados."
              />
            </section>

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
      </main>
    </div>
  );
}
