jest.mock('@nestjs/schedule', () => ({
  Cron: () => () => {},
  CronExpression: {
    EVERY_HOUR: '0 * * * *',
    EVERY_DAY_AT_MIDNIGHT: '0 0 * * *',
  },
}));

import { Test } from '@nestjs/testing';
import { RankingScheduler } from './ranking.scheduler';
import { RankingService } from './ranking.service';

describe('RankingScheduler (E7-HU01)', () => {
  let scheduler: RankingScheduler;
  let service: jest.Mocked<Partial<RankingService>>;

  const mockResultado = {
    mes: 9,
    anio: 2026,
    actualizadoEn: new Date().toISOString(),
    totalEmpresas: 3,
    totalTokens: 1200,
    totalKg: 400,
    ranking: [],
  };

  beforeEach(async () => {
    service = {
      calcularRankingMesEnCurso: jest.fn().mockResolvedValue(mockResultado),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        RankingScheduler,
        { provide: RankingService, useValue: service },
      ],
    }).compile();

    scheduler = moduleRef.get(RankingScheduler);
  });

  it('debería estar definido', () => {
    expect(scheduler).toBeDefined();
  });

  it('debe invocar a calcularRankingMesEnCurso al ejecutar el job', async () => {
    const res = await scheduler.calcularRankingMesActual();

    expect(service.calcularRankingMesEnCurso).toHaveBeenCalledTimes(1);
    expect(res).toEqual(mockResultado);
  });

  it('debe manejar errores del cálculo sin lanzar excepción no controlada', async () => {
    service.calcularRankingMesEnCurso = jest
      .fn()
      .mockRejectedValue(new Error('Fallo de conexión a la base de datos'));

    const res = await scheduler.calcularRankingMesActual();

    expect(res).toBeNull();
  });
});
