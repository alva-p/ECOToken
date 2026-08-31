import { Test } from '@nestjs/testing';
import { IngresosService } from './ingresos.service';
import { IngresoMaterialRepository } from './repository/ingreso-material.repository';
import { PuntajesService } from '../puntajes/puntajes.service';

describe('IngresosService', () => {
  let service: IngresosService;
  let repository: Record<string, jest.Mock>;
  let puntajesService: Record<string, jest.Mock>;

  const mockIngreso = {
    id: 'ingreso-1',
    peso: 50,
    tokensAcumulados: 500,
    empresaId: 'empresa-1',
    tipoMaterialId: 'mat-1',
    estadoId: 'estado-1',
    fechaIngreso: new Date('2026-01-01'),
    estado: { nombre: 'REGISTRADO' },
  };

  const mockPuntaje = {
    id: 'puntaje-1',
    tipoMaterialId: 'mat-1',
    cantidadPorKilo: '10',
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'ingreso-1', ...dto })),
      findAll: jest.fn().mockResolvedValue([mockIngreso]),
      findById: jest.fn().mockResolvedValue(mockIngreso),
      update: jest.fn().mockResolvedValue(mockIngreso),
      remove: jest.fn().mockResolvedValue(mockIngreso),
    };

    puntajesService = {
      findVigenteByTipoMaterial: jest.fn().mockResolvedValue(mockPuntaje),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        IngresosService,
        { provide: IngresoMaterialRepository, useValue: repository },
        { provide: PuntajesService, useValue: puntajesService },
      ],
    }).compile();

    service = moduleRef.get(IngresosService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería calcular automáticamente los tokens acumulados basados en peso y factor vigente', async () => {
      const dto = {
        peso: 40,
        empresaId: 'empresa-1',
        tipoMaterialId: 'mat-1',
        estadoId: 'estado-1',
      };

      const resultado = await service.create(dto as any);
      expect(puntajesService.findVigenteByTipoMaterial).toHaveBeenCalledWith('mat-1');
      expect(resultado.tokensAcumulados).toBe(400); // 40 kg * 10 tokens/kg
    });
  });

  describe('calcularPuntaje', () => {
    it('debería calcular el puntaje de un ingreso con su factor vigente a la fecha de ingreso', async () => {
      const puntajeCalculado = await service.calcularPuntaje('ingreso-1');
      expect(puntajesService.findVigenteByTipoMaterial).toHaveBeenCalledWith('mat-1', mockIngreso.fechaIngreso);
      expect(puntajeCalculado).toBe(500); // 50 kg * 10 tokens/kg
    });
  });
});
