import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

type Align = 'center' | 'left' | 'right';
type Side = 'top' | 'bottom';

const ALIGN: Record<Align, string> = {
  center: 'left-1/2 -translate-x-1/2',
  left: 'left-0',
  right: 'right-0',
};

const SIDE: Record<Side, string> = {
  bottom: 'top-full mt-2',
  top: 'bottom-full mb-2',
};

/**
 * Tooltip personalizado (CSS-only, aparece al pasar el mouse). Reemplaza el
 * `title` nativo del navegador por un cartel estilizado y con contenido rico.
 */
export function Tooltip({
  children,
  content,
  align = 'center',
  side = 'bottom',
}: {
  children: ReactNode;
  content: ReactNode;
  align?: Align;
  side?: Side;
}) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cx(
          'pointer-events-none absolute z-30 w-max max-w-[16rem] rounded-xl border border-eco-border bg-eco-surface px-3 py-2 text-xs leading-relaxed text-eco-ink opacity-0 shadow-xl transition-opacity duration-150 group-hover/tt:opacity-100',
          ALIGN[align],
          SIDE[side],
        )}
      >
        {content}
      </span>
    </span>
  );
}
