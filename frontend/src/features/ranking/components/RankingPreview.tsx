import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { cx } from '@/lib/cx';

export interface RankingSummaryItem {
  label: string;
  value: string;
  sub: string;
}

export interface RankingPodiumItem {
  rank: 1 | 2 | 3;
  name: string;
  categoria: string;
  kg: number;
  eco: number;
}

interface RankingPreviewProps {
  periodo: string;
  summary: RankingSummaryItem[];
  podium: RankingPodiumItem[];
}

// Componente reutilizable (E11-HU04): recibe los datos por props, acá se lo llama
// con datos de ejemplo. E7-HU03 lo conecta al ranking real del backend sin
// reconstruirlo. Diseño de referencia: doc/assets/ECOToken/screens/ranking-landing.jsx.
export function RankingPreview({
  periodo,
  summary,
  podium,
}: RankingPreviewProps) {
  const ordered = [podium[1], podium[0], podium[2]];

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-eco-org">
        {periodo}
      </div>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-eco-ink sm:text-3xl">
        Así recicla Villa María este mes
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {summary.map((s) => (
          <Card key={s.label}>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-eco-ink2">
              {s.label}
            </div>
            <div className="mt-1.5 text-2xl font-bold tracking-tight text-eco-ink">
              {s.value}
            </div>
            <div className="mt-1 text-xs text-eco-ink2">{s.sub}</div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 items-end gap-5 sm:grid-cols-3">
        {ordered.map((item) => (
          <PodiumCard key={item.rank} item={item} />
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link to="/ranking" className="text-sm font-semibold text-eco-org">
          Ver ranking completo →
        </Link>
      </div>
    </div>
  );
}

const MEDAL_BG: Record<1 | 2 | 3, string> = {
  1: 'bg-[#C9A227]',
  2: 'bg-[#9AA3AA]',
  3: 'bg-[#B8742E]',
};

function PodiumCard({ item }: { item: RankingPodiumItem }) {
  const isFirst = item.rank === 1;
  return (
    <div
      className={cx(
        'relative rounded-2xl border bg-white p-6 pt-8 text-center',
        isFirst ? 'border-eco-org sm:scale-105' : 'border-eco-border',
      )}
    >
      <div
        className={cx(
          'absolute -top-5 left-1/2 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white text-lg font-bold text-white',
          MEDAL_BG[item.rank],
        )}
      >
        {item.rank}
      </div>
      <div className="text-xs font-medium text-eco-ink2">{item.categoria}</div>
      <div className="mt-1 text-lg font-bold tracking-tight text-eco-ink">
        {item.name}
      </div>
      <div className="mt-4 flex justify-around border-t border-eco-border pt-4">
        <div>
          <div className="text-xl font-bold text-eco-org">{item.kg} kg</div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-eco-ink2">
            Reciclado
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-eco-ink">
            {item.eco.toLocaleString('es-AR')}
          </div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-eco-ink2">
            Puntos ECO
          </div>
        </div>
      </div>
    </div>
  );
}
