import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

type BadgeColor = 'ink' | 'org' | 'coop' | 'muni' | 'danger';

const BADGE_CLASSES: Record<BadgeColor, string> = {
  ink: 'bg-eco-bg text-eco-ink2',
  org: 'bg-eco-org-soft text-eco-org',
  coop: 'bg-eco-coop-soft text-eco-coop',
  muni: 'bg-eco-muni-soft text-eco-muni',
  danger: 'bg-red-50 text-eco-danger',
};

export function Badge({
  color = 'ink',
  children,
}: {
  color?: BadgeColor;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wide',
        BADGE_CLASSES[color],
      )}
    >
      {children}
    </span>
  );
}
