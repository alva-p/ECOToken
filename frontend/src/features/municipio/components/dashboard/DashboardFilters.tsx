import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cx } from '@/lib/cx';
import {
  COMPARACIONES,
  PRESETS,
  nombreMaterial,
  rangoPreset,
  type Filtros,
  type ModoComparacion,
  type Preset,
} from '../../dashboard/data';

const input =
  'rounded-lg border border-eco-border-strong bg-white px-3 py-2 text-sm text-eco-ink focus:outline-none focus:ring-2 focus:ring-eco-org/30';
const etiqueta = 'flex flex-col gap-1 text-xs font-semibold text-eco-ink2';

export function DashboardFilters({
  filtros,
  onChange,
  materiales,
  organizaciones,
  comparacion,
  onComparacion,
  puedeComparar,
  onExportCsv,
  onExportExcel,
  exportDisabled,
}: {
  filtros: Filtros;
  onChange: (f: Filtros) => void;
  materiales: string[];
  organizaciones: string[];
  comparacion: ModoComparacion;
  onComparacion: (m: ModoComparacion) => void;
  puedeComparar: boolean;
  onExportCsv: () => void;
  onExportExcel: () => void;
  exportDisabled: boolean;
}) {
  const set = (parcial: Partial<Filtros>) =>
    onChange({ ...filtros, ...parcial });
  const presetActivo = (Object.keys(PRESETS) as Preset[]).find((p) => {
    const r = rangoPreset(p);
    return r.desde === filtros.desde && r.hasta === filtros.hasta;
  });
  const hayFiltros =
    filtros.desde || filtros.hasta || filtros.material || filtros.busqueda;

  return (
    <div className="sticky top-0 z-20 -mx-4 -mt-4 border-b border-eco-border bg-eco-bg/95 px-4 pb-3 pt-4 backdrop-blur sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6 print:static print:hidden">
      <div className="flex flex-wrap items-end gap-3">
        <fieldset className="flex flex-wrap items-end gap-2">
          <legend className="sr-only">Período</legend>
          <label className={etiqueta}>
            Desde
            <input
              type="date"
              className={input}
              value={filtros.desde}
              max={filtros.hasta || undefined}
              onChange={(e) => set({ desde: e.target.value })}
            />
          </label>
          <label className={etiqueta}>
            Hasta
            <input
              type="date"
              className={input}
              value={filtros.hasta}
              min={filtros.desde || undefined}
              onChange={(e) => set({ hasta: e.target.value })}
            />
          </label>
        </fieldset>
        <label className={etiqueta}>
          Material
          <select
            className={input}
            value={filtros.material}
            onChange={(e) => set({ material: e.target.value })}
          >
            <option value="">Todos los materiales</option>
            {materiales.map((m) => (
              <option key={m} value={m}>
                {nombreMaterial(m)}
              </option>
            ))}
          </select>
        </label>
        <label className={cx(etiqueta, 'min-w-56 flex-1')}>
          Organización
          <span className="relative">
            <Search
              size={15}
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-eco-ink3"
            />
            <input
              type="search"
              list="dashboard-organizaciones"
              placeholder="Nombre, razón social o CUIT…"
              className={cx(input, 'w-full pl-9')}
              value={filtros.busqueda}
              onChange={(e) => set({ busqueda: e.target.value })}
            />
            <datalist id="dashboard-organizaciones">
              {organizaciones.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
          </span>
        </label>
        {puedeComparar && (
          <label className={etiqueta}>
            Comparar con
            <select
              className={input}
              value={comparacion}
              onChange={(e) => onComparacion(e.target.value as ModoComparacion)}
            >
              {(Object.keys(COMPARACIONES) as ModoComparacion[]).map((m) => (
                <option key={m} value={m}>
                  {COMPARACIONES[m]}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            color="ink"
            onClick={() => window.print()}
            disabled={exportDisabled}
          >
            Exportar PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            color="ink"
            onClick={onExportCsv}
            disabled={exportDisabled}
          >
            Exportar CSV
          </Button>
          <Button
            type="button"
            color="org"
            onClick={onExportExcel}
            disabled={exportDisabled}
          >
            Exportar Excel
          </Button>
        </div>
      </div>
      <div
        className="mt-3 flex flex-wrap items-center gap-1.5"
        role="group"
        aria-label="Períodos rápidos"
      >
        {(Object.keys(PRESETS) as Preset[]).map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={presetActivo === p}
            onClick={() => set(rangoPreset(p))}
            className={cx(
              'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
              presetActivo === p
                ? 'border-eco-org bg-eco-org text-white'
                : 'border-eco-border-strong bg-white text-eco-ink2 hover:bg-eco-org-soft hover:text-eco-org',
            )}
          >
            {PRESETS[p]}
          </button>
        ))}
        {hayFiltros && (
          <button
            type="button"
            onClick={() =>
              onChange({ desde: '', hasta: '', material: '', busqueda: '' })
            }
            className="ml-auto text-xs font-semibold text-eco-ink2 underline-offset-2 hover:text-eco-ink hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
