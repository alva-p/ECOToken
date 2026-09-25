import { Test } from '@nestjs/testing';
import { RankingRepository } from './ranking.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('RankingRepository', () => {
  let repository: RankingRepository;
  let prisma: {
    ranking: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    ingresoMaterial: {
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      ranking: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      ingresoMaterial: {
        findMany: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        RankingRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = moduleRef.get(RankingRepository);
  });

  it('debería estar definido', () => {
    expect(repository).toBeDefined();
  });

  describe('findIngresosDelMes (E7-HU01)', () => {
    it('debe consultar ingresos con tokens acuñados dentro del rango de fechas del mes', async () => {
      prisma.ingresoMaterial.findMany.mockResolvedValue([]);

      await repository.findIngresosDelMes(9, 2026);

      expect(prisma.ingresoMaterial.findMany).toHaveBeenCalledWith({
        where: {
          fechaIngreso: {
            gte: new Date(Date.UTC(2026, 8, 1, 0, 0, 0, 0)),
            lt: new Date(Date.UTC(2026, 9, 1, 0, 0, 0, 0)),
          },
          tokensAcumulados: {
            gt: 0,
          },
        },
        include: {
          empresa: {
            select: {
              id: true,
              razonSocial: true,
              cuit: true,
            },
          },
        },
      });
    });
  });
});
