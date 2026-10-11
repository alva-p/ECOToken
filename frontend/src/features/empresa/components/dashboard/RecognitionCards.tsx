import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Download,
  Leaf,
  Recycle,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { addressLink } from '@/lib/explorer';
import { cx } from '@/lib/cx';
import type { MiPosicion, PeriodoCerrado } from '@/features/ranking/api';
import {
  descargarCertificadoPdf,
  type MiCertificado,
} from '@/features/certificados/api';
import {
  etiquetaMes,
  fmtKg,
  fmtNum,
  fmtPct,
} from '@/features/municipio/dashboard/data';
import {
  ChartCard,
  SinDatos,
} from '@/features/municipio/components/dashboard/ChartCard';
import { Etapa } from './KpiCards';

const periodo = (mes: number, anio: number, larga = true) =>
  etiquetaMes(`${anio}-${String(mes).padStart(2, '0')}`, larga);

function CtaLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="text-xs font-semibold text-eco-org hover:underline"
    >
      {children}
    </Link>
  );
}

function textoTendencia(p: MiPosicion) {
  if (p.nuevo) return 'Primera participación en el ranking';
  if (p.tendencia === null) return null;
  if (p.tendencia === 0) return 'Mantuviste tu posición';
  const n = Math.abs(p.tendencia);
  return `${p.tendencia > 0 ? 'Subiste' : 'Bajaste'} ${n} ${n === 1 ? 'puesto' : 'puestos'} vs. el mes anterior`;
}

/** Tu reconocimiento: solo datos del último ranking cerrado (nunca una posición provisional). */
export function RecognitionCard({
  posicion,
  cierre,
}: {
  posicion: MiPosicion | null | undefined;
  cierre: PeriodoCerrado | null;
}) {
  return (
    <ChartCard
      title="Tu reconocimiento"
      question="Posición oficial del último ranking mensual cerrado."
      actions={<Etapa cerrado>Último mes cerrado</Etapa>}
    >
      {posicion === undefined ? (
        <SinDatos label="Cargando…" />
      ) : posicion === null ? (
        <SinDatos label="Todavía no hay rankings cerrados. El primero se calcula al cierre de mes." />
      ) : (
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-eco-org-soft text-eco-org">
              <Trophy size={28} aria-hidden />
            </span>
            <div>
              <div className="text-4xl font-bold tracking-tight text-eco-ink">
                {posicion.posicion ? `#${posicion.posicion}` : 'Sin posición'}
              </div>
              <div className="text-xs text-eco-ink2">
                {periodo(posicion.mes, posicion.anio)} · de{' '}
                {fmtNum(posicion.totalEmpresas)} organizaciones
              </div>
            </div>
          </div>

          {posicion.participa ? (
            <>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-eco-bg p-3">
                  <dt className="text-xs text-eco-ink2">Kg del ranking</dt>
                  <dd className="font-semibold text-eco-ink">
                    {fmtKg(posicion.kgReciclados)}
                  </dd>
                </div>
                <div className="rounded-lg bg-eco-bg p-3">
                  <dt className="text-xs text-eco-ink2">ECO del período</dt>
                  <dd className="font-semibold text-eco-ink">
                    {fmtNum(posicion.tokens)} ECO
                  </dd>
                </div>
              </dl>
              <ul className="flex flex-col gap-1 text-sm text-eco-ink">
                {textoTendencia(posicion) && (
                  <li>{textoTendencia(posicion)}</li>
                )}
                {posicion.puntosParaSubir !== null && (
                  <li className="text-eco-ink2">
                    A {fmtNum(posicion.puntosParaSubir)} ECO del puesto #
                    {(posicion.posicion ?? 1) - 1} en ese cierre.
                  </li>
                )}
              </ul>
              {cierre && cierre.totalKg > 0 && (
                <div>
                  <div className="mb-1 flex justify-between text-xs text-eco-ink2">
                    <span>Tu participación en el cierre</span>
                    <span className="font-semibold text-eco-ink">
                      {fmtPct((posicion.kgReciclados / cierre.totalKg) * 100)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-eco-bg">
                    <div
                      className="h-full rounded-full bg-eco-org"
                      style={{
                        width: `${Math.min(100, (posicion.kgReciclados / cierre.totalKg) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-eco-ink2">
                    {fmtKg(posicion.kgReciclados)} de {fmtKg(cierre.totalKg)}{' '}
                    computados entre todas las organizaciones.
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-eco-ink2">
              No tuviste aportes computados en ese cierre.
            </p>
          )}

          {posicion.evolucion.length > 1 && (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-eco-ink2">
                Historial
              </div>
              <ul className="flex flex-wrap gap-2">
                {posicion.evolucion.slice(-6).map((p) => (
                  <li
                    key={`${p.anio}-${p.mes}`}
                    className="rounded-md border border-eco-border px-2 py-1 text-xs"
                  >
                    <span className="text-eco-ink2">
                      {periodo(p.mes, p.anio, false)}
                    </span>{' '}
                    <span className="font-semibold text-eco-ink">
                      {p.posicion ? `#${p.posicion}` : '—'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-auto">
            <CtaLink to="/empresa/ranking">Ver ranking completo →</CtaLink>
          </div>
        </div>
      )}
    </ChartCard>
  );
}

function Dato({
  icon,
  label,
  value,
  nota,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  nota: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg bg-eco-bg p-3">
      <span className="mt-0.5 h-fit rounded-md bg-white p-1.5 text-eco-org">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-xs text-eco-ink2">{label}</div>
        <div className="text-lg font-bold text-eco-ink">{value}</div>
        <div className="text-[11px] text-eco-ink2">{nota}</div>
      </div>
    </div>
  );
}

/**
 * Tu impacto ambiental. El CO₂ sale de los certificados emitidos (es la única
 * metodología implementada); sin certificados no se muestra.
 */
export function EnvironmentalImpactCard({
  kgRegistrados,
  aportes,
  certificados,
}: {
  kgRegistrados: number;
  aportes: number;
  certificados: MiCertificado[] | null | undefined;
}) {
  const co2 = certificados?.reduce((s, c) => s + c.co2Evitado, 0) ?? 0;
  const kgCert = certificados?.reduce((s, c) => s + c.kgReciclados, 0) ?? 0;
  return (
    <ChartCard
      title="Tu impacto ambiental"
      question="Acumulado histórico de tu organización."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Dato
          icon={<Leaf size={16} aria-hidden />}
          label="CO₂ evitado"
          value={certificados?.length ? fmtKg(co2) : '—'}
          nota={
            certificados?.length
              ? `Según certificados emitidos (${fmtKg(kgCert)} certificados)`
              : 'Se informa con el primer certificado emitido'
          }
        />
        <Dato
          icon={<Recycle size={16} aria-hidden />}
          label="Material recuperado"
          value={fmtKg(kgRegistrados)}
          nota="Kg registrados por la cooperativa, incluye el mes en curso"
        />
        <Dato
          icon={<CheckCircle2 size={16} aria-hidden />}
          label="Aportes registrados"
          value={fmtNum(aportes)}
          nota="Entregas validadas desde tu alta"
        />
        <Dato
          icon={<Award size={16} aria-hidden />}
          label="Certificados obtenidos"
          value={certificados ? fmtNum(certificados.length) : '—'}
          nota="Uno por cada mes cerrado con aportes"
        />
      </div>
    </ChartCard>
  );
}

function descargarBlob(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

/** Resumen del último certificado; el listado completo vive en /empresa/certificados. */
export function CertificateSummary({
  certificados,
}: {
  certificados: MiCertificado[] | null | undefined; // undefined = cargando
}) {
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState(false);
  const ultimo = certificados?.length
    ? [...certificados].sort(
        (a, b) => b.anio * 12 + b.mes - (a.anio * 12 + a.mes),
      )[0]
    : null;

  async function descargar(c: MiCertificado) {
    setDescargando(true);
    setError(false);
    try {
      descargarBlob(
        await descargarCertificadoPdf(c.id),
        `certificado-${c.mes}-${c.anio}.pdf`,
      );
    } catch {
      setError(true);
    } finally {
      setDescargando(false);
    }
  }

  return (
    <ChartCard
      title="Certificados ambientales"
      question={
        certificados?.length
          ? `${fmtNum(certificados.length)} ${certificados.length === 1 ? 'certificado obtenido' : 'certificados obtenidos'}`
          : undefined
      }
    >
      {certificados === undefined ? (
        <SinDatos label="Cargando…" />
      ) : certificados === null ? (
        <SinDatos label="No se pudieron cargar tus certificados." />
      ) : !ultimo ? (
        <SinDatos label="Todavía no tenés certificados. Se emiten al cierre de cada mes con aportes." />
      ) : (
        <div className="flex h-full flex-col gap-3">
          <div className="rounded-lg border border-eco-border p-3">
            <div className="text-xs text-eco-ink2">Último certificado</div>
            <div className="font-semibold text-eco-ink">
              {periodo(ultimo.mes, ultimo.anio)}
            </div>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div>
                <dt className="text-eco-ink2">Posición</dt>
                <dd className="font-semibold text-eco-ink">
                  #{ultimo.posicion}
                </dd>
              </div>
              <div>
                <dt className="text-eco-ink2">Certificados</dt>
                <dd className="font-semibold text-eco-ink">
                  {fmtKg(ultimo.kgReciclados)}
                </dd>
              </div>
              <div>
                <dt className="text-eco-ink2">CO₂ evitado</dt>
                <dd className="font-semibold text-eco-ink">
                  {fmtKg(ultimo.co2Evitado)}
                </dd>
              </div>
            </dl>
          </div>
          {error && (
            <p className="text-xs text-eco-danger">
              No se pudo descargar el PDF.
            </p>
          )}
          <div className="mt-auto flex flex-wrap items-center gap-3">
            <Button
              type="button"
              color="org"
              variant="outline"
              disabled={descargando}
              onClick={() => descargar(ultimo)}
            >
              <Download size={14} aria-hidden className="mr-1.5 inline" />
              {descargando ? 'Descargando…' : 'Descargar PDF'}
            </Button>
            <CtaLink to="/empresa/certificados">Ver todos →</CtaLink>
          </div>
        </div>
      )}
    </ChartCard>
  );
}

/** Trazabilidad digital: la blockchain como respaldo, no como protagonista. */
export function TraceabilitySummary({ wallet }: { wallet: string | null }) {
  return (
    <ChartCard title="Trazabilidad digital">
      <div className="flex h-full flex-col gap-3">
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
              Cada aporte tiene un comprobante digital y queda registrado en una
              red pública, donde cualquiera puede verificarlo.
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <dt className="text-eco-ink2">Red</dt>
            <dd className="font-semibold text-eco-ink">Sepolia (Ethereum)</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-eco-ink2">Billetera</dt>
            <dd
              className={cx(
                'truncate font-mono text-eco-ink',
                !wallet && 'font-sans',
              )}
            >
              {wallet
                ? `${wallet.slice(0, 10)}…${wallet.slice(-8)}`
                : 'Sin asignar'}
            </dd>
          </div>
        </dl>
        <div className="mt-auto flex flex-wrap gap-4">
          {wallet && (
            <a
              href={addressLink(wallet)}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-eco-org hover:underline"
            >
              Ver en explorador ↗
            </a>
          )}
          <CtaLink to="/empresa/aportes">Ver comprobantes →</CtaLink>
        </div>
      </div>
    </ChartCard>
  );
}
