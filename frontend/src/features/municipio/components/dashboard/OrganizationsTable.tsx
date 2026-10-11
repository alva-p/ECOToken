import { useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { cx } from '@/lib/cx';
import {
  fmtFecha,
  fmtKg,
  fmtNum,
  fmtPct,
  nombreMaterial,
  type OrganizacionAgg,
} from '../../dashboard/data';

type Columna =
  | 'nombre'
  | 'kg'
  | 'pct'
  | 'puntos'
  | 'aportes'
  | 'promedio'
  | 'materialPrincipal'
  | 'ultimoAporte';

const COLUMNAS: { key: Columna; label: string; numerica?: boolean }[] = [
  { key: 'nombre', label: 'Organización' },
  { key: 'kg', label: 'Kg reciclados', numerica: true },
  { key: 'pct', label: '% del total', numerica: true },
  { key: 'puntos', label: 'Puntos ECO', numerica: true },
  { key: 'aportes', label: 'Aportes', numerica: true },
  { key: 'promedio', label: 'Kg promedio', numerica: true },
  { key: 'materialPrincipal', label: 'Material principal' },
  { key: 'ultimoAporte', label: 'Último aporte' },
];

const POR_PAGINA = 10;

export function OrganizationsTable({
  data,
  onSelect,
}: {
  data: OrganizacionAgg[];
  onSelect: (id: string) => void;
}) {
  const [orden, setOrden] = useState<{ col: Columna; asc: boolean }>({
    col: 'kg',
    asc: false,
  });
  const [pagina, setPagina] = useState(0);

  const filas = [...data].sort((a, b) => {
    const x = a[orden.col];
    const y = b[orden.col];
    const c =
      typeof x === 'number' && typeof y === 'number'
        ? x - y
        : String(x).localeCompare(String(y), 'es');
    return orden.asc ? c : -c;
  });
  const paginas = Math.max(1, Math.ceil(filas.length / POR_PAGINA));
  const actual = Math.min(pagina, paginas - 1);
  const visibles = filas.slice(actual * POR_PAGINA, (actual + 1) * POR_PAGINA);

  const ordenar = (col: Columna) => {
    setOrden((o) => ({
      col,
      asc:
        o.col === col
          ? !o.asc
          : col === 'nombre' || col === 'materialPrincipal',
    }));
    setPagina(0);
  };

  const celda = (o: OrganizacionAgg, col: Columna) => {
    switch (col) {
      case 'nombre':
        return (
          <div className="min-w-0">
            <div className="truncate font-medium text-eco-ink">{o.nombre}</div>
            <div className="text-[11px] text-eco-ink3">CUIT {o.cuit}</div>
          </div>
        );
      case 'kg':
      case 'promedio':
        return fmtKg(o[col]);
      case 'pct':
        return fmtPct(o.pct);
      case 'puntos':
      case 'aportes':
        return fmtNum(o[col]);
      case 'materialPrincipal':
        return nombreMaterial(o.materialPrincipal);
      case 'ultimoAporte':
        return fmtFecha(o.ultimoAporte);
    }
  };

  return (
    <Card className="overflow-hidden p-0 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-sm font-semibold text-eco-ink">
          Organizaciones participantes
        </h2>
        <span className="text-xs text-eco-ink2">
          {fmtNum(data.length)} en total
        </span>
      </div>
      {data.length === 0 ? (
        <EmptyState label="Ninguna organización coincide con los filtros." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[60rem] text-sm">
            <thead className="bg-eco-bg text-[11px] uppercase tracking-wide text-eco-ink2">
              <tr>
                {COLUMNAS.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={
                      orden.col === c.key
                        ? orden.asc
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                    className={cx(
                      'px-4 py-3 font-semibold',
                      c.numerica ? 'text-right' : 'text-left',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => ordenar(c.key)}
                      className="inline-flex items-center gap-1 uppercase hover:text-eco-ink"
                    >
                      {c.label}
                      {orden.col === c.key &&
                        (orden.asc ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        ))}
                    </button>
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 print:hidden">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((o) => (
                <tr
                  key={o.id}
                  className="border-t border-eco-border hover:bg-eco-bg/60"
                >
                  {COLUMNAS.map((c) => (
                    <td
                      key={c.key}
                      className={cx(
                        'max-w-56 px-4 py-3 text-eco-ink',
                        c.numerica && 'text-right tabular-nums',
                      )}
                    >
                      {celda(o, c.key)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right print:hidden">
                    <Button
                      type="button"
                      variant="ghost"
                      color="org"
                      className="px-2 py-1 text-xs"
                      onClick={() => onSelect(o.id)}
                    >
                      Ver detalle
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {paginas > 1 && (
        <div className="flex items-center justify-between border-t border-eco-border px-5 py-3 text-xs text-eco-ink2 print:hidden">
          <span>
            Página {actual + 1} de {paginas}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              color="ink"
              className="px-3 py-1.5 text-xs"
              disabled={actual === 0}
              onClick={() => setPagina(actual - 1)}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              color="ink"
              className="px-3 py-1.5 text-xs"
              disabled={actual >= paginas - 1}
              onClick={() => setPagina(actual + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
