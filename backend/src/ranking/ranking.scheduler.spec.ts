import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RankingScheduler, mesAnterior } from './ranking.scheduler';
import { RankingService } from './ranking.service';

describe('RankingScheduler (E8-HU01: catch-up al arrancar)', () => {
  let scheduler: RankingScheduler;
  let rankingService: { cerrarRankingDelMes: jest.Mock };

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-15T00:00:00'));
    rankingService = { cerrarRankingDelMes: jest.fn().mockResolvedValue({}) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        RankingScheduler,
        { provide: RankingService, useValue: rankingService },
      ],
    }).compile();

    scheduler = moduleRef.get(RankingScheduler);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('al arrancar, intenta cerrar los últimos 3 meses (de más viejo a más nuevo)', async () => {
    await scheduler.onApplicationBootstrap();

    expect(rankingService.cerrarRankingDelMes).toHaveBeenCalledTimes(3);
    expect(rankingService.cerrarRankingDelMes.mock.calls).toEqual([
      [6, 2026],
      [7, 2026],
      [8, 2026],
    ]);
  });

  it('un mes ya cerrado (409) no interrumpe el catch-up de los demás', async () => {
    rankingService.cerrarRankingDelMes.mockRejectedValueOnce(
      new ConflictException('ya cerrado'),
    );

    await expect(scheduler.onApplicationBootstrap()).resolves.toBeUndefined();
    expect(rankingService.cerrarRankingDelMes).toHaveBeenCalledTimes(3);
  });

  it('un error real en un mes no interrumpe el catch-up de los demás', async () => {
    rankingService.cerrarRankingDelMes.mockRejectedValueOnce(
      new Error('DB caída'),
    );

    await expect(scheduler.onApplicationBootstrap()).resolves.toBeUndefined();
    expect(rankingService.cerrarRankingDelMes).toHaveBeenCalledTimes(3);
  });
});

describe('mesAnterior (E7-HU02)', () => {
  it('devuelve el mes calendario anterior dentro del mismo año', () => {
    // Sin sufijo `Z`: se parsea en hora local, igual que dispara el cron —
    // evita que el resultado dependa del huso horario donde corra el test.
    expect(mesAnterior(new Date('2026-03-01T00:00:00'))).toEqual({
      mes: 2,
      anio: 2026,
    });
  });

  it('en enero, devuelve diciembre del año anterior', () => {
    expect(mesAnterior(new Date('2026-01-15T00:00:00'))).toEqual({
      mes: 12,
      anio: 2025,
    });
  });
});
