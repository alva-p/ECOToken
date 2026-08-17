import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { EmptyState } from './States';

interface TableColumn {
  label: string;
  width?: string;
  align?: 'left' | 'right';
}

interface TableRow {
  cells: ReactNode[];
}

interface TableProps {
  columns: TableColumn[];
  rows: TableRow[];
  emptyLabel?: string;
}

export function Table({
  columns,
  rows,
  emptyLabel = 'Sin datos para mostrar.',
}: TableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-eco-border bg-white">
      <div className="flex bg-eco-bg px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-eco-ink2">
        {columns.map((c) => (
          <div
            key={c.label}
            style={{ width: c.width }}
            className={cx('flex-1 pr-3', c.align === 'right' && 'text-right')}
          >
            {c.label}
          </div>
        ))}
      </div>
      {rows.length === 0 ? (
        <EmptyState label={emptyLabel} />
      ) : (
        rows.map((row, i) => (
          <div
            key={i}
            className="flex items-center border-t border-eco-border px-4 py-3 text-sm text-eco-ink"
          >
            {row.cells.map((cell, j) => (
              <div
                key={j}
                style={{ width: columns[j]?.width }}
                className={cx(
                  'flex-1 pr-3',
                  columns[j]?.align === 'right' && 'text-right',
                )}
              >
                {cell}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
