import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RankingPublicoService } from './ranking-publico.service';
import { RankingPublicoRepository } from './repository/ranking-publico.repository';

describe('RankingPublicoService (E7-HU03)', () => {
  let service: RankingPublicoService;
  let repository: {
    periodosCerrados: jest.Mock;
    snapshotCerrado: jest.Mock;
    totalesPorEmpresa: jest.Mock;
    razonesSociales: jest.Mock;
  };

  const cierre = new Date('2026-09-01T00:00:00Z');
  const snapshot = (empresaIds: string[]) => ({
    fechaCierre: cierre,
    hashSnapshot: 'abc123',
    bloqueReferencia: 555,
    empresaIds,
  });

  beforeEach(async () => {
    repository = {
      periodosCerrados: jest.fn().mockResolvedValue([]),
      snapshotCerrado: jest.fn().mockResolvedValue(null),
      totalesPorEmpresa: jest.fn().mockResolvedValue([]),
      razonesSociales: jest.fn().mockResolvedValue([]),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        RankingPublicoService,
        { provide: RankingPublicoRepository, useValue: repository },
      ],
    }).compile();

    service = moduleRef.get(RankingPublicoService);
  });

  describe('periodos', () => {
    it('sin cierres devuelve una lista vacía', async () => {
      await expect(service.periodos()).resolves.toEqual([]);
    });

    it('agrega kg y tokens de cada período cerrado', async () => {
      repository.periodosCerrados.mockResolvedValueOnce([
        { mes: 8, anio: 2026, fechaCierre: cierre, empresas: 2 },
        { mes: 7, anio: 2026, fechaCierre: cierre, empresas: 0 },
      ]);
      repository.snapshotCerrado
        .mockResolvedValueOnce(snapshot(['e1', 'e2']))
        .mockResolvedValueOnce(snapshot([]));
      repository.totalesPorEmpresa
        .mockResolvedValueOnce([
          { empresaId: 'e1', kg: 10.1, tokens: 40 },
          { empresaId: 'e2', kg: 20.2, tokens: 60 },
        ])
        .mockResolvedValueOnce([]);

      const periodos = await service.periodos(6);

      expect(repository.periodosCerrados).toHaveBeenCalledWith(6);
      expect(periodos).toEqual([
        {
          mes: 8,
          anio: 2026,
          fechaCierre: cierre,
          empresas: 2,
          totalKg: 30.3,
          totalTokens: 100,
        },
        {
          mes: 7,
          anio: 2026,
          fechaCierre: cierre,
          empresas: 0,
          totalKg: 0,
          totalTokens: 0,
        },
      ]);
    });
  });

  describe('obtener', () => {
    it('sin período devuelve el último cerrado, ordenado por tokens con posición', async () => {
      repository.periodosCerrados.mockResolvedValueOnce([
        { mes: 8, anio: 2026, fechaCierre: cierre, empresas: 3 },
      ]);
      repository.snapshotCerrado.mockResolvedValueOnce(
        snapshot(['e1', 'e2', 'e3']),
      );
      repository.totalesPorEmpresa.mockResolvedValueOnce([
        { empresaId: 'e1', kg: 50, tokens: 100 },
        { empresaId: 'e2', kg: 300, tokens: 900 },
        { empresaId: 'e3', kg: 120, tokens: 400 },
      ]);
      repository.razonesSociales.mockResolvedValueOnce([
        { id: 'e1', razonSocial: 'Eco SRL' },
        { id: 'e2', razonSocial: 'Supermercado Top' },
        { id: 'e3', razonSocial: 'GreenPack' },
      ]);

      const ranking = await service.obtener();

      expect(repository.snapshotCerrado).toHaveBeenCalledWith(8, 2026);
      expect(ranking.data).toEqual([
        {
          posicion: 1,
          razonSocial: 'Supermercado Top',
          kgReciclados: 300,
          tokens: 900,
        },
        {
          posicion: 2,
          razonSocial: 'GreenPack',
          kgReciclados: 120,
          tokens: 400,
        },
        { posicion: 3, razonSocial: 'Eco SRL', kgReciclados: 50, tokens: 100 },
      ]);
      expect(ranking).toMatchObject({
        mes: 8,
        anio: 2026,
        empresas: 3,
        totalKg: 470,
        totalTokens: 1400,
        hashSnapshot: 'abc123',
        bloqueReferencia: 555,
      });
    });

    it('desempata por kg y luego por nombre para un orden estable', async () => {
      repository.snapshotCerrado.mockResolvedValueOnce(
        snapshot(['e1', 'e2', 'e3']),
      );
      repository.totalesPorEmpresa.mockResolvedValueOnce([
        { empresaId: 'e1', kg: 10, tokens: 40 },
        { empresaId: 'e2', kg: 20, tokens: 40 },
        { empresaId: 'e3', kg: 10, tokens: 40 },
      ]);
      repository.razonesSociales.mockResolvedValueOnce([
        { id: 'e1', razonSocial: 'Zeta SA' },
        { id: 'e2', razonSocial: 'Beta SA' },
        { id: 'e3', razonSocial: 'Alfa SA' },
      ]);

      const { data } = await service.obtener(8, 2026);

      expect(data.map((f) => f.razonSocial)).toEqual([
        'Beta SA',
        'Alfa SA',
        'Zeta SA',
      ]);
    });

    it('un mes cerrado sin aportes devuelve el ranking vacío', async () => {
      repository.snapshotCerrado.mockResolvedValueOnce(snapshot([]));

      const ranking = await service.obtener(7, 2026);

      expect(ranking).toMatchObject({ empresas: 0, totalKg: 0, data: [] });
    });

    it('rechaza un período sin cierre con 404', async () => {
      await expect(service.obtener(9, 2026)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('sin ningún ranking cerrado responde 404', async () => {
      await expect(service.obtener()).rejects.toBeInstanceOf(NotFoundException);
    });

    it('exige mes y año juntos', async () => {
      await expect(service.obtener(8)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      await expect(service.obtener(undefined, 2026)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
