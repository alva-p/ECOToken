import { useEffect, useState } from 'react';
import { Table } from '@/components/ui/Table';
import { LoadingState } from '@/components/ui/States';
import { misEntregas, type EntregaHistorial } from '../api';

const PERIODOS = [
  { dias: 0, label: 'Hoy' },
  { dias: 7, label: 'Últimos 7 días' },
  { dias: 30, label: 'Últimos 30 días' },
  { dias: 90, label: 'Últimos 3 meses' },
  { dias: 180, label: 'Últimos 6 meses' },
  { dias: 365, label: 'Últimos 12 meses' },
];

/** Historial de entregas de la cooperativa con selector de período. */
export function HistorialEntregas() {
  const [dias, setDias] = useState(0);
  const [entregas, setEntregas] = useState<EntregaHistorial[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    setEntregas(null);
    setError(null);
    misEntregas(dias)
      .then((e) => activo && setEntregas(e))
      .catch((e: Error) => activo && setError(e.message));
    return () => {
      activo = false;
    };
  }, [dias]);

  const periodo = PERIODOS.find((p) => p.dias === dias)!;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-eco-ink">
          Historial de entregas
        </h2>
        <select
          aria-label="Período"
          className="rounded-lg border border-eco-border-strong bg-eco-surface px-3 py-2 text-sm text-eco-ink focus:outline-none focus:ring-2 focus:ring-eco-coop/30"
          value={dias}
          onChange={(e) => setDias(Number(e.target.value))}
        >
          {PERIODOS.map((p) => (
            <option key={p.dias} value={p.dias}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : entregas === null ? (
        <LoadingState />
      ) : (
        <Table
          columns={[
            { label: 'Fecha', width: '110px' },
            { label: 'Empresa' },
            { label: 'Material' },
            { label: 'Peso', align: 'right', width: '90px' },
            { label: 'Tokens', align: 'right', width: '90px' },
          ]}
          rows={entregas.map((e) => ({
            cells: [
              new Date(e.fecha).toLocaleDateString('es-AR'),
              e.empresa,
              e.material,
              `${e.peso} kg`,
              e.tokens,
            ],
          }))}
          emptyLabel={`No registraste entregas (${periodo.label.toLowerCase()}).`}
        />
      )}
    </div>
  );
}
