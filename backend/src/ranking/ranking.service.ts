import { Injectable, NotFoundException } from '@nestjs/common';
import { RankingRepository } from './repository/ranking.repository';
import { CreateRankingDto } from './dto/create-ranking.dto';
import { UpdateRankingDto } from './dto/update-ranking.dto';
import {
  FilaRankingMes,
  RankingMesResponse,
} from './interfaces/ranking-resultado.interface';

/** Lógica de negocio de Ranking. */
@Injectable()
export class RankingService {
  constructor(private readonly repository: RankingRepository) {}

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

  // ─── Métodos de negocio del diagrama de clases (E7-HU01 / E7-HU02) ───

  /** Puntaje acumulado de la empresa en este ranking. */
  async consultarPuntaje(id: string): Promise<number> {
    await this.findOne(id);
    return 0;
  }

  /**
   * Construye la grilla del ranking del período (E7-HU01):
   * Consulta los eventos/ingresos del mes con tokens acuñados y suma por empresa.
   * Ordena de mayor a menor por tokens acuñados durante el mes, con desempate por
   * peso total reciclado y razón social.
   * `mes` es 1-indexado (1 = enero, 12 = diciembre).
   */
  async armarGrilla(mes: number, anio: number): Promise<FilaRankingMes[]> {
    const ingresos = await this.repository.findIngresosDelMes(mes, anio);

    const acumuladoPorEmpresa = new Map<
      string,
      {
        empresaId: string;
        razonSocial: string;
        tokens: number;
        totalKg: number;
        cantidadAportes: number;
      }
    >();

    for (const ingreso of ingresos) {
      const empresaId = ingreso.empresaId;
      const actual = acumuladoPorEmpresa.get(empresaId) ?? {
        empresaId,
        razonSocial: ingreso.empresa.razonSocial,
        tokens: 0,
        totalKg: 0,
        cantidadAportes: 0,
      };

      actual.tokens += ingreso.tokensAcumulados;
      actual.totalKg += ingreso.peso;
      actual.cantidadAportes += 1;

      acumuladoPorEmpresa.set(empresaId, actual);
    }

    return [...acumuladoPorEmpresa.values()]
      .sort((a, b) => {
        if (b.tokens !== a.tokens) {
          return b.tokens - a.tokens;
        }
        if (b.totalKg !== a.totalKg) {
          return b.totalKg - a.totalKg;
        }
        return a.razonSocial.localeCompare(b.razonSocial);
      })
      .map((fila, index) => ({
        posicion: index + 1,
        empresaId: fila.empresaId,
        razonSocial: fila.razonSocial,
        tokens: fila.tokens,
        totalKg: Math.round(fila.totalKg * 100) / 100,
        cantidadAportes: fila.cantidadAportes,
      }));
  }

  /**
   * Obtiene el ranking consolidado del mes actual (o período especificado)
   * disponible para su consumo vía API (E7-HU01).
   */
  async obtenerRankingMesActual(
    mes?: number,
    anio?: number,
  ): Promise<RankingMesResponse> {
    const ahora = new Date();
    const mesPeriodo = mes ?? ahora.getUTCMonth() + 1;
    const anioPeriodo = anio ?? ahora.getUTCFullYear();

    const grilla = await this.armarGrilla(mesPeriodo, anioPeriodo);
    const totalTokens = grilla.reduce((sum, item) => sum + item.tokens, 0);
    const totalKg =
      Math.round(grilla.reduce((sum, item) => sum + item.totalKg, 0) * 100) /
      100;

    return {
      mes: mesPeriodo,
      anio: anioPeriodo,
      actualizadoEn: ahora.toISOString(),
      totalEmpresas: grilla.length,
      totalTokens,
      totalKg,
      ranking: grilla,
    };
  }

  /**
   * Ejecución invocada por el Job periódico (E7-HU01) para calcular y auditar
   * el ranking del mes en curso.
   */
  async calcularRankingMesEnCurso(): Promise<RankingMesResponse> {
    return this.obtenerRankingMesActual();
  }

  /** Emite el certificado digital a la empresa de esa posición. */
  async generarCertificado(id: string): Promise<void> {
    await this.findOne(id);
    // TODO: emitir certificado a la empresa de esa posición (E8-HU01).
  }
}
