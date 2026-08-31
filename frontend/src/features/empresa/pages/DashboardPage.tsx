import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { miSaldo, misAportes, type AporteHistorial } from '../api';

const POLL_MS = 30_000;
const DIAS_ULTIMOS_APORTES = 7;

function hace7Dias(): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - DIAS_ULTIMOS_APORTES);
  return fecha.toISOString().slice(0, 10);
}

// Página inicial del panel empresa (E11-HU03). El historial completo lo
// muestra E6-HU02.
export function EmpresaDashboardPage() {
  const [saldo, setSaldo] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [sinConexion, setSinConexion] = useState(false);

  const [ultimosAportes, setUltimosAportes] = useState<AporteHistorial[]>([]);
  const [cargandoAportes, setCargandoAportes] = useState(true);

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

  useEffect(() => {
    misAportes({ desde: hace7Dias(), limit: 20 })
      .then((res) => setUltimosAportes(res.data))
      .catch(() => setUltimosAportes([]))
      .finally(() => setCargandoAportes(false));
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
          Últimos aportes (últimos {DIAS_ULTIMOS_APORTES} días)
        </h2>
        <Table
          columns={[
            { label: 'Fecha' },
            { label: 'Material' },
            { label: 'Peso (kg)' },
            { label: 'Tokens', align: 'right' },
          ]}
          rows={ultimosAportes.map((a) => ({
            cells: [
              new Date(a.fecha).toLocaleDateString('es-AR'),
              a.material,
              a.peso.toLocaleString('es-AR'),
              a.tokens.toLocaleString('es-AR'),
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
