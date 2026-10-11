import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Gift, Globe, MonitorPlay, Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { cx } from '@/lib/cx';
import {
  TIPOS_BENEFICIO,
  type Canje,
  type EstadoCanje,
  type TipoBeneficio,
} from '@/features/municipio/api';
import { fmtNum } from '@/features/municipio/dashboard/data';
import {
  canjearBeneficio,
  type BeneficioDisponible,
  type BeneficiosOrganizacion,
} from '../api';
import { alcanza, diasParaVencer } from '../dashboard/data';

const ICONO: Record<TipoBeneficio, typeof Gift> = {
  WEB: Globe,
  PANTALLAS: MonitorPlay,
  OTRO: Gift,
};

const ESTADO_CANJE: Record<
  EstadoCanje,
  { label: string; detalle: string; color: 'ink' | 'org' | 'danger' }
> = {
  PENDIENTE: {
    label: 'Pendiente',
    detalle: 'Pendiente de aprobación por la Municipalidad',
    color: 'ink',
  },
  APROBADO: {
    label: 'Aprobado',
    detalle: 'La Municipalidad aprobó tu solicitud',
    color: 'org',
  },
  RECHAZADO: {
    label: 'Rechazado',
    detalle: 'Los ECO reservados volvieron a tu saldo disponible',
    color: 'danger',
  },
};

const fmtEco = (n: number) => `${fmtNum(n)} ECO`;
const fmtFechaLarga = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

function textoCupos(b: BeneficioDisponible) {
  if (b.cupos === null) return 'Sin límite de cupos';
  if (b.cuposDisponibles === 0) return 'Sin cupos disponibles';
  return `${b.cuposDisponibles} de ${b.cupos} cupos disponibles`;
}

function textoVigencia(b: BeneficioDisponible) {
  const dias = diasParaVencer(b.vigenteHasta);
  if (dias === null || !b.vigenteHasta) return null;
  if (dias === 0) return { texto: 'Finaliza hoy', urgente: true };
  if (dias <= 7)
    return {
      texto: `Finaliza en ${dias} ${dias === 1 ? 'día' : 'días'}`,
      urgente: true,
    };
  return {
    texto: `Disponible hasta el ${fmtFechaLarga(b.vigenteHasta)}`,
    urgente: false,
  };
}

/** Tarjeta de un beneficio: costo, cupos, vigencia y si alcanza el saldo disponible. */
export function BenefitCard({
  b,
  disponible,
  onCanjear,
}: {
  b: BeneficioDisponible;
  disponible: number;
  onCanjear: (b: BeneficioDisponible) => void;
}) {
  const Icon = ICONO[b.tipo];
  const puede = alcanza(b, disponible);
  const sinCupo = b.cuposDisponibles === 0;
  const falta = b.costoTokens - disponible;
  const vigencia = textoVigencia(b);
  return (
    <Card
      className={cx(
        'flex h-full flex-col gap-3 p-5 shadow-sm transition-shadow hover:shadow-md',
        !puede && 'bg-eco-bg/40',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-eco-muni">
          <Icon size={14} aria-hidden />
          {TIPOS_BENEFICIO[b.tipo]}
        </span>
        {puede && <Badge color="org">Disponible</Badge>}
      </div>
      <div>
        <h3 className="font-semibold leading-snug text-eco-ink">{b.titulo}</h3>
        <p className="mt-1 line-clamp-3 text-sm text-eco-ink2">
          {b.descripcion}
        </p>
      </div>
      <div className="mt-auto flex flex-col gap-1.5 text-xs text-eco-ink2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-eco-ink">
            {fmtNum(b.costoTokens)}
          </span>
          <span className="text-sm font-semibold text-eco-org">ECO</span>
          <span className="ml-1">puntos requeridos</span>
        </div>
        <span className="inline-flex items-center gap-1.5">
          <Ticket size={13} aria-hidden /> {textoCupos(b)}
        </span>
        {vigencia && (
          <span
            className={cx(
              'inline-flex items-center gap-1.5',
              vigencia.urgente && 'font-semibold text-eco-coop',
            )}
          >
            <CalendarDays size={13} aria-hidden /> {vigencia.texto}
          </span>
        )}
      </div>
      {!puede && !sinCupo && falta > 0 && (
        <div>
          <div className="mb-1 flex justify-between text-xs text-eco-ink2">
            <span>Te faltan {fmtEco(falta)}</span>
            <span>
              {fmtNum(disponible)} / {fmtNum(b.costoTokens)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-eco-border">
            <div
              className="h-full rounded-full bg-eco-org/60"
              style={{ width: `${(disponible / b.costoTokens) * 100}%` }}
            />
          </div>
        </div>
      )}
      <Button
        type="button"
        color="org"
        variant={puede ? 'solid' : 'outline'}
        disabled={!puede}
        onClick={() => onCanjear(b)}
      >
        {puede
          ? 'Canjear beneficio'
          : sinCupo
            ? 'Sin cupos'
            : 'Saldo insuficiente'}
      </Button>
    </Card>
  );
}

/**
 * Estado y modal de canje compartidos por el dashboard y la página de
 * beneficios. Muestra el saldo antes y después antes de confirmar.
 */
export function useCanje(
  datos: BeneficiosOrganizacion | null,
  onHecho: () => void,
) {
  const [elegido, setElegido] = useState<BeneficioDisponible | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function confirmar() {
    if (!elegido) return;
    setEnviando(true);
    setError(null);
    try {
      await canjearBeneficio(elegido.id);
      setAviso(
        `Solicitaste "${elegido.titulo}". La Municipalidad va a revisar tu solicitud.`,
      );
      setElegido(null);
      onHecho();
    } catch (e) {
      const estado = (e as Error).message;
      setError(
        estado.includes('409')
          ? 'Ya no quedan cupos para este beneficio.'
          : estado.includes('400')
            ? 'Tu saldo disponible no alcanza o el beneficio ya no está vigente.'
            : 'No se pudo enviar la solicitud. Probá de nuevo.',
      );
    } finally {
      setEnviando(false);
    }
  }

  const disponible = datos?.disponible ?? 0;
  const modal = (
    <ConfirmModal
      open={elegido !== null}
      title="Confirmar canje"
      confirmLabel={enviando ? 'Enviando…' : 'Confirmar canje'}
      confirmDisabled={enviando}
      onConfirm={confirmar}
      onClose={() => {
        setElegido(null);
        setError(null);
      }}
      description={
        elegido && (
          <div className="flex flex-col gap-3">
            <p>
              Vas a solicitar{' '}
              <strong className="text-eco-ink">{elegido.titulo}</strong>.
            </p>
            <dl className="divide-y divide-eco-border rounded-lg border border-eco-border text-sm">
              {(
                [
                  ['Puntos ECO requeridos', fmtEco(elegido.costoTokens)],
                  ['Tu saldo disponible', fmtEco(disponible)],
                  [
                    'Saldo después del canje',
                    fmtEco(disponible - elegido.costoTokens),
                  ],
                ] as [string, string][]
              ).map(([k, v], i) => (
                <div key={k} className="flex justify-between px-3 py-2">
                  <dt>{k}</dt>
                  <dd
                    className={cx(
                      'tabular-nums text-eco-ink',
                      i === 2 && 'font-bold',
                    )}
                  >
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-xs">
              Los ECO quedan reservados mientras la Municipalidad revisa la
              solicitud. Si la rechaza, vuelven a tu saldo disponible.
            </p>
            {error && (
              <p className="text-xs font-semibold text-eco-danger">{error}</p>
            )}
          </div>
        )
      }
    />
  );
  return { abrir: setElegido, modal, aviso, cerrarAviso: () => setAviso(null) };
}

export function Aviso({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      role="status"
      className="flex items-start justify-between gap-3 rounded-lg border border-eco-org/30 bg-eco-org-soft px-4 py-3 text-sm text-eco-ink"
    >
      {children}
      <button
        type="button"
        onClick={onClose}
        className="text-xs font-semibold text-eco-org hover:underline"
      >
        Cerrar
      </button>
    </div>
  );
}

/** Lista corta de canjes propios con su estado real del backend. */
export function MyBenefitsList({
  canjes,
  max,
}: {
  canjes: Canje[];
  max?: number;
}) {
  if (canjes.length === 0) {
    return (
      <p className="py-4 text-sm text-eco-ink2">
        Todavía no solicitaste beneficios.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-eco-border">
      {canjes.slice(0, max).map((c) => {
        const e = ESTADO_CANJE[c.estado];
        return (
          <li
            key={c.id}
            className="flex items-start justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-eco-ink">
                {c.beneficio.titulo}
              </div>
              <div className="text-xs text-eco-ink2">
                {e.detalle} · {fmtEco(c.costoTokens)} ·{' '}
                {new Date(c.createdAt).toLocaleDateString('es-AR')}
              </div>
            </div>
            <Badge color={e.color}>{e.label}</Badge>
          </li>
        );
      })}
    </ul>
  );
}

/** Beneficios del dashboard: resumen, 3 destacados y mis solicitudes. */
export function BenefitsSection({
  datos,
  error,
  onCambio,
}: {
  datos: BeneficiosOrganizacion | null;
  error: boolean;
  onCambio: () => void;
}) {
  const { abrir, modal, aviso, cerrarAviso } = useCanje(datos, onCambio);
  if (error) {
    return (
      <Card className="p-5 text-sm text-eco-ink2">
        No se pudieron cargar los beneficios municipales.
      </Card>
    );
  }
  if (!datos) return null;
  const { beneficios, disponible, canjes } = datos;
  const alcanzables = beneficios.filter((b) => alcanza(b, disponible));
  // Destacados: primero los que alcanzan (los de mayor valor), después los más cercanos.
  const destacados = [
    ...alcanzables.sort((a, b) => b.costoTokens - a.costoTokens),
    ...beneficios.filter((b) => !alcanza(b, disponible)),
  ].slice(0, 3);

  return (
    <section
      aria-labelledby="beneficios-titulo"
      className="flex flex-col gap-4"
    >
      <Card className="flex flex-col gap-4 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2
              id="beneficios-titulo"
              className="flex items-center gap-2 text-base font-semibold text-eco-ink"
            >
              <Gift size={18} aria-hidden className="text-eco-org" />
              Beneficios disponibles
            </h2>
            <p className="mt-0.5 text-xs text-eco-ink2">
              Publicados por la Municipalidad para canjear con tus puntos ECO.
            </p>
          </div>
          <Link
            to="/empresa/beneficios"
            className="text-xs font-semibold text-eco-org hover:underline"
          >
            Explorar todos los beneficios →
          </Link>
        </div>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(
            [
              [fmtEco(disponible), 'disponibles para canjear'],
              [
                fmtNum(beneficios.length),
                beneficios.length === 1
                  ? 'beneficio activo'
                  : 'beneficios activos',
              ],
              [fmtNum(alcanzables.length), 'alcanzables con tu saldo actual'],
            ] as [string, string][]
          ).map(([v, l]) => (
            <div key={l} className="rounded-lg bg-eco-bg p-3">
              <dd className="text-xl font-bold text-eco-ink">{v}</dd>
              <dt className="text-xs text-eco-ink2">{l}</dt>
            </div>
          ))}
        </dl>
        {aviso && <Aviso onClose={cerrarAviso}>{aviso}</Aviso>}
        {destacados.length === 0 ? (
          <p className="text-sm text-eco-ink2">
            La Municipalidad todavía no publicó beneficios vigentes.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {destacados.map((b) => (
              <BenefitCard
                key={b.id}
                b={b}
                disponible={disponible}
                onCanjear={abrir}
              />
            ))}
          </div>
        )}
        <div className="border-t border-eco-border pt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-eco-ink">
              Mis beneficios
            </h3>
            {canjes.length > 0 && (
              <Link
                to="/empresa/beneficios"
                className="text-xs font-semibold text-eco-org hover:underline"
              >
                Ver mis beneficios →
              </Link>
            )}
          </div>
          <MyBenefitsList canjes={canjes} max={3} />
        </div>
      </Card>
      {modal}
    </section>
  );
}
