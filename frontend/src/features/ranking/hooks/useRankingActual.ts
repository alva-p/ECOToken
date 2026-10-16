import { useEffect, useState } from 'react';
import {
  listarPeriodos,
  obtenerRankingEnCurso,
  type PeriodoCerrado,
  type RankingPublico,
} from '../api';

interface RankingActual {
  cargando: boolean;
  /** Mes en curso (provisorio) y los cerrados, del más reciente al más antiguo. */
  periodos: PeriodoCerrado[];
  /** Ranking provisorio del mes en curso; null si el backend no respondió. */
  ranking: RankingPublico | null;
}

const HISTORICO = 6;

/**
 * Ranking del mes en curso y su histórico reciente, para la landing pública
 * (E7-HU03). Si el backend no responde, devuelve el estado vacío: la landing
 * no debe romperse por esto.
 */
export function useRankingActual(): RankingActual {
  const [estado, setEstado] = useState<RankingActual>({
    cargando: true,
    periodos: [],
    ranking: null,
  });

  useEffect(() => {
    let vigente = true;
    Promise.all([listarPeriodos(HISTORICO), obtenerRankingEnCurso()])
      .then(([cerrados, ranking]) => {
        const periodos = [
          ranking,
          ...cerrados.filter(
            (p) => p.mes !== ranking.mes || p.anio !== ranking.anio,
          ),
        ].slice(0, HISTORICO);
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
