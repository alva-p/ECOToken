import { useState } from 'react';
import { BadgeCheck, Share2 } from 'lucide-react';
import type { MiPosicion } from '@/features/ranking/api';
import type { MiPerfil } from '../api';

interface Props {
  perfil: MiPerfil;
  posicion: MiPosicion | null | undefined;
  tokens: number | null;
}

/**
 * Tarjeta "para compartir": logo + razón social + posición en ranking + tokens,
 * con un diseño lindo pensado para captura/compartir.
 */
export function CompartirCard({ perfil, posicion, tokens }: Props) {
  const [copiado, setCopiado] = useState(false);
  const pos = posicion?.posicion ?? null;
  const total = posicion?.totalEmpresas ?? null;
  const t = tokens ?? posicion?.tokens ?? 0;

  function compartir() {
    const texto =
      `${perfil.razonSocial} en ECOToken — ${t.toLocaleString('es-AR')} ECO` +
      (pos ? ` · puesto #${pos}${total ? ` de ${total}` : ''}` : '');
    if (navigator.share) {
      navigator
        .share({ title: 'ECOToken', text: texto })
        .catch(() => undefined);
    } else {
      navigator.clipboard?.writeText(texto).then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      });
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0b1a15] to-[#163a2c] p-5 text-white shadow-sm">
      <div className="min-w-0">
        <p className="flex items-center gap-1 truncate text-sm font-semibold">
          {perfil.razonSocial}
          {perfil.estadoVerificacion === 'VERIFICADA' && (
            <BadgeCheck size={14} className="shrink-0 text-[#a3e635]" />
          )}
        </p>
        <p className="text-[11px] text-white/50">
          Reconocimiento ambiental · ECOToken
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white/5 p-3">
          <p className="text-[10px] uppercase tracking-wide text-white/50">
            Tokens ECO
          </p>
          <p className="text-xl font-bold text-[#a3e635]">
            {t.toLocaleString('es-AR')}
          </p>
        </div>
        <div className="rounded-lg bg-white/5 p-3">
          <p className="text-[10px] uppercase tracking-wide text-white/50">
            Ranking
          </p>
          <p className="text-xl font-bold">
            {pos ? `#${pos}` : '—'}
            {pos && total && (
              <span className="text-xs font-normal text-white/50">
                {' '}
                / {total}
              </span>
            )}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={compartir}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/15"
      >
        <Share2 size={14} /> {copiado ? '¡Copiado!' : 'Compartir'}
      </button>
    </div>
  );
}
