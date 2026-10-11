import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { LoadingState } from '@/components/ui/States';
import { txLogsLink } from '@/lib/explorer';
import {
  fmtKg,
  fmtNum,
  nombreMaterial,
} from '@/features/municipio/dashboard/data';
import { misEntregas, type EntregaHistorial } from '../api';
import { hoyArt } from '../dashboard/data';

const PERIODOS = [
  { dias: 0, label: 'Hoy' },
  { dias: 7, label: 'Últimos 7 días' },
  { dias: 30, label: 'Últimos 30 días' },
  { dias: 90, label: 'Últimos 3 meses' },
  { dias: 180, label: 'Últimos 6 meses' },
  { dias: 365, label: 'Últimos 12 meses' },
];
// Con fechas personalizadas se trae el máximo del endpoint y se filtra acá.
const DIAS_MAX = 366;

const control =
  'rounded-lg border border-eco-border-strong bg-eco-surface px-3 py-2 text-sm text-eco-ink focus:outline-none focus:ring-2 focus:ring-eco-coop/30';

const diaArt = (iso: string) =>
  new Date(Date.parse(iso) - 3 * 3600_000).toISOString().slice(0, 10);

/** Historial de entregas de la cooperativa: período, organización, material, fechas y búsqueda. */
export function HistorialEntregas() {
  const [dias, setDias] = useState(30);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [organizacion, setOrganizacion] = useState('');
  const [material, setMaterial] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [entregas, setEntregas] = useState<EntregaHistorial[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const personalizado = desde !== '' || hasta !== '';
  const diasPedidos = personalizado ? DIAS_MAX : dias;

  useEffect(() => {
    let activo = true;
    setEntregas(null);
    setError(null);
    misEntregas(diasPedidos)
      .then((e) => activo && setEntregas(e))
      .catch(() => activo && setError('No se pudo cargar el historial.'));
    return () => {
      activo = false;
    };
  }, [diasPedidos]);

  const opciones = useMemo(() => {
    const orgs = new Map<string, string>();
    const mats = new Set<string>();
    for (const e of entregas ?? []) {
      orgs.set(e.empresaId, e.empresa);
      mats.add(e.material);
    }
    return {
      orgs: [...orgs].sort((a, b) => a[1].localeCompare(b[1], 'es')),
      mats: [...mats].sort(),
    };
  }, [entregas]);

  const q = busqueda.trim().toLowerCase();
  const filtradas = (entregas ?? []).filter((e) => {
    const d = diaArt(e.fecha);
    return (
      (!desde || d >= desde) &&
      (!hasta || d <= hasta) &&
      (!organizacion || e.empresaId === organizacion) &&
      (!material || e.material === material) &&
      (!q || e.empresa.toLowerCase().includes(q))
    );
  });
  const kg = filtradas.reduce((s, e) => s + e.peso, 0);
  const hayFiltros = personalizado || organizacion || material || busqueda;

  function limpiar() {
    setDesde('');
    setHasta('');
    setOrganizacion('');
    setMaterial('');
    setBusqueda('');
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-wrap items-end gap-3 p-4">
        <label className="flex flex-col gap-1 text-xs font-semibold text-eco-ink2">
          Período
          <select
            className={control}
            value={dias}
            disabled={personalizado}
            onChange={(e) => setDias(Number(e.target.value))}
          >
            {PERIODOS.map((p) => (
              <option key={p.dias} value={p.dias}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-eco-ink2">
          Desde
          <input
            type="date"
            className={control}
            value={desde}
            max={hasta || hoyArt()}
            onChange={(e) => setDesde(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-eco-ink2">
          Hasta
          <input
            type="date"
            className={control}
            value={hasta}
            min={desde || undefined}
            max={hoyArt()}
            onChange={(e) => setHasta(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-eco-ink2">
          Organización
          <select
            className={control}
            value={organizacion}
            onChange={(e) => setOrganizacion(e.target.value)}
          >
            <option value="">Todas</option>
            {opciones.orgs.map(([id, nombre]) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-eco-ink2">
          Material
          <select
            className={control}
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          >
            <option value="">Todos</option>
            {opciones.mats.map((m) => (
              <option key={m} value={m}>
                {nombreMaterial(m)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs font-semibold text-eco-ink2">
          Buscar
          <input
            type="search"
            className={control}
            placeholder="Buscar organización…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </label>
        {hayFiltros && (
          <Button type="button" variant="ghost" color="coop" onClick={limpiar}>
            Limpiar filtros
          </Button>
        )}
      </Card>

      {error ? (
        <p className="text-sm text-eco-danger">{error}</p>
      ) : entregas === null ? (
        <LoadingState />
      ) : (
        <>
          <p className="text-sm text-eco-ink2">
            <strong className="text-eco-ink">{fmtNum(filtradas.length)}</strong>{' '}
            {filtradas.length === 1 ? 'entrega' : 'entregas'} ·{' '}
            <strong className="text-eco-ink">{fmtKg(kg)}</strong>
          </p>
          <Table
            columns={[
              { label: 'Fecha', width: '110px' },
              { label: 'Organización' },
              { label: 'Material' },
              { label: 'Peso', align: 'right', width: '90px' },
              { label: 'ECO', align: 'right', width: '90px' },
              { label: 'Comprobante', align: 'right', width: '120px' },
            ]}
            rows={filtradas.map((e) => ({
              cells: [
                new Date(e.fecha).toLocaleDateString('es-AR', {
                  timeZone: 'America/Argentina/Buenos_Aires',
                }),
                e.empresa,
                nombreMaterial(e.material),
                fmtKg(e.peso),
                fmtNum(e.tokens),
                e.txHash ? (
                  <a
                    key="c"
                    href={txLogsLink(e.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-eco-org hover:underline"
                  >
                    Ver ↗
                  </a>
                ) : (
                  <span key="c" className="text-xs text-eco-ink2">
                    Pendiente
                  </span>
                ),
              ],
            }))}
            emptyLabel="No hay entregas con estos filtros."
          />
        </>
      )}
    </div>
  );
}
