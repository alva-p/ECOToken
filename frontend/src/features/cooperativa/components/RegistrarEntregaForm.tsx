import { useEffect, useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { txLink } from '@/lib/explorer';
import type { Empresa, TipoMaterial, Puntaje } from '@/types';
import {
  listarMateriales,
  listarPuntajesVigentes,
  registrarIngreso,
  reintentarAcunacion,
  type IngresoRegistrado,
} from '../api';

const inputClass =
  'w-full rounded-lg border border-eco-border-strong bg-eco-surface px-3.5 py-2.5 text-sm text-eco-ink focus:outline-none focus:ring-2 focus:ring-eco-coop/30';

interface RegistrarEntregaFormProps {
  empresa: Empresa;
}

// Formulario de registro de ingreso (E5-HU01): completa el flujo que el
// backend de Tobias ya soporta (registrar + reintentar acuñación) pero que
// nunca tuvo pantalla. Muestra un resumen de tokens estimados antes de
// confirmar, y el estado final: pendiente, confirmado o error.
export function RegistrarEntregaForm({ empresa }: RegistrarEntregaFormProps) {
  const [materiales, setMateriales] = useState<TipoMaterial[]>([]);
  const [puntajes, setPuntajes] = useState<Puntaje[]>([]);
  const [tipoMaterialId, setTipoMaterialId] = useState('');
  const [peso, setPeso] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [reintentando, setReintentando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<IngresoRegistrado | null>(null);

  useEffect(() => {
    listarMateriales()
      .then(setMateriales)
      .catch(() => setMateriales([]));
    listarPuntajesVigentes()
      .then(setPuntajes)
      .catch(() => setPuntajes([]));
  }, []);

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
    setResultado(null);
    setEnviando(true);
    try {
      const res = await registrarIngreso({
        empresaId: empresa.id,
        tipoMaterialId,
        peso: pesoNum,
      });
      setResultado(res);
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

  async function handleReintentar() {
    if (!resultado) return;
    setError(null);
    setReintentando(true);
    try {
      setResultado(await reintentarAcunacion(resultado.id));
    } catch {
      setError('La acuñación volvió a fallar. Podés reintentarla de nuevo.');
    } finally {
      setReintentando(false);
    }
  }

  const acunado = !!resultado?.movimientoToken?.txHash;

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

      {resultado && (
        <div className="mt-4 flex flex-col gap-2 border-t border-eco-border pt-4">
          {acunado ? (
            <>
              <Badge color="coop">Confirmado</Badge>
              <p className="text-sm text-eco-ink">
                Se acuñaron <strong>{resultado.tokensAcumulados} ECO</strong>{' '}
                por {resultado.peso} kg de {resultado.tipoMaterial.nombre}.
              </p>
              <a
                href={txLink(resultado.movimientoToken!.txHash!)}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-eco-coop"
              >
                Ver transacción en el explorador ↗
              </a>
            </>
          ) : (
            <>
              <Badge color="ink">Pendiente de acuñación</Badge>
              <p className="text-sm text-eco-ink2">
                El ingreso quedó registrado, pero la acuñación on-chain no se
                completó todavía.
              </p>
              <Button
                type="button"
                variant="outline"
                color="coop"
                className="self-start"
                onClick={handleReintentar}
                disabled={reintentando}
              >
                {reintentando ? 'Reintentando…' : 'Reintentar acuñación'}
              </Button>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
