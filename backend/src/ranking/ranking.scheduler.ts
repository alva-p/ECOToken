import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RankingService } from './ranking.service';
import { RankingMesResponse } from './interfaces/ranking-resultado.interface';
import { mesAnterior } from './mes-anterior.util';

/**
 * Jobs del sistema de Ranking:
 * - cálculo periódico del mes en curso, siempre disponible vía API (E7-HU01).
 * - cierre mensual con snapshot auditable del mes recién terminado (E7-HU02).
 */
@Injectable()
export class RankingScheduler {
  private readonly logger = new Logger(RankingScheduler.name);

  constructor(private readonly rankingService: RankingService) {}

  /**
   * Cron programado (por defecto cada hora) que calcula y audita el ranking
   * de empresas acumulado durante el mes en curso.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async calcularRankingMesActual(): Promise<RankingMesResponse | null> {
    this.logger.log(
      'Ejecutando job de cálculo de ranking de tokens del mes en curso...',
    );
    try {
      const resultado = await this.rankingService.calcularRankingMesEnCurso();
      this.logger.log(
        `Ranking mes ${resultado.mes}/${resultado.anio} calculado con éxito: ` +
          `${resultado.totalEmpresas} empresas participantes, ${resultado.totalTokens} tokens ECO acumulados.`,
      );
      return resultado;
    } catch (err) {
      this.logger.error(
        `Error al ejecutar el job de cálculo de ranking: ${(err as Error).message}`,
      );
      return null;
    }
  }

  /**
   * Ejecución manual o en demanda del job (para pruebas o sincronización inmediata).
   */
  async ejecutarJobManual(): Promise<RankingMesResponse | null> {
    return this.calcularRankingMesActual();
  }

  /** Job mensual que cierra el ranking del mes recién terminado (E7-HU02). */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cerrarMesAnterior(): Promise<void> {
    const { mes, anio } = mesAnterior(new Date());
    try {
      await this.rankingService.cerrarRankingDelMes(mes, anio);
      this.logger.log(`Ranking de ${mes}/${anio} cerrado.`);
    } catch (err) {
      this.logger.error(
        `No se pudo cerrar el ranking de ${mes}/${anio}: ${(err as Error).message}`,
      );
    }
  }
}
