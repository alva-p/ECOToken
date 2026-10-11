import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

export function MetricCard({
  label,
  value,
  caption,
  footer,
  icon,
}: {
  label: string;
  value: ReactNode;
  caption?: string;
  footer?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-1 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-eco-ink2">
        {label}
        {icon && <span className="text-eco-ink3">{icon}</span>}
      </div>
      <div className="truncate text-3xl font-bold tracking-tight text-eco-ink">
        {value}
      </div>
      {caption && <div className="text-xs text-eco-ink2">{caption}</div>}
      {footer && <div className="mt-1 text-xs text-eco-ink2">{footer}</div>}
    </Card>
  );
}
