import { useEffect, useState } from 'react';
import {
  listarPeriodos,
  obtenerRankingPublico,
  type PeriodoCerrado,
  type RankingPublico,
} from '../api';

interface RankingActual {
  cargando: boolean;
  /** Períodos cerrados, del más reciente al más antiguo. */
  periodos: PeriodoCerrado[];
  /** Ranking del último período cerrado; null si todavía no hay ninguno. */
  ranking: RankingPublico | null;
}

const HISTORICO = 6;

/**
 * Último ranking cerrado y su histórico reciente, para la landing pública
 * (E7-HU03). Si el backend no responde o aún no hay cierres, devuelve el
 * estado vacío: la landing no debe romperse por esto.
 */
export function useRankingActual(): RankingActual {
  const [estado, setEstado] = useState<RankingActual>({
    cargando: true,
    periodos: [],
    ranking: null,
  });

  useEffect(() => {
    let vigente = true;
    listarPeriodos(HISTORICO)
      .then(async (periodos) => {
        const ranking = periodos[0]
          ? await obtenerRankingPublico(periodos[0])
          : null;
        if (vigente) setEstado({ cargando: false, periodos, ranking });
      })
      .catch(() => {
        if (vigente)
          setEstado({ cargando: false, periodos: [], ranking: null });
      });
    return () => {
      vigente = false;
    };
  }, []);

  return estado;
}
