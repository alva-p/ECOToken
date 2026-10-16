import { Award } from 'lucide-react';
import { Card } from '@/components/ui/Card';

type Nivel = {
  nombre: string;
  min: number;
  color: string;
  bg: string;
  ring: string;
};

// Umbrales de ECO acumulados por nivel (gamificación simple).
const NIVELES: Nivel[] = [
  {
    nombre: 'Bronce',
    min: 0,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    ring: 'ring-amber-200',
  },
  {
    nombre: 'Plata',
    min: 500,
    color: 'text-slate-500',
    bg: 'bg-slate-100',
    ring: 'ring-slate-200',
  },
  {
    nombre: 'Oro',
    min: 1500,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    ring: 'ring-yellow-200',
  },
  {
    nombre: 'Platino',
    min: 3000,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    ring: 'ring-sky-200',
  },
];

export function NivelAmbientalCard({ tokens }: { tokens: number | null }) {
  const t = tokens ?? 0;
  let idx = 0;
  for (let i = 0; i < NIVELES.length; i++) if (t >= NIVELES[i].min) idx = i;
  const nivel = NIVELES[idx];
  const siguiente = NIVELES[idx + 1];
  const progreso = siguiente
    ? Math.min(
        100,
        Math.round(((t - nivel.min) / (siguiente.min - nivel.min)) * 100),
      )
    : 100;
  const faltan = siguiente ? siguiente.min - t : 0;

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-4 ${nivel.bg} ${nivel.ring}`}
        >
          <Award className={nivel.color} size={24} />
        </span>
        <div>
          <p className="text-xs text-eco-ink2">Nivel ambiental</p>
          <p className={`text-lg font-bold ${nivel.color}`}>{nivel.nombre}</p>
        </div>
        <span className="ml-auto text-right">
          <span className="block text-lg font-bold text-eco-ink">
            {tokens === null ? '—' : t.toLocaleString('es-AR')}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-eco-ink2">
            ECO acumulados
          </span>
        </span>
      </div>

      <div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-eco-bg">
          <div
            className="h-full rounded-full bg-eco-org transition-all duration-700"
            style={{ width: `${progreso}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-eco-ink2">
          {siguiente
            ? `Te faltan ${faltan.toLocaleString('es-AR')} ECO para ${siguiente.nombre}`
            : '¡Nivel máximo alcanzado! 🏆'}
        </p>
      </div>
    </Card>
  );
}
