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
  /** Certificados emitidos a la empresa hasta este período. */
  certificados: number;
  /** Puestos ganados (+) o perdidos (−) vs. el mes anterior; null si no hay comparación. */
  tendencia: number | null;
  /** Participa por primera vez (hay mes anterior cerrado y no estaba). */
  nuevo: boolean;
}

export interface MaterialKg {
  material: string;
  kg: number;
}

export interface LiderPublico {
  razonSocial: string;
  kgReciclados: number;
  tokens: number;
  certificados: number;
  co2Evitado: number;
  mesesConsecutivos: number;
  materiales: MaterialKg[];
}

export interface RankingPublico extends PeriodoCerrado {
  hashSnapshot: string | null;
  bloqueReferencia: number | null;
  /** CO₂ evitado según los certificados emitidos del período. */
  co2Evitado: number;
  materiales: MaterialKg[];
  lider: LiderPublico | null;
  data: FilaRankingPublico[];
}

const LIMITE_POR_DEFECTO = 12;

/** Redondea a 2 decimales: el peso se guarda como Float y la suma arrastra ruido. */
const redondear = (n: number) => Math.round(n * 100) / 100;

const ordenarMateriales = (m: MaterialKg[]) =>
  m.map((x) => ({ ...x, kg: redondear(x.kg) })).sort((a, b) => b.kg - a.kg);

/** Meses seguidos, hasta el período indicado, en los que la empresa estuvo en un cierre. */
function mesesConsecutivos(
  cierres: { mes: number; anio: number }[],
  mes: number,
  anio: number,
): number {
  const claves = new Set(cierres.map((c) => c.anio * 12 + c.mes));
  let n = 0;
  for (let k = anio * 12 + mes; claves.has(k); k--) n++;
  return n;
}

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

    const filas = await this.armarFilas(mes, anio, snapshot.empresaIds);
    const ids = snapshot.empresaIds;

    const mesPrev = mes === 1 ? 12 : mes - 1;
    const anioPrev = mes === 1 ? anio - 1 : anio;
    const snapPrev = await this.repository.snapshotCerrado(mesPrev, anioPrev);
    const previas = snapPrev
      ? new Map(
          (await this.armarFilas(mesPrev, anioPrev, snapPrev.empresaIds)).map(
            (f) => [f.empresaId, f.posicion],
          ),
        )
      : null;

    const [certs, co2s, materiales] = await Promise.all([
      this.repository.certificadosPorEmpresa(mes, anio, ids),
      this.repository.co2PorEmpresa(mes, anio, ids),
      this.repository.kgPorMaterial(mes, anio, ids),
    ]);
    const certsPorId = new Map(certs.map((c) => [c.empresaId, c.cantidad]));
    const co2PorId = new Map(co2s.map((c) => [c.empresaId, c.co2]));

    const data = filas.map(({ empresaId, ...fila }) => {
      const previa = previas?.get(empresaId);
      return {
        ...fila,
        certificados: certsPorId.get(empresaId) ?? 0,
        tendencia: previa === undefined ? null : previa - fila.posicion,
        nuevo: previas !== null && previa === undefined,
      };
    });

    let lider: LiderPublico | null = null;
    if (filas[0]) {
      const top = filas[0];
      lider = {
        razonSocial: top.razonSocial,
        kgReciclados: top.kgReciclados,
        tokens: top.tokens,
        certificados: certsPorId.get(top.empresaId) ?? 0,
        co2Evitado: redondear(co2PorId.get(top.empresaId) ?? 0),
        mesesConsecutivos: mesesConsecutivos(
          await this.repository.mesesCerrados(top.empresaId),
          mes,
          anio,
        ),
        materiales: ordenarMateriales(
          await this.repository.kgPorMaterial(mes, anio, [top.empresaId]),
        ),
      };
    }

    return {
      mes,
      anio,
      fechaCierre: snapshot.fechaCierre,
      empresas: data.length,
      totalKg: redondear(data.reduce((s, f) => s + f.kgReciclados, 0)),
      totalTokens: data.reduce((s, f) => s + f.tokens, 0),
      hashSnapshot: snapshot.hashSnapshot,
      bloqueReferencia: snapshot.bloqueReferencia,
      co2Evitado: redondear(co2s.reduce((t, c) => t + c.co2, 0)),
      materiales: ordenarMateriales(materiales),
      lider,
      data,
    };
  }

  /** Posición, kg y tokens por empresa del período, ya ordenados. */
  private async armarFilas(mes: number, anio: number, empresaIds: string[]) {
    const [totales, empresas] = await Promise.all([
      this.repository.totalesPorEmpresa(mes, anio, empresaIds),
      this.repository.razonesSociales(empresaIds),
    ]);
    const totalesPorId = new Map(totales.map((t) => [t.empresaId, t]));

    // Desempate por kg y nombre para que el orden sea estable entre consultas.
    return empresas
      .map((e) => ({
        empresaId: e.id,
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
      .map((fila, i) => ({ ...fila, posicion: i + 1 }));
  }
}
