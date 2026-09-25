import { Test } from '@nestjs/testing';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';

describe('RankingController', () => {
  let controller: RankingController;
  let service: jest.Mocked<Partial<RankingService>>;

  const mockRankingActual = {
    mes: 9,
    anio: 2026,
    actualizadoEn: new Date().toISOString(),
    totalEmpresas: 2,
    totalTokens: 1000,
    totalKg: 400,
    ranking: [
      {
        posicion: 1,
        empresaId: 'emp-1',
        razonSocial: 'Empresa Alfa',
        tokens: 600,
        totalKg: 250,
        cantidadAportes: 2,
      },
    ],
  };

  beforeEach(async () => {
    service = {
      obtenerRankingMesActual: jest.fn().mockResolvedValue(mockRankingActual),
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [RankingController],
      providers: [{ provide: RankingService, useValue: service }],
    }).compile();

    controller = moduleRef.get(RankingController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /ranking/actual (E7-HU01)', () => {
    it('debe delegar en service.obtenerRankingMesActual con query params opcionales', async () => {
      const res = await controller.obtenerRankingActual({ mes: 9, anio: 2026 });

      expect(service.obtenerRankingMesActual).toHaveBeenCalledWith(9, 2026);
      expect(res).toEqual(mockRankingActual);
    });

    it('debe delegar con undefined si no se envían parámetros', async () => {
      await controller.obtenerRankingActual({});

      expect(service.obtenerRankingMesActual).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });
  });
});
