import type { HTMLAttributes } from 'react';
import { cx } from '@/lib/cx';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'rounded-xl border border-eco-border bg-white p-4',
        className,
      )}
      {...props}
    />
  );
}
