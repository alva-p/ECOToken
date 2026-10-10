import { useEffect, useMemo, useState } from 'react';
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

const PALETA = [
  '#2f7d5b',
  '#3b82c4',
  '#e0a030',
  '#8a5cc2',
  '#d4604d',
  '#2fa4a4',
  '#7a8794',
];

const MESES = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];
const kg = (n: number) =>
  `${(Math.round(n * 10) / 10).toLocaleString('es-AR')} kg`;
const etiquetaMes = (mes: string) =>
  `${MESES[Number(mes.slice(5)) - 1]} ${mes.slice(2, 4)}`;

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <div className="text-xs font-semibold uppercase tracking-wide text-eco-ink2">
        {label}
      </div>
      <div className="mt-1.5 truncate text-2xl font-bold text-eco-ink">
        {value}
      </div>
      {hint && (
        <div className="mt-0.5 truncate text-xs text-eco-ink3">{hint}</div>
      )}
    </Card>
  );
}

function DistribucionMaterial({
  data,
  color,
}: {
  data: VolumenReciclado['porMaterial'];
  color: (m: string) => string;
}) {
  const total = data.reduce((s, m) => s + m.kg, 0) || 1;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-4 overflow-hidden rounded-full bg-eco-bg">
        {data.map((m) => (
          <div
            key={m.material}
            title={`${m.material}: ${kg(m.kg)}`}
            style={{
              width: `${(m.kg / total) * 100}%`,
              background: color(m.material),
            }}
          />
        ))}
      </div>
      <ul className="flex flex-col gap-2">
        {data.map((m) => (
          <li key={m.material} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: color(m.material) }}
            />
            <span className="flex-1 truncate text-eco-ink">{m.material}</span>
            <span className="text-eco-ink2">{kg(m.kg)}</span>
            <span className="w-12 text-right font-semibold text-eco-ink">
              {Math.round((m.kg / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Columnas apiladas por mes: cada segmento es un tipo de material.
function TendenciaMensual({
  data,
  materiales,
  color,
}: {
  data: VolumenReciclado['porMes'];
  materiales: string[];
  color: (m: string) => string;
}) {
  const totales = data.map((m) =>
    Object.values(m.kgPorMaterial).reduce((s, v) => s + v, 0),
  );
  const max = Math.max(...totales, 1);
  return (
    <div>
      <div className="flex h-48 items-end gap-2 overflow-x-auto sm:gap-4">
        {data.map((m, i) => (
          <div
            key={m.mes}
            className="flex h-full min-w-10 flex-1 flex-col justify-end gap-1"
          >
            <div className="text-center text-[11px] font-semibold text-eco-ink2">
              {kg(totales[i])}
            </div>
            <div
              className="flex flex-col-reverse overflow-hidden rounded-t"
              style={{ height: `${(totales[i] / max) * 85}%` }}
            >
              {materiales
                .filter((mat) => m.kgPorMaterial[mat])
                .map((mat) => (
                  <div
                    key={mat}
                    title={`${mat}: ${kg(m.kgPorMaterial[mat])}`}
                    style={{
                      height: `${(m.kgPorMaterial[mat] / totales[i]) * 100}%`,
                      background: color(mat),
                    }}
                  />
                ))}
            </div>
            <div className="text-center text-[11px] text-eco-ink2">
              {etiquetaMes(m.mes)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {materiales.map((mat) => (
          <span
            key={mat}
            className="flex items-center gap-1.5 text-xs text-eco-ink2"
          >
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: color(mat) }}
            />
            {mat}
          </span>
        ))}
      </div>
    </div>
  );
}

function GraficoBarras({ data }: { data: VolumenPorEmpresa[] }) {
  const max = Math.max(...data.map((e) => e.kgReciclados), 1);
  return (
    <div className="flex flex-col gap-3">
      {data.map((e) => (
        <div key={e.empresaId} className="flex items-center gap-3">
          <div className="w-24 shrink-0 truncate sm:w-36 text-xs text-eco-ink2">
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

// Dashboard de la municipalidad (E9-HU02): filtros por fecha y búsqueda de
// empresa, KPIs, distribución y tendencia mensual por material, ranking de
// empresas y tabla, exportable a CSV y a PDF (impresión del navegador).
export function MunicipioDashboardPage() {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [busqueda, setBusqueda] = useState('');
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

  const materiales = useMemo(
    () => volumen?.porMaterial.map((m) => m.material) ?? [],
    [volumen],
  );
  const color = (m: string) => PALETA[materiales.indexOf(m) % PALETA.length];
  const empresas = useMemo(
    () =>
      (volumen?.data ?? []).filter((e) =>
        e.razonSocial.toLowerCase().includes(busqueda.trim().toLowerCase()),
      ),
    [volumen, busqueda],
  );
  const totalAportes = volumen?.data.reduce((s, e) => s + e.aportes, 0) ?? 0;

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
        <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs font-semibold text-eco-ink2">
          Buscar empresa
          <input
            type="search"
            placeholder="Nombre de la empresa…"
            className={inputClass}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-2">
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
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Kpi label="Empresas activas" value={volumen.empresasActivas} />
              <Kpi
                label="Kg reciclados"
                value={volumen.totalKg.toLocaleString('es-AR')}
              />
              <Kpi
                label="Tokens ECO reconocidos"
                value={volumen.totalTokens.toLocaleString('es-AR')}
              />
              <Kpi
                label="Material principal"
                value={volumen.porMaterial[0]?.material ?? '—'}
                hint={`${totalAportes} aportes · ${kg(volumen.totalKg / (totalAportes || 1))} promedio`}
              />
            </div>

            {volumen.data.length === 0 ? (
              <Card className="py-10 text-center text-sm text-eco-ink2">
                No hay material reciclado registrado en este período.
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                  <Card className="p-5 lg:col-span-2">
                    <h2 className="mb-4 text-sm font-semibold text-eco-ink">
                      Materiales reciclados
                    </h2>
                    <DistribucionMaterial
                      data={volumen.porMaterial}
                      color={color}
                    />
                  </Card>
                  <Card className="p-5 lg:col-span-3">
                    <h2 className="mb-4 text-sm font-semibold text-eco-ink">
                      Tendencia mensual por material
                    </h2>
                    <TendenciaMensual
                      data={volumen.porMes}
                      materiales={materiales}
                      color={color}
                    />
                  </Card>
                </div>

                <Card className="p-5">
                  <h2 className="mb-4 text-sm font-semibold text-eco-ink">
                    Volumen por empresa
                  </h2>
                  {empresas.length === 0 ? (
                    <p className="text-sm text-eco-ink2">
                      Ninguna empresa coincide con la búsqueda.
                    </p>
                  ) : (
                    <GraficoBarras data={empresas} />
                  )}
                </Card>

                <Table
                  columns={[
                    { label: 'Empresa' },
                    { label: 'Kg reciclados', align: 'right' },
                    { label: 'Tokens ECO', align: 'right' },
                    { label: 'Aportes', align: 'right' },
                  ]}
                  rows={empresas.map((e) => ({
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
