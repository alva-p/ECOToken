import {
  Building2,
  Recycle,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { Insight } from '../../dashboard/data';

const ICONOS = {
  sube: TrendingUp,
  baja: TrendingDown,
  material: Recycle,
  organizacion: Building2,
  participacion: Users,
};

/** Datos destacados calculados de los datos (sin IA ni conclusiones inventadas). */
export function EnvironmentalInsights({ items }: { items: Insight[] }) {
  if (items.length === 0) return null;
  return (
    <Card className="p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-eco-ink">
        Datos destacados
      </h2>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map((i) => {
          const Icon = ICONOS[i.icono];
          return (
            <li
              key={i.texto}
              className="flex items-start gap-3 rounded-lg bg-eco-bg p-3 text-sm text-eco-ink"
            >
              <span className="mt-0.5 rounded-md bg-eco-org-soft p-1.5 text-eco-org">
                <Icon size={16} aria-hidden />
              </span>
              {i.texto}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
