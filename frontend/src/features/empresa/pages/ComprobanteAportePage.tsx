import { useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/States';
import { txLink } from '@/lib/explorer';
import { comprobanteAporte, type ComprobanteAporte } from '../api';

function Dato({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-eco-ink2">
        {label}
      </div>
      <div className="mt-1 text-sm text-eco-ink">{children}</div>
    </div>
  );
}

// Comprobante digital de un aporte puntual (E5-HU03), accesible desde el
// historial (E6-HU02).
export function ComprobanteAportePage() {
  const { id } = useParams<{ id: string }>();
  const [comprobante, setComprobante] = useState<ComprobanteAporte | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    comprobanteAporte(id)
      .then(setComprobante)
      .catch(() => setError('No se pudo cargar el comprobante.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/empresa/aportes"
        className="text-sm font-semibold text-eco-org"
      >
        ← Volver al historial
      </Link>

      {loading && <LoadingState label="Cargando comprobante…" />}
      {error && <p className="text-sm text-eco-danger">{error}</p>}

      {comprobante && (
        <Card className="max-w-lg p-6">
          <h2 className="mb-5 text-sm font-semibold text-eco-ink">
            Comprobante de aporte
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Dato label="Fecha">
              {new Date(comprobante.fecha).toLocaleDateString('es-AR')}
            </Dato>
            <Dato label="Cooperativa">{comprobante.cooperativa ?? '—'}</Dato>
            <Dato label="Material">{comprobante.material}</Dato>
            <Dato label="Peso">{comprobante.peso.toLocaleString('es-AR')} kg</Dato>
            <Dato label="Tokens">{comprobante.tokens.toLocaleString('es-AR')} ECO</Dato>
            <Dato label="Estado">{comprobante.estado}</Dato>
          </div>

          <div className="mt-6 border-t border-eco-border pt-4">
            {comprobante.txHash ? (
              <a
                href={txLink(comprobante.txHash)}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-eco-org"
              >
                Ver transacción de acuñación en el explorador ↗
              </a>
            ) : (
              <Badge color="coop">Acuñación pendiente</Badge>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
