import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CertificadosService } from '../certificados/certificados.service';
import { RankingRepository } from './repository/ranking.repository';
import { CreateRankingDto } from './dto/create-ranking.dto';
import { UpdateRankingDto } from './dto/update-ranking.dto';

export interface FilaGrilla {
  empresaId: string;
  razonSocial: string;
  tokens: number;
  posicion: number;
}

export interface CierreRanking {
  mes: number;
  anio: number;
  hashSnapshot: string;
  bloqueReferencia: number | null;
  empresas: number;
}

/** Lógica de negocio de Ranking. */
@Injectable()
export class RankingService {
  constructor(
    private readonly repository: RankingRepository,
    private readonly blockchain: BlockchainService,
    private readonly certificados: CertificadosService,
  ) {}

  create(dto: CreateRankingDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const ranking = await this.repository.findById(id);
    if (!ranking) throw new NotFoundException(`Ranking ${id} no encontrado`);
    return ranking;
  }

  async update(id: string, dto: UpdateRankingDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }

  // ─── Métodos de negocio del diagrama de clases (stubs — completar en próximos sprints) ───

  /** Puntaje acumulado de la empresa en este ranking. */
  async consultarPuntaje(id: string): Promise<number> {
    await this.findOne(id);
    // TODO: calcular el puntaje de la empresa en el ranking.
    return 0;
  }

  /**
   * Construye la grilla del ranking del período: total de tokens acuñados
   * por empresa en ese mes (E7-HU01), ordenada de mayor a menor. `mes` es
   * 1-indexado (1 = enero), a diferencia de `Date.getMonth()`.
   */
  async armarGrilla(mes: number, anio: number): Promise<FilaGrilla[]> {
    const ingresos = await this.repository.findIngresosDelMes(mes, anio);

    const porEmpresa = new Map<
      string,
      { empresaId: string; razonSocial: string; tokens: number }
    >();
    for (const ingreso of ingresos) {
      const actual = porEmpresa.get(ingreso.empresaId) ?? {
        empresaId: ingreso.empresaId,
        razonSocial: ingreso.empresa.razonSocial,
        tokens: 0,
      };
      actual.tokens += ingreso.tokensAcumulados;
      porEmpresa.set(ingreso.empresaId, actual);
    }

    return [...porEmpresa.values()]
      .sort((a, b) => b.tokens - a.tokens)
      .map((fila, i) => ({ ...fila, posicion: i + 1 }));
  }

  /**
   * Cierra el ranking del mes indicado y registra un snapshot auditable
   * (E7-HU02): hash de la grilla + bloque de referencia de la red, ambos
   * persistidos en BD. El anclaje on-chain del hash (escribirlo en el
   * contrato) queda fuera de este alcance —la HU lo marca opcional— y se
   * puede sumar después sin tocar este snapshot ya cerrado.
   */
  async cerrarRankingDelMes(mes: number, anio: number): Promise<CierreRanking> {
    if (await this.repository.existeCierre(mes, anio)) {
      throw new ConflictException(
        `El ranking de ${mes}/${anio} ya fue cerrado.`,
      );
    }

    const grilla = await this.armarGrilla(mes, anio);
    const hashSnapshot = this.hashDeGrilla(mes, anio, grilla);
    const bloqueReferencia = await this.blockchain.bloqueActual();

    await this.repository.cerrarConSnapshot(mes, anio, grilla, {
      hashSnapshot,
      bloqueReferencia,
    });

    // E8-HU01: certificado mensual a cada empresa de la grilla ya cerrada.
    await this.certificados.emitirCertificadosDelMes(mes, anio, grilla);

    return {
      mes,
      anio,
      hashSnapshot,
      bloqueReferencia,
      empresas: grilla.length,
    };
  }

  /**
   * Reintento de la emisión de certificados de un mes YA cerrado (E8-HU01),
   * sin tocar el estado del Ranking (por eso no pasa por `existeCierre`).
   * Cubre el caso en que `cerrarRankingDelMes` cerró el ranking pero la
   * emisión de certificados quedó incompleta (ver `emitidos`/`fallidos` en
   * el resultado) — es idempotente, así que reemitir una empresa que ya
   * tenía certificado no la duplica, solo la actualiza.
   */
  async reemitirCertificados(mes: number, anio: number) {
    const grilla = await this.armarGrilla(mes, anio);
    const resultado = await this.certificados.emitirCertificadosDelMes(
      mes,
      anio,
      grilla,
    );
    return { mes, anio, ...resultado };
  }

  /** Hash determinístico del contenido cerrado: cualquier alteración posterior lo cambia. */
  private hashDeGrilla(
    mes: number,
    anio: number,
    grilla: FilaGrilla[],
  ): string {
    const payload = JSON.stringify({
      mes,
      anio,
      ranking: grilla.map(({ empresaId, tokens, posicion }) => ({
        empresaId,
        tokens,
        posicion,
      })),
    });
    return createHash('sha256').update(payload).digest('hex');
  }
}
