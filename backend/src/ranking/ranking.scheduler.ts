import {
  ConflictException,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RankingService } from './ranking.service';
import { RankingMesResponse } from './interfaces/ranking-resultado.interface';
import { mesAnterior } from './mes-anterior.util';

const MESES_DE_REINTENTO_AL_ARRANCAR = 3;

/**
 * Jobs del sistema de Ranking:
 * - cálculo periódico del mes en curso, siempre disponible vía API (E7-HU01).
 * - cierre mensual con snapshot auditable del mes recién terminado (E7-HU02),
 *   que además emite los certificados de ese cierre (E8-HU01).
 */
@Injectable()
export class RankingScheduler implements OnApplicationBootstrap {
  private readonly logger = new Logger(RankingScheduler.name);

  constructor(private readonly rankingService: RankingService) {}

  /**
   * Reintento acotado al arrancar el proceso (E8-HU01): si el backend estuvo
   * caído justo el día 1 (deploy, reinicio del VPS), el cron nunca corrió
   * para ese mes y no hay cola que lo reintente sola. Al levantar de nuevo,
   * revisa los últimos 3 meses y cierra cualquiera que haya quedado sin
   * cerrar. No es un sistema de colas — solo cubre downtime puntual; con más
   * de `MESES_DE_REINTENTO_AL_ARRANCAR` meses caído hay que usar
   * POST /ranking/cerrar a mano.
   */
  async onApplicationBootstrap(): Promise<void> {
    const ahora = new Date();
    for (let i = MESES_DE_REINTENTO_AL_ARRANCAR; i >= 1; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      await this.intentarCerrar(fecha.getMonth() + 1, fecha.getFullYear());
    }
  }

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
    await this.intentarCerrar(mes, anio);
  }

  /** Cierra si hace falta; un período ya cerrado (caso esperado la mayoría
   * de las veces en el catch-up de arranque) no cuenta como error. */
  private async intentarCerrar(mes: number, anio: number): Promise<void> {
    try {
      await this.rankingService.cerrarRankingDelMes(mes, anio);
      this.logger.log(`Ranking de ${mes}/${anio} cerrado.`);
    } catch (err) {
      if (err instanceof ConflictException) return;
      this.logger.error(
        `No se pudo cerrar el ranking de ${mes}/${anio}: ${(err as Error).message}`,
      );
    }
  }
}
