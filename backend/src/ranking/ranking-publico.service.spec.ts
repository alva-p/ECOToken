import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RankingPublicoService } from './ranking-publico.service';
import { RankingPublicoRepository } from './repository/ranking-publico.repository';

describe('RankingPublicoService (E7-HU03)', () => {
  let service: RankingPublicoService;
  let repository: {
    periodosCerrados: jest.Mock;
    snapshotCerrado: jest.Mock;
    totalesPorEmpresa: jest.Mock;
    razonesSociales: jest.Mock;
    kgPorMaterial: jest.Mock;
    certificadosPorEmpresa: jest.Mock;
    co2PorEmpresa: jest.Mock;
    mesesCerrados: jest.Mock;
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
      kgPorMaterial: jest.fn().mockResolvedValue([]),
      certificadosPorEmpresa: jest.fn().mockResolvedValue([]),
      co2PorEmpresa: jest.fn().mockResolvedValue([]),
      mesesCerrados: jest.fn().mockResolvedValue([]),
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
      const extra = { certificados: 0, tendencia: null, nuevo: false };
      expect(ranking.data).toEqual([
        {
          posicion: 1,
          razonSocial: 'Supermercado Top',
          kgReciclados: 300,
          tokens: 900,
          ...extra,
        },
        {
          posicion: 2,
          razonSocial: 'GreenPack',
          kgReciclados: 120,
          tokens: 400,
          ...extra,
        },
        {
          posicion: 3,
          razonSocial: 'Eco SRL',
          kgReciclados: 50,
          tokens: 100,
          ...extra,
        },
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

    it('calcula tendencia, novedad, certificados y perfil del líder', async () => {
      repository.snapshotCerrado
        .mockResolvedValueOnce(snapshot(['e1', 'e2']))
        .mockResolvedValueOnce(snapshot(['e1']));
      repository.totalesPorEmpresa
        .mockResolvedValueOnce([
          { empresaId: 'e1', kg: 10, tokens: 10 },
          { empresaId: 'e2', kg: 20, tokens: 20 },
        ])
        .mockResolvedValueOnce([{ empresaId: 'e1', kg: 5, tokens: 5 }]);
      repository.razonesSociales
        .mockResolvedValueOnce([
          { id: 'e1', razonSocial: 'Uno' },
          { id: 'e2', razonSocial: 'Dos' },
        ])
        .mockResolvedValueOnce([{ id: 'e1', razonSocial: 'Uno' }]);
      repository.certificadosPorEmpresa.mockResolvedValueOnce([
        { empresaId: 'e2', cantidad: 3 },
      ]);
      repository.co2PorEmpresa.mockResolvedValueOnce([
        { empresaId: 'e2', co2: 7.5 },
      ]);
      repository.mesesCerrados.mockResolvedValueOnce([
        { mes: 8, anio: 2026 },
        { mes: 7, anio: 2026 },
        { mes: 5, anio: 2026 },
      ]);
      repository.kgPorMaterial
        .mockResolvedValueOnce([{ material: 'Vidrio', kg: 20 }])
        .mockResolvedValueOnce([{ material: 'Vidrio', kg: 20 }]);

      const r = await service.obtener(8, 2026);

      expect(r.data[0]).toMatchObject({
        razonSocial: 'Dos',
        nuevo: true,
        tendencia: null,
        certificados: 3,
      });
      expect(r.data[1]).toMatchObject({ razonSocial: 'Uno', tendencia: -1 });
      expect(r.lider).toMatchObject({
        razonSocial: 'Dos',
        co2Evitado: 7.5,
        mesesConsecutivos: 2,
        materiales: [{ material: 'Vidrio', kg: 20 }],
      });
      expect(r.co2Evitado).toBe(7.5);
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

  describe('miPosicion', () => {
    const periodoAgosto = {
      mes: 8,
      anio: 2026,
      fechaCierre: cierre,
      empresas: 3,
    };

    beforeEach(() => {
      repository.periodosCerrados.mockResolvedValue([periodoAgosto]);
      repository.snapshotCerrado.mockResolvedValue(
        snapshot(['e1', 'e2', 'e3']),
      );
      repository.totalesPorEmpresa.mockResolvedValue([
        { empresaId: 'e1', kg: 50, tokens: 100 },
        { empresaId: 'e2', kg: 300, tokens: 900 },
        { empresaId: 'e3', kg: 120, tokens: 400 },
      ]);
      repository.razonesSociales.mockResolvedValue([
        { id: 'e1', razonSocial: 'Eco SRL' },
        { id: 'e2', razonSocial: 'Top SA' },
        { id: 'e3', razonSocial: 'GreenPack' },
      ]);
    });

    it('exige una empresa asociada al usuario', async () => {
      await expect(service.miPosicion(null)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('devuelve posición, números propios y puntos para subir', async () => {
      repository.certificadosPorEmpresa.mockResolvedValue([
        { empresaId: 'e3', cantidad: 2 },
      ]);
      repository.kgPorMaterial.mockResolvedValue([
        { material: 'Vidrio', kg: 120 },
      ]);

      const r = await service.miPosicion('e3');

      expect(r).toMatchObject({
        participa: true,
        posicion: 2,
        totalEmpresas: 3,
        kgReciclados: 120,
        tokens: 400,
        certificados: 2,
        puntosParaSubir: 500,
        materiales: [{ material: 'Vidrio', kg: 120 }],
      });
      expect(r.evolucion).toEqual([
        { mes: 8, anio: 2026, kg: 120, posicion: 2 },
      ]);
    });

    it('la primera no tiene a quién alcanzar', async () => {
      const r = await service.miPosicion('e2');

      expect(r.posicion).toBe(1);
      expect(r.puntosParaSubir).toBeNull();
    });

    it('una empresa sin aportes ese mes no participa', async () => {
      const r = await service.miPosicion('otra');

      expect(r).toMatchObject({
        participa: false,
        posicion: null,
        totalEmpresas: 3,
      });
    });
  });
});
