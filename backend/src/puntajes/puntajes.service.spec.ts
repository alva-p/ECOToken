import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PuntajesService } from './puntajes.service';
import { PuntajeRepository } from './repository/puntaje.repository';

describe('PuntajesService', () => {
  let service: PuntajesService;
  let repository: Record<string, jest.Mock>;

  const mockPuntaje = {
    id: 'puntaje-1',
    tipoMaterialId: 'mat-1',
    cantidadPorKilo: '10',
    versionConfig: 'v1',
    fechaDesde: new Date('2026-01-01'),
    fechaHasta: null,
    tipoMaterial: { id: 'mat-1', nombre: 'PLASTICO' },
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockResolvedValue(mockPuntaje),
      findAll: jest.fn().mockResolvedValue([mockPuntaje]),
      findById: jest.fn().mockResolvedValue(mockPuntaje),
      findVigenteByTipoMaterial: jest.fn().mockResolvedValue(mockPuntaje),
      findVigentes: jest.fn().mockResolvedValue([mockPuntaje]),
      cerrarPuntajeVigente: jest.fn().mockResolvedValue({ count: 1 }),
      update: jest.fn().mockResolvedValue(mockPuntaje),
      remove: jest.fn().mockResolvedValue(mockPuntaje),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PuntajesService,
        { provide: PuntajeRepository, useValue: repository },
      ],
    }).compile();

    service = moduleRef.get(PuntajesService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería cerrar el puntaje anterior y crear una nueva versión', async () => {
      const dto = { tipoMaterialId: 'mat-1', cantidadPorKilo: '12' };
      const resultado = await service.create(dto);

      expect(repository.cerrarPuntajeVigente).toHaveBeenCalledWith(
        'mat-1',
        expect.any(Date),
      );
      expect(repository.create).toHaveBeenCalled();
      expect(resultado).toEqual(mockPuntaje);
    });
  });

  describe('findVigentes', () => {
    it('debería retornar los factores vigentes por material', async () => {
      const resultado = await service.findVigentes();
      expect(repository.findVigentes).toHaveBeenCalled();
      expect(resultado).toEqual([mockPuntaje]);
    });
  });

  describe('findVigenteByTipoMaterial', () => {
    it('debería retornar el factor vigente para un material', async () => {
      const resultado = await service.findVigenteByTipoMaterial('mat-1');
      expect(repository.findVigenteByTipoMaterial).toHaveBeenCalledWith(
        'mat-1',
        undefined,
      );
      expect(resultado).toEqual(mockPuntaje);
    });

    it('debería lanzar NotFoundException si no existe factor vigente', async () => {
      repository.findVigenteByTipoMaterial.mockResolvedValue(null);
      await expect(
        service.findVigenteByTipoMaterial('inexistente'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
