import { Test } from '@nestjs/testing';
import { ReportesService } from './reportes.service';
import { ReporteRepository } from './repository/reporte.repository';

describe('ReportesService', () => {
  let service: ReportesService;
  let repository: {
    findIngresosEnPeriodo: jest.Mock;
    findIngresosDetalle: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      findIngresosEnPeriodo: jest.fn().mockResolvedValue([]),
      findIngresosDetalle: jest.fn().mockResolvedValue([]),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ReportesService,
        { provide: ReporteRepository, useValue: repository },
      ],
    }).compile();

    service = moduleRef.get(ReportesService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('obtenerVolumenPorPeriodo (E9-HU02)', () => {
    it('agrupa el volumen por empresa y suma kg/tokens/aportes', async () => {
      repository.findIngresosEnPeriodo.mockResolvedValueOnce([
        {
          empresaId: 'emp1',
          empresa: { razonSocial: 'Eco SRL' },
          peso: 5,
          tokensAcumulados: 50,
          tipoMaterial: { nombre: 'Vidrio' },
          fechaIngreso: new Date('2026-08-10T12:00:00Z'),
        },
        {
          empresaId: 'emp1',
          empresa: { razonSocial: 'Eco SRL' },
          peso: 3,
          tokensAcumulados: 30,
          tipoMaterial: { nombre: 'Papel' },
          fechaIngreso: new Date('2026-09-02T12:00:00Z'),
        },
        {
          empresaId: 'emp2',
          empresa: { razonSocial: 'Supermercado Top' },
          peso: 20,
          tokensAcumulados: 200,
          tipoMaterial: { nombre: 'Vidrio' },
          fechaIngreso: new Date('2026-09-15T12:00:00Z'),
        },
      ]);

      const res = await service.obtenerVolumenPorPeriodo({});

      expect(res.empresasActivas).toBe(2);
      expect(res.totalKg).toBe(28);
      expect(res.totalTokens).toBe(280);
      expect(res.porMaterial).toEqual([
        { material: 'Vidrio', kg: 25 },
        { material: 'Papel', kg: 3 },
      ]);
      expect(res.porMes).toEqual([
        { mes: '2026-08', kgPorMaterial: { Vidrio: 5 } },
        { mes: '2026-09', kgPorMaterial: { Papel: 3, Vidrio: 20 } },
      ]);
      // Ordenado de mayor a menor kg reciclados.
      expect(res.data).toEqual([
        {
          empresaId: 'emp2',
          razonSocial: 'Supermercado Top',
          kgReciclados: 20,
          tokensAcumulados: 200,
          aportes: 1,
        },
        {
          empresaId: 'emp1',
          razonSocial: 'Eco SRL',
          kgReciclados: 8,
          tokensAcumulados: 80,
          aportes: 2,
        },
      ]);
    });

    it('pasa desde/hasta al repository y los devuelve en la respuesta', async () => {
      await service.obtenerVolumenPorPeriodo({
        desde: '2026-08-01',
        hasta: '2026-08-31',
      });

      // Días completos en hora argentina: el "hasta" incluye todo el 31/8.
      expect(repository.findIngresosEnPeriodo).toHaveBeenCalledWith(
        new Date('2026-08-01T03:00:00.000Z'),
        new Date('2026-09-01T02:59:59.999Z'),
      );
    });

    it('sin ingresos devuelve totales en cero', async () => {
      const res = await service.obtenerVolumenPorPeriodo({});
      expect(res).toEqual({
        data: [],
        porMaterial: [],
        porMes: [],
        totalKg: 0,
        totalTokens: 0,
        empresasActivas: 0,
        desde: null,
        hasta: null,
      });
    });
  });

  describe('obtenerAportes', () => {
    it('aplana cada ingreso y marca los anclados on-chain', async () => {
      repository.findIngresosDetalle.mockResolvedValueOnce([
        {
          id: 'i1',
          fechaIngreso: new Date('2026-09-01T10:00:00Z'),
          empresaId: 'emp1',
          empresa: { razonSocial: 'Eco SRL', cuit: '30-1' },
          tipoMaterial: { nombre: 'Vidrio' },
          peso: 5,
          tokensAcumulados: 50,
          movimientoToken: { txHash: '0xabc' },
        },
        {
          id: 'i2',
          fechaIngreso: new Date('2026-09-02T10:00:00Z'),
          empresaId: 'emp1',
          empresa: { razonSocial: 'Eco SRL', cuit: '30-1' },
          tipoMaterial: { nombre: 'Papel' },
          peso: 2,
          tokensAcumulados: 20,
          movimientoToken: null,
        },
      ]);

      const res = await service.obtenerAportes();

      expect(res).toEqual([
        {
          id: 'i1',
          fecha: '2026-09-01T10:00:00.000Z',
          organizacionId: 'emp1',
          organizacion: 'Eco SRL',
          cuit: '30-1',
          material: 'Vidrio',
          kg: 5,
          puntos: 50,
          verificado: true,
        },
        expect.objectContaining({ id: 'i2', verificado: false }),
      ]);
    });
  });
});
