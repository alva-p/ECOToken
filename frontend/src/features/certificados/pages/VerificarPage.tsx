import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/States';
import { Table } from '@/components/ui/Table';
import { txLink } from '@/lib/explorer';
import {
  verificarCertificado,
  type CertificadoVerificado,
  type ResultadoVerificacion,
} from '../api';

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

const fmtKg = (n: number) => `${n.toLocaleString('es-AR')} kg`;

// Desplegable con todos los aportes del mes: permite comprobar que el hash y
// los kg del certificado salen de esas entregas (cada una con su transacción).
function Aportes({ certificado }: { certificado: CertificadoVerificado }) {
  const { aportes } = certificado;
  const suma = Math.round(aportes.reduce((s, a) => s + a.kg, 0) * 100) / 100;
  const coincide = Math.abs(suma - certificado.kgReciclados) < 0.01;
  return (
    <details className="group mt-6 border-t border-eco-border pt-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-eco-ink">
        <span>
          Ver los {aportes.length} {aportes.length === 1 ? 'aporte' : 'aportes'}{' '}
          de este certificado
        </span>
        <span className="text-eco-org transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <p className="mb-3 mt-2 text-xs text-eco-ink2">
        Suma de los aportes: <b className="text-eco-ink">{fmtKg(suma)}</b>
        {coincide
          ? ' · coincide con los kg certificados.'
          : ` · difiere de los ${fmtKg(certificado.kgReciclados)} certificados.`}
      </p>
      <Table
        columns={[
          { label: 'Fecha', width: '5.5rem' },
          { label: 'Material' },
          { label: 'Kg', align: 'right', width: '5rem' },
          { label: 'Tokens', align: 'right', width: '5rem' },
          { label: 'Tx', align: 'right', width: '4rem' },
        ]}
        rows={aportes.map((a) => ({
          cells: [
            new Date(a.fecha).toLocaleDateString('es-AR'),
            a.material,
            a.kg.toLocaleString('es-AR'),
            a.tokens.toLocaleString('es-AR'),
            a.txHash ? (
              <a
                key="tx"
                href={`${txLink(a.txHash)}#eventlog`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-eco-org"
              >
                Ver ↗
              </a>
            ) : (
              <span key="tx" className="text-eco-ink3">
                —
              </span>
            ),
          ],
        }))}
        emptyLabel="Sin aportes registrados en el período."
      />
    </details>
  );
}

// Página pública sin login (E11-HU03): valida un certificado por hash o QR
// (E8-HU03). El QR del certificado apunta a /verificar/:hash.
export function VerificarPage() {
  const { hash: hashDeRuta } = useParams<{ hash: string }>();
  const navigate = useNavigate();
  const [hashInput, setHashInput] = useState(hashDeRuta ?? '');
  const [resultado, setResultado] = useState<ResultadoVerificacion | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function consultar(hash: string) {
    setLoading(true);
    setError(null);
    setResultado(null);
    verificarCertificado(hash)
      .then(setResultado)
      .catch(() => setError('No se pudo consultar el certificado.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (hashDeRuta) consultar(hashDeRuta);
  }, [hashDeRuta]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const hash = hashInput.trim();
    if (!hash) return;
    navigate(`/verificar/${encodeURIComponent(hash)}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-eco-bg px-6 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-eco-ink">
          Verificar certificado
        </h1>
        <p className="mt-2 max-w-md text-sm text-eco-ink2">
          Ingresá el hash del certificado (o escaneá el QR) para confirmar que
          es real.
        </p>
      </div>

      <Card className="w-full max-w-md p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field
            label="Hash de verificación"
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            placeholder="0x…"
          />
          <Button type="submit" color="org" disabled={!hashInput.trim()}>
            Verificar
          </Button>
        </form>
      </Card>

      {loading && <LoadingState label="Verificando…" />}
      {error && <p className="text-sm text-eco-danger">{error}</p>}

      {resultado && !resultado.valido && (
        <Card className="w-full max-w-md p-6 text-center">
          <Badge color="danger">No encontrado</Badge>
          <p className="mt-3 text-sm text-eco-ink2">
            Ese hash no corresponde a ningún certificado emitido por ECOToken.
          </p>
        </Card>
      )}

      {resultado?.valido && resultado.certificado && (
        <Card className="w-full max-w-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-eco-ink">
              Certificado de Impacto Ambiental
            </h2>
            <Badge color="coop">Certificado válido</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Dato label="Empresa">
              {resultado.certificado.empresa.razonSocial}
            </Dato>
            <Dato label="Período">
              {new Date(
                Date.UTC(
                  resultado.certificado.anio,
                  resultado.certificado.mes - 1,
                  1,
                ),
              ).toLocaleDateString('es-AR', {
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              })}
            </Dato>
            <Dato label="Posición en el ranking">
              #{resultado.certificado.posicion}
            </Dato>
            <Dato label="Kg reciclados">
              {resultado.certificado.kgReciclados.toLocaleString('es-AR')} kg
            </Dato>
            <Dato label="CO₂ evitado">
              {resultado.certificado.co2Evitado.toLocaleString('es-AR')} kg
            </Dato>
          </div>

          <Aportes certificado={resultado.certificado} />

          <div className="mt-6 flex flex-col gap-2 border-t border-eco-border pt-4">
            {resultado.certificado.urlPDF && (
              <a
                href={resultado.certificado.urlPDF}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-eco-org"
              >
                Ver certificado en PDF ↗
              </a>
            )}
            {resultado.certificado.txHashOnChain ? (
              <a
                href={txLink(resultado.certificado.txHashOnChain)}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-eco-org"
              >
                Ver transacción en el explorador ↗
              </a>
            ) : (
              <Badge color="muni">Registro on-chain pendiente</Badge>
            )}
          </div>
        </Card>
      )}

      <Link to="/" className="text-sm font-semibold text-eco-org">
        ← Volver al inicio
      </Link>
    </div>
  );
}
