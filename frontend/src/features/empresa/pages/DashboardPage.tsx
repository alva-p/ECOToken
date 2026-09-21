import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { addressLink } from '@/lib/explorer';
import { miSaldo, misAportes, type AporteHistorial } from '../api';

const POLL_MS = 30_000;
const DIAS_ULTIMOS_APORTES = 7;

function hace7Dias(): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - DIAS_ULTIMOS_APORTES);
  return fecha.toISOString().slice(0, 10);
}

// Panel centralizado para el rol Empresa (E11-HU05). Integra de manera centralizada
// el saldo de tokens ECO (E6-HU01), accesos al historial de aportes (E6-HU02) y
// acceso a los comprobantes de entrega (E5-HU03).
export function EmpresaDashboardPage() {
  const [saldo, setSaldo] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [sinConexion, setSinConexion] = useState(false);

  const [ultimosAportes, setUltimosAportes] = useState<AporteHistorial[]>([]);
  const [cargandoAportes, setCargandoAportes] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function cargarSaldo() {
      try {
        const { saldo, walletAddress } = await miSaldo();
        if (cancelado) return;
        setSaldo(saldo);
        setWalletAddress(walletAddress);
        setSinConexion(false);
      } catch {
        if (!cancelado) setSinConexion(true);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargarSaldo();
    const interval = setInterval(cargarSaldo, POLL_MS);
    return () => {
      cancelado = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    misAportes({ desde: hace7Dias(), limit: 20 })
      .then((res) => setUltimosAportes(res.data))
      .catch(() => setUltimosAportes([]))
      .finally(() => setCargandoAportes(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Accesos centralizados a funcionalidades del rol Empresa */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Card Saldo ECO */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-eco-ink2">
                Saldo actual ECO
              </span>
              {sinConexion ? (
                <Badge color="danger">Sin conexión</Badge>
              ) : (
                <Badge color="org">En tiempo real</Badge>
              )}
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-eco-ink">
                {cargando ? '—' : (saldo?.toLocaleString('es-AR') ?? 0)}
              </span>
              <span className="text-sm font-semibold text-eco-org">ECO</span>
            </div>
            <p className="mt-1 text-xs text-eco-ink2">
              Tokens ambientales emitidos en Sepolia.
            </p>
          </div>
          {walletAddress && (
            <div className="mt-4 border-t border-eco-border pt-3">
              <div className="text-[11px] font-medium text-eco-ink2">
                Billetera custodial
              </div>
              <a
                href={addressLink(walletAddress)}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 inline-block font-mono text-xs text-eco-ink hover:text-eco-org"
                title={walletAddress}
              >
                {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)} ↗
              </a>
            </div>
          )}
        </Card>

        {/* Card Historial de Aportes */}
        <Card className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-eco-ink2">
              Historial de aportes
            </span>
            <div className="mt-2 text-sm font-semibold text-eco-ink">
              Trazabilidad de reciclaje
            </div>
            <p className="mt-1 text-xs text-eco-ink2">
              Consultá todos los aportes de material recibidos por cooperativas
              y descargá el reporte en CSV.
            </p>
          </div>
          <div className="mt-4 border-t border-eco-border pt-3">
            <Link
              to="/empresa/aportes"
              className="inline-flex items-center text-xs font-semibold text-eco-org hover:underline"
            >
              Ir al historial completo →
            </Link>
          </div>
        </Card>

        {/* Card Comprobantes Digitales */}
        <Card className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-eco-ink2">
              Comprobantes digitales
            </span>
            <div className="mt-2 text-sm font-semibold text-eco-ink">
              Respaldo auditable
            </div>
            <p className="mt-1 text-xs text-eco-ink2">
              Accedé al comprobante y a la transacción de acuñación en la
              blockchain por cada entrega realizada.
            </p>
          </div>
          <div className="mt-4 border-t border-eco-border pt-3">
            <Link
              to="/empresa/aportes"
              className="inline-flex items-center text-xs font-semibold text-eco-org hover:underline"
            >
              Consultar comprobantes →
            </Link>
          </div>
        </Card>
      </div>

      {/* Tabla de últimos aportes con acceso a comprobantes */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-eco-ink">
            Últimos aportes (últimos {DIAS_ULTIMOS_APORTES} días)
          </h2>
          <Link
            to="/empresa/aportes"
            className="text-xs font-semibold text-eco-org hover:underline"
          >
            Ver todos los aportes →
          </Link>
        </div>
        <Table
          columns={[
            { label: 'Fecha' },
            { label: 'Material' },
            { label: 'Peso (kg)', align: 'right' },
            { label: 'Tokens', align: 'right' },
            { label: 'Comprobante', align: 'right' },
          ]}
          rows={ultimosAportes.map((a) => ({
            cells: [
              new Date(a.fecha).toLocaleDateString('es-AR'),
              a.material,
              a.peso.toLocaleString('es-AR'),
              a.tokens.toLocaleString('es-AR'),
              <Link
                key={a.id}
                to={`/empresa/aportes/${a.id}`}
                className="font-semibold text-eco-org hover:underline"
              >
                Ver comprobante →
              </Link>,
            ],
          }))}
          emptyLabel={
            cargandoAportes
              ? 'Cargando…'
              : `Todavía no registraste aportes en los últimos ${DIAS_ULTIMOS_APORTES} días.`
          }
        />
      </div>
    </div>
  );
}
