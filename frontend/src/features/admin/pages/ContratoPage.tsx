import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LoadingState } from '@/components/ui/States';
import { txLink } from '@/lib/explorer';
import {
  despausarContrato,
  obtenerEstadoContrato,
  pausarContrato,
} from '../api';

interface TxConfirmada {
  accion: 'pausar' | 'despausar';
  txHash: string;
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  );
}

// Pausa/despausa del contrato con motivo registrado (E10-HU02): el botón
// pide el motivo por modal antes de mandar la transacción on-chain; el
// backend lo persiste off-chain con timestamp para trazabilidad de
// incidentes. Ruta ya restringida a ADMIN (ver routes/index.tsx).
export function ContratoPage() {
  const [pausado, setPausado] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [motivoError, setMotivoError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [ultimaTx, setUltimaTx] = useState<TxConfirmada | null>(null);

  async function cargar() {
    setError(null);
    try {
      const estado = await obtenerEstadoContrato();
      setPausado(estado.pausado);
    } catch {
      setError('No se pudo consultar el estado del contrato.');
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function abrirModal() {
    setMotivo('');
    setMotivoError(null);
    setModalAbierto(true);
  }

  async function confirmar() {
    if (!motivo.trim()) {
      setMotivoError('El motivo es obligatorio.');
      return;
    }
    setEnviando(true);
    setError(null);
    setUltimaTx(null);
    try {
      const accion = pausado ? 'despausar' : 'pausar';
      const { txHash } = pausado
        ? await despausarContrato(motivo.trim())
        : await pausarContrato(motivo.trim());
      setModalAbierto(false);
      setUltimaTx({ accion, txHash });
      await cargar();
    } catch {
      setError('No se pudo enviar la transacción. Intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  if (pausado === null && !error) {
    return <LoadingState label="Consultando estado del contrato…" />;
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-sm font-semibold text-eco-ink">
        Estado del contrato
      </h2>
      {error && <p className="text-xs text-eco-danger">{error}</p>}

      {ultimaTx && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-eco-org bg-eco-org-soft px-4 py-3 text-sm">
          <div>
            <Badge color="org">
              {ultimaTx.accion === 'pausar' ? 'Pausado' : 'Despausado'}
            </Badge>
            <p className="mt-1.5 text-eco-ink">
              Contrato {ultimaTx.accion === 'pausar' ? 'pausado' : 'despausado'}{' '}
              on-chain.
            </p>
            <a
              href={txLink(ultimaTx.txHash)}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block font-semibold text-eco-org"
            >
              Ver transacción en el explorador ↗
            </a>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setUltimaTx(null)}
            className="text-eco-ink2 hover:text-eco-ink"
          >
            ✕
          </button>
        </div>
      )}

      <Card className="max-w-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-eco-ink2">
              Contrato ECOToken
            </div>
            <div className="mt-1">
              <Badge color={pausado ? 'danger' : 'org'}>
                {pausado ? 'Pausado' : 'Activo'}
              </Badge>
            </div>
          </div>
          <Button color={pausado ? 'org' : 'danger'} onClick={abrirModal}>
            {pausado ? 'Despausar contrato' : 'Pausar contrato'}
          </Button>
        </div>
      </Card>

      <ConfirmModal
        open={modalAbierto}
        title={pausado ? 'Despausar el contrato' : 'Pausar el contrato'}
        danger={!pausado}
        description={
          <div className="flex flex-col gap-2">
            <p>
              Esta acción {pausado ? 'reanuda' : 'detiene'} mint, burn y
              transferencias del contrato mediante una transacción on-chain.
              Registrá el motivo del incidente.
            </p>
            <textarea
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                if (motivoError) setMotivoError(null);
              }}
              rows={3}
              placeholder="Motivo (obligatorio)"
              className="rounded-lg border border-eco-border-strong bg-eco-surface px-3 py-2 text-sm text-eco-ink"
            />
            {motivoError && (
              <p className="text-xs text-eco-danger">{motivoError}</p>
            )}
          </div>
        }
        confirmLabel={
          enviando ? (
            <span className="inline-flex items-center gap-2">
              <Spinner /> Enviando…
            </span>
          ) : (
            'Confirmar'
          )
        }
        confirmDisabled={enviando}
        onConfirm={confirmar}
        onClose={() => !enviando && setModalAbierto(false)}
      />
    </div>
  );
}
