import { Test } from '@nestjs/testing';
import { RankingService } from './ranking.service';
import { RankingRepository } from './repository/ranking.repository';

describe('RankingService', () => {
  let service: RankingService;
  let repository: jest.Mocked<Partial<RankingRepository>>;

  const mockIngresos = [
    {
      id: 'ing-1',
      peso: 150,
      tokensAcumulados: 450,
      fechaIngreso: new Date('2026-09-05T10:00:00Z'),
      empresaId: 'emp-1',
      empresa: {
        id: 'emp-1',
        razonSocial: 'Empresa Alfa',
        cuit: '30-11111111-1',
      },
      tipoMaterialId: 'mat-1',
      estadoId: 'est-1',
      cooperativaId: 'coop-1',
    },
    {
      id: 'ing-2',
      peso: 200,
      tokensAcumulados: 600,
      fechaIngreso: new Date('2026-09-10T11:00:00Z'),
      empresaId: 'emp-2',
      empresa: {
        id: 'emp-2',
        razonSocial: 'Empresa Beta',
        cuit: '30-22222222-2',
      },
      tipoMaterialId: 'mat-1',
      estadoId: 'est-1',
      cooperativaId: 'coop-1',
    },
    {
      id: 'ing-3',
      peso: 100,
      tokensAcumulados: 300,
      fechaIngreso: new Date('2026-09-15T12:00:00Z'),
      empresaId: 'emp-1', // Mismo emp-1 acumulando más
      empresa: {
        id: 'emp-1',
        razonSocial: 'Empresa Alfa',
        cuit: '30-11111111-1',
      },
      tipoMaterialId: 'mat-2',
      estadoId: 'est-1',
      cooperativaId: 'coop-1',
    },
  ];

  beforeEach(async () => {
    repository = {
      findIngresosDelMes: jest.fn().mockResolvedValue(mockIngresos),
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        RankingService,
        { provide: RankingRepository, useValue: repository },
      ],
    }).compile();

    service = moduleRef.get(RankingService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('armarGrilla (E7-HU01)', () => {
    it('debe acumular tokens y kilos por empresa, ordenando de mayor a menor tokens', async () => {
      const grilla = await service.armarGrilla(9, 2026);

      expect(repository.findIngresosDelMes).toHaveBeenCalledWith(9, 2026);
      expect(grilla).toHaveLength(2);

      // Empresa Alfa tiene ing-1 (450) + ing-3 (300) = 750 tokens, peso 250
      // Empresa Beta tiene ing-2 (600) tokens, peso 200
      expect(grilla[0]).toEqual({
        posicion: 1,
        empresaId: 'emp-1',
        razonSocial: 'Empresa Alfa',
        tokens: 750,
        totalKg: 250,
        cantidadAportes: 2,
      });

      expect(grilla[1]).toEqual({
        posicion: 2,
        empresaId: 'emp-2',
        razonSocial: 'Empresa Beta',
        tokens: 600,
        totalKg: 200,
        cantidadAportes: 1,
      });
    });

    it('debe desempatar por peso total cuando dos empresas tienen la misma cantidad de tokens', async () => {
      repository.findIngresosDelMes = jest.fn().mockResolvedValue([
        {
          id: 'ing-a',
          peso: 100,
          tokensAcumulados: 500,
          empresaId: 'emp-a',
          empresa: { id: 'emp-a', razonSocial: 'Empresa A' },
        },
        {
          id: 'ing-b',
          peso: 250, // Más peso con los mismos tokens
          tokensAcumulados: 500,
          empresaId: 'emp-b',
          empresa: { id: 'emp-b', razonSocial: 'Empresa B' },
        },
      ]);

      const grilla = await service.armarGrilla(9, 2026);

      expect(grilla[0].empresaId).toBe('emp-b');
      expect(grilla[0].posicion).toBe(1);
      expect(grilla[1].empresaId).toBe('emp-a');
      expect(grilla[1].posicion).toBe(2);
    });

    it('debe desempatar alfabéticamente si coinciden tokens y peso', async () => {
      repository.findIngresosDelMes = jest.fn().mockResolvedValue([
        {
          id: 'ing-z',
          peso: 100,
          tokensAcumulados: 500,
          empresaId: 'emp-z',
          empresa: { id: 'emp-z', razonSocial: 'Zeta Corp' },
        },
        {
          id: 'ing-a',
          peso: 100,
          tokensAcumulados: 500,
          empresaId: 'emp-a',
          empresa: { id: 'emp-a', razonSocial: 'Alpha Corp' },
        },
      ]);

      const grilla = await service.armarGrilla(9, 2026);

      expect(grilla[0].razonSocial).toBe('Alpha Corp');
      expect(grilla[1].razonSocial).toBe('Zeta Corp');
    });

    it('debe retornar grilla vacía si no hubo ingresos en el mes', async () => {
      repository.findIngresosDelMes = jest.fn().mockResolvedValue([]);

      const grilla = await service.armarGrilla(9, 2026);

      expect(grilla).toEqual([]);
    });
  });

  describe('obtenerRankingMesActual (E7-HU01)', () => {
    it('debe consolidar totales y metadatos del período vía API', async () => {
      const resultado = await service.obtenerRankingMesActual(9, 2026);

      expect(resultado.mes).toBe(9);
      expect(resultado.anio).toBe(2026);
      expect(resultado.totalEmpresas).toBe(2);
      expect(resultado.totalTokens).toBe(1350); // 750 + 600
      expect(resultado.totalKg).toBe(450); // 250 + 200
      expect(resultado.ranking).toHaveLength(2);
      expect(resultado.actualizadoEn).toBeDefined();
    });
  });
});
