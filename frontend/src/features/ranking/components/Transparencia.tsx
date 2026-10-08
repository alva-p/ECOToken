import { Clock, Link2, ShieldCheck } from 'lucide-react';

const ITEMS = [
  {
    icon: ShieldCheck,
    titulo: 'Datos verificados',
    texto:
      'Cada pesaje es registrado por la cooperativa y validado antes de sumar puntos al ranking.',
  },
  {
    icon: Link2,
    titulo: 'Trazabilidad on-chain',
    texto:
      'Cada ranking cerrado guarda una huella (hash) del snapshot, verificable públicamente.',
  },
  {
    icon: Clock,
    titulo: 'Rankings cerrados',
    texto:
      'Solo se publican meses ya cerrados: los datos no cambian después de la publicación.',
  },
];

export function Transparencia() {
  return (
    <section>
      <div className="text-xs font-semibold uppercase tracking-wide text-eco-org">
        Transparencia
      </div>
      <h2 className="mb-4 mt-1 text-xl font-bold tracking-tight">
        Cómo verificamos cada dato
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {ITEMS.map(({ icon: Icon, titulo, texto }) => (
          <div
            key={titulo}
            className="rounded-xl border border-eco-border bg-white p-5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-eco-org-soft text-eco-org">
              <Icon aria-hidden size={18} />
            </div>
            <h3 className="mt-3 text-sm font-semibold">{titulo}</h3>
            <p className="mt-1 text-xs leading-relaxed text-eco-ink2">
              {texto}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-xl bg-eco-org-soft p-4 text-sm text-eco-ink">
        <b>EcoToken</b> promueve la visibilidad y el reconocimiento del
        compromiso ambiental de las empresas de Villa María. Los puntos ECO son
        un sistema de reconocimiento, no un activo financiero.
      </p>
    </section>
  );
}
