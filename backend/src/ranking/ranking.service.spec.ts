import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { RankingRepository } from './repository/ranking.repository';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CertificadosService } from '../certificados/certificados.service';

describe('RankingService', () => {
  let service: RankingService;
  let repository: jest.Mocked<Partial<RankingRepository>>;
  let blockchain: { bloqueActual: jest.Mock };
  let certificados: { emitirCertificadosDelMes: jest.Mock };

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
      existeCierre: jest.fn().mockResolvedValue(false),
      cerrarConSnapshot: jest.fn().mockResolvedValue({ count: 0 }),
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    blockchain = { bloqueActual: jest.fn().mockResolvedValue(999) };
    certificados = {
      emitirCertificadosDelMes: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        RankingService,
        { provide: RankingRepository, useValue: repository },
        { provide: BlockchainService, useValue: blockchain },
        { provide: CertificadosService, useValue: certificados },
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

  describe('cerrarRankingDelMes (E7-HU02)', () => {
    it('rechaza cerrar un período ya cerrado', async () => {
      repository.existeCierre = jest.fn().mockResolvedValueOnce(true);

      await expect(service.cerrarRankingDelMes(3, 2026)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repository.cerrarConSnapshot).not.toHaveBeenCalled();
    });

    it('persiste una fila por empresa con hash y bloque de referencia', async () => {
      repository.findIngresosDelMes = jest.fn().mockResolvedValueOnce([
        {
          empresaId: 'emp1',
          peso: 25,
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
            totalKg: 25,
            cantidadAportes: 1,
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

    it('emite los certificados mensuales de la grilla cerrada (E8-HU01)', async () => {
      repository.findIngresosDelMes = jest.fn().mockResolvedValueOnce([
        {
          empresaId: 'emp1',
          peso: 25,
          empresa: { razonSocial: 'Eco SRL' },
          tokensAcumulados: 50,
        },
      ]);

      await service.cerrarRankingDelMes(3, 2026);

      expect(certificados.emitirCertificadosDelMes).toHaveBeenCalledWith(
        3,
        2026,
        [
          {
            empresaId: 'emp1',
            razonSocial: 'Eco SRL',
            tokens: 50,
            totalKg: 25,
            cantidadAportes: 1,
            posicion: 1,
          },
        ],
      );
    });

    it('cierra igual (fila sentinela) cuando el mes no tuvo aportes', async () => {
      repository.findIngresosDelMes = jest.fn().mockResolvedValueOnce([]);

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
      repository.findIngresosDelMes = jest.fn().mockResolvedValueOnce([]);
      blockchain.bloqueActual.mockResolvedValueOnce(null);

      const resultado = await service.cerrarRankingDelMes(3, 2026);

      expect(resultado.bloqueReferencia).toBeNull();
    });

    it('el hash cambia si cambia el contenido de la grilla', async () => {
      repository.findIngresosDelMes = jest.fn().mockResolvedValueOnce([
        {
          empresaId: 'emp1',
          peso: 25,
          empresa: { razonSocial: 'Eco SRL' },
          tokensAcumulados: 50,
        },
      ]);
      const primero = await service.cerrarRankingDelMes(3, 2026);

      repository.existeCierre = jest.fn().mockResolvedValueOnce(false);
      repository.findIngresosDelMes = jest.fn().mockResolvedValueOnce([
        {
          empresaId: 'emp1',
          peso: 25,
          empresa: { razonSocial: 'Eco SRL' },
          tokensAcumulados: 999,
        },
      ]);
      const segundo = await service.cerrarRankingDelMes(4, 2026);

      expect(primero.hashSnapshot).not.toBe(segundo.hashSnapshot);
    });
  });

  describe('reemitirCertificados (E8-HU01: reintento sin re-cerrar)', () => {
    it('rearma la grilla del período y reemite, sin pasar por existeCierre', async () => {
      repository.findIngresosDelMes = jest.fn().mockResolvedValueOnce([
        {
          empresaId: 'emp1',
          peso: 25,
          empresa: { razonSocial: 'Eco SRL' },
          tokensAcumulados: 50,
        },
      ]);
      certificados.emitirCertificadosDelMes.mockResolvedValueOnce({
        intentados: 1,
        emitidos: 1,
        fallidos: 0,
      });

      const resultado = await service.reemitirCertificados(3, 2026);

      expect(repository.existeCierre).not.toHaveBeenCalled();
      expect(certificados.emitirCertificadosDelMes).toHaveBeenCalledWith(
        3,
        2026,
        [
          {
            empresaId: 'emp1',
            razonSocial: 'Eco SRL',
            tokens: 50,
            totalKg: 25,
            cantidadAportes: 1,
            posicion: 1,
          },
        ],
      );
      expect(resultado).toEqual({
        mes: 3,
        anio: 2026,
        intentados: 1,
        emitidos: 1,
        fallidos: 0,
      });
    });
  });
});
