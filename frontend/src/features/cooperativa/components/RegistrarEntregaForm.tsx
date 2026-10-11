import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock3,
  GlassWater,
  Milk,
  Package,
  Recycle,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cx } from '@/lib/cx';
import { txLogsLink } from '@/lib/explorer';
import {
  fmtFecha,
  fmtKg,
  fmtNum,
  nombreMaterial,
} from '@/features/municipio/dashboard/data';
import type { Empresa, TipoMaterial, Puntaje } from '@/types';
import {
  consultarAcunacion,
  listarPuntajesVigentes,
  registrarIngreso,
  reintentarAcunacion,
  type IngresoRegistrado,
} from '../api';
import { BuscadorEmpresas } from './BuscadorEmpresas';

// La acuñación corre de fondo: se consulta cada 4 s hasta confirmar (1-2 bloques
// de Sepolia, 12-18 s) y se da por demorada pasados ~80 s.
const CADA_MS = 4000;
const MAX_CONSULTAS = 20;
const MAX_VISIBLES = 5;

/** Ícono orientativo por nombre de material; los materiales vienen del backend. */
function iconoMaterial(nombre: string): LucideIcon {
  const n = nombre.toUpperCase();
  if (n.includes('PLAST')) return Milk;
  if (n.includes('CART') || n.includes('PAPEL')) return Package;
  if (n.includes('VIDR')) return GlassWater;
  return Recycle;
}

function Paso({
  n,
  titulo,
  hecho,
  children,
}: {
  n: number;
  titulo: string;
  hecho: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 flex items-center gap-2.5 text-sm font-semibold text-eco-ink">
        <span
          className={cx(
            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
            hecho ? 'bg-eco-coop text-white' : 'bg-eco-coop-soft text-eco-coop',
          )}
          aria-hidden
        >
          {hecho ? '✓' : n}
        </span>
        Paso {n} — {titulo}
      </legend>
      {children}
    </fieldset>
  );
}

interface Registro {
  ingreso: IngresoRegistrado;
  empresa: string;
}

interface RegistrarEntregaFormProps {
  materiales: TipoMaterial[];
  color: (material: string) => string;
  /** Fecha ISO de la última entrega de cada organización a esta cooperativa. */
  ultimaEntrega: (empresaId: string) => string | null;
  onRegistrado: () => void;
}

// Registro de una entrega (E5-HU01) en pasos: organización → material → peso
// → resumen → confirmar. Tras confirmar muestra el resultado y el estado de
// la acuñación, que corre de fondo: se puede seguir registrando.
export function RegistrarEntregaForm({
  materiales,
  color,
  ultimaEntrega,
  onRegistrado,
}: RegistrarEntregaFormProps) {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [puntajes, setPuntajes] = useState<Puntaje[]>([]);
  const [tipoMaterialId, setTipoMaterialId] = useState('');
  const [peso, setPeso] = useState('');
  const [tocado, setTocado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [reintentando, setReintentando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [exito, setExito] = useState<string | null>(null); // id del último registro
  // Consultas hechas por registro; al pasar MAX_CONSULTAS se da por demorado.
  const consultas = useRef<Record<string, number>>({});
  const [demorados, setDemorados] = useState<string[]>([]);
  const pesoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listarPuntajesVigentes()
      .then(setPuntajes)
      .catch(() => setPuntajes([]));
  }, []);

  const enCurso = registros.filter(
    ({ ingreso: r }) => !r.movimientoToken?.txHash && !demorados.includes(r.id),
  );
  const hayEnCurso = enCurso.length > 0;

  useEffect(() => {
    if (!hayEnCurso) return;
    const timer = setInterval(async () => {
      for (const { ingreso: r } of enCurso) {
        consultas.current[r.id] = (consultas.current[r.id] ?? 0) + 1;
        try {
          const actual = await consultarAcunacion(r.id);
          if (actual.movimientoToken?.txHash) {
            setRegistros((prev) =>
              prev.map((x) =>
                x.ingreso.id === r.id ? { ...x, ingreso: actual } : x,
              ),
            );
            continue;
          }
        } catch {
          // un fallo de red puntual no corta el seguimiento
        }
        if (consultas.current[r.id] >= MAX_CONSULTAS) {
          setDemorados((prev) => [...prev, r.id]);
        }
      }
    }, CADA_MS);
    return () => clearInterval(timer);
    // `enCurso` se recalcula cada render; alcanza con saber cuáles hay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enCurso.map((r) => r.ingreso.id).join(',')]);

  const pesoNum = Number(peso.replace(',', '.'));
  const pesoValido = Number.isFinite(pesoNum) && pesoNum > 0;
  const material = materiales.find((m) => m.id === tipoMaterialId);
  const puntaje = puntajes.find((p) => p.tipoMaterialId === tipoMaterialId);
  const tokensEstimados =
    material && puntaje && pesoValido
      ? Math.round(pesoNum * Number(puntaje.cantidadPorKilo))
      : null;
  const formValido = empresa !== null && material !== undefined && pesoValido;
  const ultima = empresa ? ultimaEntrega(empresa.id) : null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTocado(true);
    if (!formValido || !empresa) return;
    setError(null);
    setEnviando(true);
    try {
      const res = await registrarIngreso({
        empresaId: empresa.id,
        tipoMaterialId,
        peso: pesoNum,
      });
      setRegistros((prev) =>
        [{ ingreso: res, empresa: empresa.razonSocial }, ...prev].slice(
          0,
          MAX_VISIBLES,
        ),
      );
      setExito(res.id);
      onRegistrado();
    } catch {
      setError(
        'No se pudo registrar la entrega. Verificá que la cooperativa esté autorizada como validadora y que la organización esté aprobada.',
      );
    } finally {
      setEnviando(false);
    }
  }

  function otraEntrega() {
    // Se mantiene la organización: suele entregar varios materiales seguidos.
    setExito(null);
    setTipoMaterialId('');
    setPeso('');
    setTocado(false);
  }

  async function handleReintentar(id: string) {
    setError(null);
    setReintentando(id);
    try {
      const actual = await reintentarAcunacion(id);
      setRegistros((prev) =>
        prev.map((x) => (x.ingreso.id === id ? { ...x, ingreso: actual } : x)),
      );
      consultas.current[id] = 0;
      setDemorados((prev) => prev.filter((x) => x !== id));
    } catch {
      setError('La acuñación volvió a fallar. Podés reintentarla de nuevo.');
    } finally {
      setReintentando(null);
    }
  }

  const ultimo = registros.find((r) => r.ingreso.id === exito);

  const estadoAcunacion = (r: IngresoRegistrado) => {
    const txHash = r.movimientoToken?.txHash;
    if (txHash) return <Badge color="coop">Registro trazable</Badge>;
    if (demorados.includes(r.id)) return <Badge color="danger">Demorado</Badge>;
    return <Badge color="ink">Registrando en la red…</Badge>;
  };

  return (
    <Card className="border-eco-coop/40 p-0 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-eco-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-eco-ink">
            Registrar nueva entrega
          </h2>
          <p className="text-xs text-eco-ink2">
            Organización → material → peso → resumen → confirmar.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-[1fr_320px]"
      >
        <div className="flex flex-col gap-6">
          <Paso n={1} titulo="Organización" hecho={empresa !== null}>
            <BuscadorEmpresas
              onSelect={(e) => {
                setEmpresa(e);
                setExito(null);
              }}
            />
            {empresa && (
              <p className="flex flex-wrap items-center gap-x-2 text-xs text-eco-ink2">
                <span className="inline-flex items-center gap-1 font-semibold text-eco-coop">
                  <CheckCircle2 size={14} aria-hidden /> Organización
                  seleccionada
                </span>
                <span>
                  {ultima
                    ? `Última entrega en esta cooperativa: ${fmtFecha(ultima)}`
                    : 'Primera entrega en esta cooperativa'}
                </span>
              </p>
            )}
          </Paso>

          <Paso n={2} titulo="Material" hecho={material !== undefined}>
            {materiales.length === 0 ? (
              <p className="text-sm text-eco-ink2">Cargando materiales…</p>
            ) : (
              <div
                role="radiogroup"
                aria-label="Material"
                className="grid grid-cols-2 gap-2 sm:grid-cols-3"
              >
                {materiales.map((m) => {
                  const Icon = iconoMaterial(m.nombre);
                  const activo = m.id === tipoMaterialId;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={activo}
                      onClick={() => {
                        setTipoMaterialId(m.id);
                        setExito(null);
                        pesoRef.current?.focus();
                      }}
                      className={cx(
                        'flex items-center gap-2.5 rounded-lg border px-3 py-3 text-left text-sm font-semibold transition-colors',
                        activo
                          ? 'border-eco-coop bg-eco-coop-soft text-eco-ink'
                          : 'border-eco-border-strong text-eco-ink hover:bg-eco-bg',
                      )}
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-md text-white"
                        style={{ background: color(m.nombre) }}
                      >
                        <Icon size={17} aria-hidden />
                      </span>
                      {nombreMaterial(m.nombre)}
                    </button>
                  );
                })}
              </div>
            )}
          </Paso>

          <Paso n={3} titulo="Peso recibido" hecho={pesoValido}>
            <div className="flex items-center gap-3">
              <input
                ref={pesoRef}
                id="peso"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={peso}
                onChange={(e) => {
                  setPeso(e.target.value.replace(/[^\d.,]/g, ''));
                  setExito(null);
                }}
                onBlur={() => setTocado(true)}
                placeholder="0,0"
                aria-label="Peso recibido en kilogramos"
                aria-invalid={tocado && !pesoValido}
                aria-describedby="peso-ayuda"
                className="w-44 rounded-lg border border-eco-border-strong bg-eco-surface px-4 py-3 text-right text-3xl font-bold tabular-nums text-eco-ink placeholder:text-eco-ink3 focus:outline-none focus:ring-2 focus:ring-eco-coop/30"
              />
              <span className="text-xl font-semibold text-eco-ink2">kg</span>
            </div>
            <p
              id="peso-ayuda"
              className={cx(
                'text-xs',
                tocado && !pesoValido ? 'text-eco-danger' : 'text-eco-ink2',
              )}
            >
              {tocado && !pesoValido
                ? 'El peso debe ser mayor a 0 kg.'
                : 'Usá coma o punto para los decimales.'}
            </p>
          </Paso>
        </div>

        {/* Resumen / resultado */}
        <div className="flex flex-col gap-3 lg:border-l lg:border-eco-border lg:pl-6">
          {ultimo ? (
            <div role="status" className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-eco-coop">
                <CheckCircle2 size={20} aria-hidden />
                Entrega registrada correctamente
              </div>
              <div className="rounded-lg bg-eco-coop-soft/60 p-4 text-sm">
                <div className="font-semibold text-eco-ink">
                  {ultimo.empresa}
                </div>
                <div className="text-eco-ink2">
                  {fmtKg(ultimo.ingreso.peso)} de{' '}
                  {nombreMaterial(
                    ultimo.ingreso.tipoMaterial.nombre,
                  ).toLowerCase()}
                </div>
                <div className="mt-2 text-lg font-bold text-eco-ink">
                  {fmtNum(ultimo.ingreso.tokensAcumulados)} ECO reconocidos
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-eco-ink2">
                {estadoAcunacion(ultimo.ingreso)}
                {ultimo.ingreso.movimientoToken?.txHash ? (
                  <a
                    href={txLogsLink(ultimo.ingreso.movimientoToken.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-eco-coop hover:underline"
                  >
                    Ver comprobante ↗
                  </a>
                ) : (
                  !demorados.includes(ultimo.ingreso.id) && (
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={12} aria-hidden /> suele tardar 15–30 s
                    </span>
                  )
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" color="coop" onClick={otraEntrega}>
                  Registrar otra entrega
                </Button>
                <Link
                  to="/cooperativa/historial"
                  className="inline-flex items-center rounded-lg border border-eco-border-strong px-4 py-2.5 text-sm font-semibold text-eco-ink hover:bg-eco-bg"
                >
                  Ver historial
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-eco-ink2">
                Resumen de la entrega
              </div>
              <dl className="divide-y divide-eco-border rounded-lg border border-eco-border text-sm">
                {(
                  [
                    ['Organización', empresa?.razonSocial],
                    ['Material', material && nombreMaterial(material.nombre)],
                    ['Peso', pesoValido ? fmtKg(pesoNum) : null],
                    [
                      'Reconocimiento estimado',
                      tokensEstimados !== null
                        ? `~${fmtNum(tokensEstimados)} ECO`
                        : null,
                    ],
                  ] as [string, string | null | undefined][]
                ).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between gap-3 px-3 py-2.5"
                  >
                    <dt className="text-eco-ink2">{k}</dt>
                    <dd
                      className={cx(
                        'text-right font-semibold',
                        v ? 'text-eco-ink' : 'text-eco-ink3',
                      )}
                    >
                      {v ?? '—'}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="text-[11px] text-eco-ink2">
                Los ECO son puntos de reconocimiento ambiental. Se calculan con
                la tabla de conversión vigente por material.
              </p>
              {error && <p className="text-xs text-eco-danger">{error}</p>}
              <Button
                type="submit"
                color="coop"
                disabled={!formValido || enviando}
                className="w-full py-3"
              >
                {enviando ? 'Registrando…' : 'Confirmar registro'}
              </Button>
            </>
          )}
        </div>
      </form>

      {registros.length > (ultimo ? 1 : 0) && (
        <div className="flex flex-col gap-2 border-t border-eco-border px-5 py-4">
          <p className="text-xs font-semibold text-eco-ink2">
            Registros de esta sesión
          </p>
          {registros
            .filter((r) => r.ingreso.id !== exito)
            .map(({ ingreso: r, empresa: nombre }) => {
              const demorado =
                !r.movimientoToken?.txHash && demorados.includes(r.id);
              return (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center gap-2 text-sm text-eco-ink"
                >
                  {estadoAcunacion(r)}
                  <span>
                    {nombre} · {fmtKg(r.peso)} de{' '}
                    {nombreMaterial(r.tipoMaterial.nombre).toLowerCase()} ·{' '}
                    {fmtNum(r.tokensAcumulados)} ECO
                  </span>
                  {r.movimientoToken?.txHash && (
                    <a
                      href={txLogsLink(r.movimientoToken.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-eco-coop hover:underline"
                    >
                      Comprobante ↗
                    </a>
                  )}
                  {demorado && (
                    <Button
                      type="button"
                      variant="outline"
                      color="coop"
                      className="px-2.5 py-1 text-xs"
                      onClick={() => handleReintentar(r.id)}
                      disabled={reintentando === r.id}
                    >
                      {reintentando === r.id ? 'Reintentando…' : 'Reintentar'}
                    </Button>
                  )}
                </div>
              );
            })}
        </div>
      )}
      {ultimo && error && (
        <p className="border-t border-eco-border px-5 py-3 text-xs text-eco-danger">
          {error}
        </p>
      )}
      {ultimo &&
        !ultimo.ingreso.movimientoToken?.txHash &&
        demorados.includes(ultimo.ingreso.id) && (
          <div className="border-t border-eco-border px-5 py-3 text-sm text-eco-ink2">
            La registración en la red tarda más de lo normal.{' '}
            <Button
              type="button"
              variant="outline"
              color="coop"
              className="ml-2 px-2.5 py-1 text-xs"
              onClick={() => handleReintentar(ultimo.ingreso.id)}
              disabled={reintentando === ultimo.ingreso.id}
            >
              {reintentando === ultimo.ingreso.id
                ? 'Reintentando…'
                : 'Reintentar'}
            </Button>
          </div>
        )}
    </Card>
  );
}
