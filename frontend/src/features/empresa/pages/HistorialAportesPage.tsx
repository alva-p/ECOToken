import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { LoadingState } from '@/components/ui/States';
import type { TipoMaterial } from '@/types';
import { listarMateriales, misAportes, type AporteHistorial } from '../api';

const LIMIT = 20;
const LIMIT_EXPORT = 500;

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR');
}

/** Escapa un valor para una celda CSV (RFC 4180: comillas dobles si hace falta). */
function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function descargarCsv(filas: AporteHistorial[]) {
  const encabezado = [
    'Fecha',
    'Validado por',
    'Material',
    'Peso (kg)',
    'Tokens',
  ];
  const lineas = filas.map((f) =>
    [formatFecha(f.fecha), f.cooperativa ?? '—', f.material, f.peso, f.tokens]
      .map(csvCell)
      .join(','),
  );
  const csv = [encabezado.join(','), ...lineas].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aportes-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Historial de aportes de la empresa (E6-HU02): tabla paginada, filtros por
// fecha y material, exportable a CSV.
export function HistorialAportesPage() {
  const [materiales, setMateriales] = useState<TipoMaterial[]>([]);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [tipoMaterialId, setTipoMaterialId] = useState('');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<AporteHistorial[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    listarMateriales()
      .then(setMateriales)
      .catch(() => setMateriales([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    misAportes({ page, limit: LIMIT, desde, hasta, tipoMaterialId })
      .then((res) => {
        setData(res.data);
        setTotal(res.total);
      })
      .catch(() => setError('No se pudo cargar el historial de aportes.'))
      .finally(() => setLoading(false));
  }, [page, desde, hasta, tipoMaterialId]);

  function aplicarFiltro<T>(setter: (v: T) => void) {
    return (v: T) => {
      setPage(1);
      setter(v);
    };
  }

  async function exportarCsv() {
    setExporting(true);
    try {
      const res = await misAportes({
        limit: LIMIT_EXPORT,
        desde,
        hasta,
        tipoMaterialId,
      });
      descargarCsv(res.data);
    } catch {
      setError('No se pudo exportar el historial a CSV.');
    } finally {
      setExporting(false);
    }
  }

  const totalPaginas = Math.max(1, Math.ceil(total / LIMIT));
  const inputClass =
    'rounded-lg border border-eco-border-strong bg-eco-surface px-3 py-2 text-sm text-eco-ink focus:outline-none focus:ring-2 focus:ring-eco-org/30';

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-wrap items-end gap-3 p-4">
        <label className="flex flex-col gap-1 text-xs font-semibold text-eco-ink2">
          Desde
          <input
            type="date"
            className={inputClass}
            value={desde}
            onChange={(e) => aplicarFiltro(setDesde)(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-eco-ink2">
          Hasta
          <input
            type="date"
            className={inputClass}
            value={hasta}
            onChange={(e) => aplicarFiltro(setHasta)(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-eco-ink2">
          Material
          <select
            className={inputClass}
            value={tipoMaterialId}
            onChange={(e) => aplicarFiltro(setTipoMaterialId)(e.target.value)}
          >
            <option value="">Todos</option>
            {materiales.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="button"
          color="org"
          variant="outline"
          className="ml-auto"
          onClick={exportarCsv}
          disabled={exporting || total === 0}
        >
          {exporting ? 'Exportando…' : 'Exportar a CSV'}
        </Button>
      </Card>

      {error && <p className="text-sm text-eco-danger">{error}</p>}

      {loading ? (
        <LoadingState label="Cargando aportes…" />
      ) : (
        <>
          <Table
            columns={[
              { label: 'Fecha' },
              { label: 'Validado por' },
              { label: 'Material' },
              { label: 'Peso (kg)', align: 'right' },
              { label: 'Tokens', align: 'right' },
              { label: '' },
            ]}
            rows={data.map((a) => ({
              cells: [
                formatFecha(a.fecha),
                a.cooperativa ?? '—',
                a.material,
                a.peso.toLocaleString('es-AR'),
                a.tokens.toLocaleString('es-AR'),
                <Link
                  key={a.id}
                  to={`/empresa/aportes/${a.id}`}
                  className="font-semibold text-eco-org"
                >
                  Ver comprobante
                </Link>,
              ],
            }))}
            emptyLabel="No hay aportes registrados con estos filtros."
          />

          {total > 0 && (
            <div className="flex items-center justify-between text-sm text-eco-ink2">
              <span>
                Página {page} de {totalPaginas} · {total} aportes
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= totalPaginas}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
