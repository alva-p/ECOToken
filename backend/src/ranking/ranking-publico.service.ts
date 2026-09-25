import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RankingPublicoRepository } from './repository/ranking-publico.repository';

export interface PeriodoCerrado {
  mes: number;
  anio: number;
  fechaCierre: Date | null;
  empresas: number;
  totalKg: number;
  totalTokens: number;
}

export interface FilaRankingPublico {
  posicion: number;
  razonSocial: string;
  kgReciclados: number;
  tokens: number;
}

export interface RankingPublico extends PeriodoCerrado {
  hashSnapshot: string | null;
  bloqueReferencia: number | null;
  data: FilaRankingPublico[];
}

const LIMITE_POR_DEFECTO = 12;

/** Redondea a 2 decimales: el peso se guarda como Float y la suma arrastra ruido. */
const redondear = (n: number) => Math.round(n * 100) / 100;

/**
 * Consulta pública de rankings ya cerrados (E7-HU03). Solo lectura y sin
 * sesión: expone únicamente razón social, posición, kg y tokens.
 */
@Injectable()
export class RankingPublicoService {
  constructor(private readonly repository: RankingPublicoRepository) {}

  /** Períodos cerrados con sus totales, del más reciente al más antiguo. */
  async periodos(limite = LIMITE_POR_DEFECTO): Promise<PeriodoCerrado[]> {
    const periodos = await this.repository.periodosCerrados(limite);
    return Promise.all(
      periodos.map(async (p) => {
        const snapshot = await this.repository.snapshotCerrado(p.mes, p.anio);
        const totales = await this.repository.totalesPorEmpresa(
          p.mes,
          p.anio,
          snapshot?.empresaIds ?? [],
        );
        return {
          ...p,
          totalKg: redondear(totales.reduce((s, t) => s + t.kg, 0)),
          totalTokens: totales.reduce((s, t) => s + t.tokens, 0),
        };
      }),
    );
  }

  /** Ranking cerrado del período indicado; sin período, el último cerrado. */
  async obtener(mes?: number, anio?: number): Promise<RankingPublico> {
    if ((mes === undefined) !== (anio === undefined)) {
      throw new BadRequestException('Indicá el mes y el año juntos.');
    }
    if (mes === undefined || anio === undefined) {
      const [ultimo] = await this.repository.periodosCerrados(1);
      if (!ultimo) {
        throw new NotFoundException('Todavía no hay rankings cerrados.');
      }
      ({ mes, anio } = ultimo);
    }

    const snapshot = await this.repository.snapshotCerrado(mes, anio);
    if (!snapshot) {
      throw new NotFoundException(
        `El ranking de ${mes}/${anio} no está cerrado.`,
      );
    }

    const [totales, empresas] = await Promise.all([
      this.repository.totalesPorEmpresa(mes, anio, snapshot.empresaIds),
      this.repository.razonesSociales(snapshot.empresaIds),
    ]);
    const totalesPorId = new Map(totales.map((t) => [t.empresaId, t]));

    // Desempate por kg y nombre para que el orden sea estable entre consultas.
    const data = empresas
      .map((e) => ({
        razonSocial: e.razonSocial,
        kgReciclados: redondear(totalesPorId.get(e.id)?.kg ?? 0),
        tokens: totalesPorId.get(e.id)?.tokens ?? 0,
      }))
      .sort(
        (a, b) =>
          b.tokens - a.tokens ||
          b.kgReciclados - a.kgReciclados ||
          a.razonSocial.localeCompare(b.razonSocial, 'es'),
      )
      .map((fila, i) => ({ posicion: i + 1, ...fila }));

    return {
      mes,
      anio,
      fechaCierre: snapshot.fechaCierre,
      empresas: data.length,
      totalKg: redondear(data.reduce((s, f) => s + f.kgReciclados, 0)),
      totalTokens: data.reduce((s, f) => s + f.tokens, 0),
      hashSnapshot: snapshot.hashSnapshot,
      bloqueReferencia: snapshot.bloqueReferencia,
      data,
    };
  }
}
