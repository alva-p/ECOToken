import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { RankingRepository } from './repository/ranking.repository';
import { BlockchainService } from '../blockchain/blockchain.service';

describe('RankingService', () => {
  let service: RankingService;
  let repository: {
    findIngresosDelMes: jest.Mock;
    existeCierre: jest.Mock;
    cerrarConSnapshot: jest.Mock;
  };
  let blockchain: { bloqueActual: jest.Mock };

  beforeEach(async () => {
    repository = {
      findIngresosDelMes: jest.fn().mockResolvedValue([]),
      existeCierre: jest.fn().mockResolvedValue(false),
      cerrarConSnapshot: jest.fn().mockResolvedValue({ count: 0 }),
    };
    blockchain = { bloqueActual: jest.fn().mockResolvedValue(999) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        RankingService,
        { provide: RankingRepository, useValue: repository },
        { provide: BlockchainService, useValue: blockchain },
      ],
    }).compile();

    service = moduleRef.get(RankingService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('armarGrilla (E7-HU01)', () => {
    it('suma tokens por empresa y ordena de mayor a menor con posición', async () => {
      repository.findIngresosDelMes.mockResolvedValueOnce([
        {
          empresaId: 'emp1',
          empresa: { razonSocial: 'Eco SRL' },
          tokensAcumulados: 30,
        },
        {
          empresaId: 'emp2',
          empresa: { razonSocial: 'Supermercado Top' },
          tokensAcumulados: 200,
        },
        {
          empresaId: 'emp1',
          empresa: { razonSocial: 'Eco SRL' },
          tokensAcumulados: 20,
        },
      ]);

      const grilla = await service.armarGrilla(3, 2026);

      expect(grilla).toEqual([
        {
          empresaId: 'emp2',
          razonSocial: 'Supermercado Top',
          tokens: 200,
          posicion: 1,
        },
        { empresaId: 'emp1', razonSocial: 'Eco SRL', tokens: 50, posicion: 2 },
      ]);
    });

    it('sin ingresos devuelve una grilla vacía', async () => {
      await expect(service.armarGrilla(3, 2026)).resolves.toEqual([]);
    });
  });

  describe('cerrarRankingDelMes (E7-HU02)', () => {
    it('rechaza cerrar un período ya cerrado', async () => {
      repository.existeCierre.mockResolvedValueOnce(true);

      await expect(service.cerrarRankingDelMes(3, 2026)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repository.cerrarConSnapshot).not.toHaveBeenCalled();
    });

    it('persiste una fila por empresa con hash y bloque de referencia', async () => {
      repository.findIngresosDelMes.mockResolvedValueOnce([
        {
          empresaId: 'emp1',
          empresa: { razonSocial: 'Eco SRL' },
          tokensAcumulados: 50,
        },
      ]);

      const resultado = await service.cerrarRankingDelMes(3, 2026);

      expect(repository.cerrarConSnapshot).toHaveBeenCalledWith(
        3,
        2026,
        [
          {
            empresaId: 'emp1',
            razonSocial: 'Eco SRL',
            tokens: 50,
            posicion: 1,
          },
        ],
        { hashSnapshot: expect.any(String), bloqueReferencia: 999 },
      );
      expect(resultado).toEqual({
        mes: 3,
        anio: 2026,
        hashSnapshot: expect.any(String),
        bloqueReferencia: 999,
        empresas: 1,
      });
    });

    it('cierra igual (fila sentinela) cuando el mes no tuvo aportes', async () => {
      const resultado = await service.cerrarRankingDelMes(3, 2026);

      expect(repository.cerrarConSnapshot).toHaveBeenCalledWith(
        3,
        2026,
        [],
        expect.any(Object),
      );
      expect(resultado.empresas).toBe(0);
    });

    it('no falla si no se pudo obtener el bloque de referencia', async () => {
      blockchain.bloqueActual.mockResolvedValueOnce(null);

      const resultado = await service.cerrarRankingDelMes(3, 2026);

      expect(resultado.bloqueReferencia).toBeNull();
    });

    it('el hash cambia si cambia el contenido de la grilla', async () => {
      repository.findIngresosDelMes.mockResolvedValueOnce([
        {
          empresaId: 'emp1',
          empresa: { razonSocial: 'Eco SRL' },
          tokensAcumulados: 50,
        },
      ]);
      const primero = await service.cerrarRankingDelMes(3, 2026);

      repository.existeCierre.mockResolvedValueOnce(false);
      repository.findIngresosDelMes.mockResolvedValueOnce([
        {
          empresaId: 'emp1',
          empresa: { razonSocial: 'Eco SRL' },
          tokensAcumulados: 999,
        },
      ]);
      const segundo = await service.cerrarRankingDelMes(4, 2026);

      expect(primero.hashSnapshot).not.toBe(segundo.hashSnapshot);
    });
  });
});
