import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { txLink } from '@/lib/explorer';
import type { Empresa, TipoMaterial, Puntaje } from '@/types';
import {
  consultarAcunacion,
  listarMateriales,
  listarPuntajesVigentes,
  registrarIngreso,
  reintentarAcunacion,
  type IngresoRegistrado,
} from '../api';

// La acuñación corre de fondo: se consulta cada 4 s hasta confirmar (1-2 bloques
// de Sepolia, 12-18 s) y se da por demorada pasados ~80 s.
const CADA_MS = 4000;
const MAX_CONSULTAS = 20;
const MAX_VISIBLES = 5;

const inputClass =
  'w-full rounded-lg border border-eco-border-strong bg-eco-surface px-3.5 py-2.5 text-sm text-eco-ink focus:outline-none focus:ring-2 focus:ring-eco-coop/30';

interface RegistrarEntregaFormProps {
  empresa: Empresa;
}

// Formulario de registro de ingreso (E5-HU01): completa el flujo que el
// backend de Tobias ya soporta (registrar + reintentar acuñación) pero que
// nunca tuvo pantalla. Muestra un resumen de tokens estimados antes de
// confirmar, y el estado de cada registro: acuñando, confirmado o demorado.
// La cooperativa puede seguir registrando mientras las acuñaciones se
// completan de fondo.
export function RegistrarEntregaForm({ empresa }: RegistrarEntregaFormProps) {
  const [materiales, setMateriales] = useState<TipoMaterial[]>([]);
  const [puntajes, setPuntajes] = useState<Puntaje[]>([]);
  const [tipoMaterialId, setTipoMaterialId] = useState('');
  const [peso, setPeso] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [reintentando, setReintentando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [registros, setRegistros] = useState<IngresoRegistrado[]>([]);
  // Consultas hechas por registro; al pasar MAX_CONSULTAS se da por demorado.
  const consultas = useRef<Record<string, number>>({});
  const [demorados, setDemorados] = useState<string[]>([]);

  useEffect(() => {
    listarMateriales()
      .then(setMateriales)
      .catch(() => setMateriales([]));
    listarPuntajesVigentes()
      .then(setPuntajes)
      .catch(() => setPuntajes([]));
  }, []);

  const enCurso = registros.filter(
    (r) => !r.movimientoToken?.txHash && !demorados.includes(r.id),
  );
  const hayEnCurso = enCurso.length > 0;

  useEffect(() => {
    if (!hayEnCurso) return;
    const timer = setInterval(async () => {
      for (const r of enCurso) {
        consultas.current[r.id] = (consultas.current[r.id] ?? 0) + 1;
        try {
          const actual = await consultarAcunacion(r.id);
          if (actual.movimientoToken?.txHash) {
            setRegistros((prev) =>
              prev.map((x) => (x.id === r.id ? actual : x)),
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
  }, [enCurso.map((r) => r.id).join(',')]);

  const pesoNum = Number(peso);
  const material = materiales.find((m) => m.id === tipoMaterialId);
  const puntaje = puntajes.find((p) => p.tipoMaterialId === tipoMaterialId);
  const tokensEstimados =
    material && puntaje && pesoNum > 0
      ? Math.round(pesoNum * Number(puntaje.cantidadPorKilo))
      : null;
  const formValido = tipoMaterialId !== '' && pesoNum > 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const res = await registrarIngreso({
        empresaId: empresa.id,
        tipoMaterialId,
        peso: pesoNum,
      });
      setRegistros((prev) => [res, ...prev].slice(0, MAX_VISIBLES));
      setTipoMaterialId('');
      setPeso('');
    } catch {
      setError(
        'No se pudo registrar el ingreso. Verificá que tu cuenta tenga VALIDATOR_ROLE activo y que la empresa esté aprobada.',
      );
    } finally {
      setEnviando(false);
    }
  }

  async function handleReintentar(id: string) {
    setError(null);
    setReintentando(id);
    try {
      const actual = await reintentarAcunacion(id);
      setRegistros((prev) => prev.map((x) => (x.id === id ? actual : x)));
      consultas.current[id] = 0;
      setDemorados((prev) => prev.filter((x) => x !== id));
    } catch {
      setError('La acuñación volvió a fallar. Podés reintentarla de nuevo.');
    } finally {
      setReintentando(null);
    }
  }

  return (
    <Card className="mt-3 border-eco-coop p-5">
      <h3 className="mb-4 text-sm font-semibold text-eco-ink">
        Registrar entrega — {empresa.razonSocial}
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-xs font-semibold text-eco-ink2">
          Material
          <select
            className={inputClass}
            value={tipoMaterialId}
            onChange={(e) => setTipoMaterialId(e.target.value)}
            required
          >
            <option value="">Seleccioná un material</option>
            {materiales.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold text-eco-ink2">
          Peso (kg)
          <input
            type="number"
            min="0.1"
            step="0.1"
            className={inputClass}
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            required
          />
        </label>

        {tokensEstimados !== null && (
          <div className="rounded-lg bg-eco-coop-soft px-3.5 py-3 text-sm text-eco-coop">
            <strong>Resumen:</strong> {pesoNum.toLocaleString('es-AR')} kg de{' '}
            {material?.nombre} → <strong>~{tokensEstimados} ECO</strong>{' '}
            estimados para {empresa.razonSocial}.
          </div>
        )}

        {error && <p className="text-xs text-eco-danger">{error}</p>}

        <Button
          type="submit"
          color="coop"
          disabled={!formValido || enviando}
          className="self-start"
        >
          {enviando ? 'Registrando…' : 'Confirmar registro'}
        </Button>
      </form>

      {registros.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 border-t border-eco-border pt-4">
          <p className="text-xs text-eco-ink2">
            Podés seguir registrando: las acuñaciones se completan solas en
            segundo plano.
          </p>
          {registros.map((r) => {
            const txHash = r.movimientoToken?.txHash;
            const demorado = !txHash && demorados.includes(r.id);
            return (
              <div
                key={r.id}
                className="flex flex-col gap-1.5 rounded-lg border border-eco-border p-3"
              >
                <div className="flex items-center gap-2">
                  {txHash ? (
                    <Badge color="coop">Confirmado</Badge>
                  ) : demorado ? (
                    <Badge color="danger">Demorado</Badge>
                  ) : (
                    <Badge color="ink">Acuñando…</Badge>
                  )}
                  <span className="text-sm text-eco-ink">
                    <strong>{r.tokensAcumulados} ECO</strong> · {r.peso} kg de{' '}
                    {r.tipoMaterial.nombre}
                  </span>
                </div>
                {txHash && (
                  <a
                    href={txLink(txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-eco-coop"
                  >
                    Ver transacción en el explorador ↗
                  </a>
                )}
                {demorado && (
                  <>
                    <p className="text-sm text-eco-ink2">
                      La acuñación tarda más de lo normal. Podés reintentarla.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      color="coop"
                      className="self-start"
                      onClick={() => handleReintentar(r.id)}
                      disabled={reintentando === r.id}
                    >
                      {reintentando === r.id
                        ? 'Reintentando…'
                        : 'Reintentar acuñación'}
                    </Button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
