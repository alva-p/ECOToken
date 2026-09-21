import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RankingService } from './ranking.service';
import { RankingMesResponse } from './interfaces/ranking-resultado.interface';

/**
 * Job del sistema para el cálculo del ranking del mes en curso (E7-HU01).
 * Consulta periódicamente los eventos/ingresos con tokens acuñados del mes
 * y consolida el desempeño por empresa para que esté siempre disponible vía API.
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
}
