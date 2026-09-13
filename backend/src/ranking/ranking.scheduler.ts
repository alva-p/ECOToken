import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RankingService } from './ranking.service';

/** Job mensual que cierra el ranking del mes recién terminado (E7-HU02). */
@Injectable()
export class RankingScheduler {
  private readonly logger = new Logger(RankingScheduler.name);

  constructor(private readonly rankingService: RankingService) {}

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

/** Mes/año calendario (1-indexado) anteriores a la fecha dada. */
export function mesAnterior(fecha: Date): { mes: number; anio: number } {
  const mesActual = fecha.getMonth(); // 0-indexado
  return mesActual === 0
    ? { mes: 12, anio: fecha.getFullYear() - 1 }
    : { mes: mesActual, anio: fecha.getFullYear() };
}
