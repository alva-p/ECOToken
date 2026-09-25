jest.mock('@nestjs/schedule', () => ({
  Cron: () => () => {},
  CronExpression: {
    EVERY_HOUR: '0 * * * *',
    EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT: '0 0 1 * *',
  },
}));

import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RankingScheduler } from './ranking.scheduler';
import { RankingService } from './ranking.service';
import { mesAnterior } from './mes-anterior.util';

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
      cerrarRankingDelMes: jest.fn().mockResolvedValue({
        mes: 9,
        anio: 2026,
        hashSnapshot: 'hash',
        bloqueReferencia: 1,
        empresas: 3,
      }),
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

  it('cierra el mes anterior al ejecutar el job mensual (E7-HU02)', async () => {
    await scheduler.cerrarMesAnterior();

    expect(service.cerrarRankingDelMes).toHaveBeenCalledTimes(1);
  });

  it('no propaga si el cierre mensual falla', async () => {
    service.cerrarRankingDelMes = jest
      .fn()
      .mockRejectedValue(new Error('ya cerrado'));

    await expect(scheduler.cerrarMesAnterior()).resolves.toBeUndefined();
  });
});

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
