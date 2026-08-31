import { Test } from '@nestjs/testing';
import { ReportesService } from './reportes.service';
import { ReporteRepository } from './repository/reporte.repository';

describe('ReportesService', () => {
  let service: ReportesService;
  let repository: { findIngresosEnPeriodo: jest.Mock };

  beforeEach(async () => {
    repository = { findIngresosEnPeriodo: jest.fn().mockResolvedValue([]) };

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
        },
        {
          empresaId: 'emp1',
          empresa: { razonSocial: 'Eco SRL' },
          peso: 3,
          tokensAcumulados: 30,
        },
        {
          empresaId: 'emp2',
          empresa: { razonSocial: 'Supermercado Top' },
          peso: 20,
          tokensAcumulados: 200,
        },
      ]);

      const res = await service.obtenerVolumenPorPeriodo({});

      expect(res.empresasActivas).toBe(2);
      expect(res.totalKg).toBe(28);
      expect(res.totalTokens).toBe(280);
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

      expect(repository.findIngresosEnPeriodo).toHaveBeenCalledWith(
        new Date('2026-08-01'),
        new Date('2026-08-31'),
      );
    });

    it('sin ingresos devuelve totales en cero', async () => {
      const res = await service.obtenerVolumenPorPeriodo({});
      expect(res).toEqual({
        data: [],
        totalKg: 0,
        totalTokens: 0,
        empresasActivas: 0,
        desde: null,
        hasta: null,
      });
    });
  });
});
