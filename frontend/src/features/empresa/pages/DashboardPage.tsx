import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { miSaldo } from '../api';

const POLL_MS = 30_000;

// Página inicial del panel empresa (E11-HU03). El historial de aportes lo
// conecta E6-HU02.
export function EmpresaDashboardPage() {
  const [saldo, setSaldo] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [sinConexion, setSinConexion] = useState(false);

  useEffect(() => {
    let cancelado = false;

    async function cargarSaldo() {
      try {
        const { saldo } = await miSaldo();
        if (cancelado) return;
        setSaldo(saldo);
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

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="text-xs font-semibold uppercase tracking-wide text-eco-ink2">
          Saldo actual
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-3xl font-bold tracking-tight text-eco-ink">
            {cargando ? '—' : saldo} ECO
          </span>
          {sinConexion && <Badge color="danger">Sin conexión</Badge>}
        </div>
      </Card>
      <div>
        <h2 className="mb-3 text-sm font-semibold text-eco-ink">
          Últimos aportes
        </h2>
        <Table
          columns={[
            { label: 'Fecha' },
            { label: 'Material' },
            { label: 'Peso' },
            { label: 'Tokens', align: 'right' },
          ]}
          rows={[]}
          emptyLabel="Todavía no registraste aportes."
        />
      </div>
    </div>
  );
}
