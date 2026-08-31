import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { LoadingState } from '@/components/ui/States';
import {
  obtenerVolumen,
  type VolumenPorEmpresa,
  type VolumenReciclado,
} from '../api';

const inputClass =
  'rounded-lg border border-eco-border-strong bg-eco-surface px-3 py-2 text-sm text-eco-ink focus:outline-none focus:ring-2 focus:ring-eco-muni/30';

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function descargarCsv(volumen: VolumenReciclado) {
  const encabezado = ['Empresa', 'Kg reciclados', 'Tokens ECO', 'Aportes'];
  const lineas = volumen.data.map((e) =>
    [e.razonSocial, e.kgReciclados, e.tokensAcumulados, e.aportes]
      .map(csvCell)
      .join(','),
  );
  const csv = [encabezado.join(','), ...lineas].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `volumen-reciclado-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function GraficoBarras({ data }: { data: VolumenPorEmpresa[] }) {
  const max = Math.max(...data.map((e) => e.kgReciclados), 1);
  return (
    <div className="flex flex-col gap-3">
      {data.map((e) => (
        <div key={e.empresaId} className="flex items-center gap-3">
          <div className="w-36 shrink-0 truncate text-xs text-eco-ink2">
            {e.razonSocial}
          </div>
          <div className="h-5 flex-1 overflow-hidden rounded bg-eco-muni-soft">
            <div
              className="h-full rounded bg-eco-muni"
              style={{ width: `${(e.kgReciclados / max) * 100}%` }}
            />
          </div>
          <div className="w-20 shrink-0 text-right text-xs font-semibold text-eco-ink">
            {e.kgReciclados.toLocaleString('es-AR')} kg
          </div>
        </div>
      ))}
    </div>
  );
}

// Volumen reciclado por canal empresarial en un período (E9-HU02): filtros
// por fecha, tarjetas de resumen, gráfico de barras y tabla, exportable a
// CSV y a PDF (impresión del navegador).
export function MunicipioDashboardPage() {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [volumen, setVolumen] = useState<VolumenReciclado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    obtenerVolumen({ desde, hasta })
      .then(setVolumen)
      .catch(() => setError('No se pudo cargar el volumen reciclado.'))
      .finally(() => setLoading(false));
  }, [desde, hasta]);

  return (
    <div className="flex flex-col gap-5 print:gap-3">
      <Card className="flex flex-wrap items-end gap-3 p-4 print:hidden">
        <label className="flex flex-col gap-1 text-xs font-semibold text-eco-ink2">
          Desde
          <input
            type="date"
            className={inputClass}
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-eco-ink2">
          Hasta
          <input
            type="date"
            className={inputClass}
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </label>
        <div className="ml-auto flex gap-2">
          <Button
            type="button"
            variant="outline"
            color="muni"
            onClick={() => window.print()}
            disabled={!volumen || volumen.data.length === 0}
          >
            Exportar a PDF
          </Button>
          <Button
            type="button"
            color="muni"
            onClick={() => volumen && descargarCsv(volumen)}
            disabled={!volumen || volumen.data.length === 0}
          >
            Exportar a CSV
          </Button>
        </div>
      </Card>

      {error && <p className="text-sm text-eco-danger">{error}</p>}

      {loading ? (
        <LoadingState label="Cargando volumen reciclado…" />
      ) : (
        volumen && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <div className="text-xs font-semibold uppercase tracking-wide text-eco-ink2">
                  Empresas activas
                </div>
                <div className="mt-1.5 text-2xl font-bold text-eco-ink">
                  {volumen.empresasActivas}
                </div>
              </Card>
              <Card>
                <div className="text-xs font-semibold uppercase tracking-wide text-eco-ink2">
                  Kg reciclados
                </div>
                <div className="mt-1.5 text-2xl font-bold text-eco-ink">
                  {volumen.totalKg.toLocaleString('es-AR')}
                </div>
              </Card>
              <Card>
                <div className="text-xs font-semibold uppercase tracking-wide text-eco-ink2">
                  Tokens ECO reconocidos
                </div>
                <div className="mt-1.5 text-2xl font-bold text-eco-ink">
                  {volumen.totalTokens.toLocaleString('es-AR')}
                </div>
              </Card>
            </div>

            {volumen.data.length === 0 ? (
              <Card className="py-10 text-center text-sm text-eco-ink2">
                No hay material reciclado registrado en este período.
              </Card>
            ) : (
              <>
                <Card className="p-5">
                  <h2 className="mb-4 text-sm font-semibold text-eco-ink">
                    Volumen por empresa
                  </h2>
                  <GraficoBarras data={volumen.data} />
                </Card>

                <Table
                  columns={[
                    { label: 'Empresa' },
                    { label: 'Kg reciclados', align: 'right' },
                    { label: 'Tokens ECO', align: 'right' },
                    { label: 'Aportes', align: 'right' },
                  ]}
                  rows={volumen.data.map((e) => ({
                    cells: [
                      e.razonSocial,
                      e.kgReciclados.toLocaleString('es-AR'),
                      e.tokensAcumulados.toLocaleString('es-AR'),
                      e.aportes,
                    ],
                  }))}
                />
              </>
            )}
          </>
        )
      )}
    </div>
  );
}
