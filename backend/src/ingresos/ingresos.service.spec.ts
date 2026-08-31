import { Test } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { IngresosService } from './ingresos.service';
import { IngresoMaterialRepository } from './repository/ingreso-material.repository';
import { EmpresasService } from '../empresas/empresas.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { RegistrarIngresoDto } from './dto/registrar-ingreso.dto';

const coop = {
  id: 'coop1',
  categoria: 'COOPERATIVA',
  walletAddress: '0xcoop',
  estado: 'APROBADA',
};
const empresa = {
  id: 'emp1',
  categoria: 'EMPRESA',
  walletAddress: '0xemp',
  estado: 'APROBADA',
};
const dto: RegistrarIngresoDto = {
  empresaId: 'emp1',
  tipoMaterialId: 'mat1',
  peso: 2.5,
};

describe('IngresosService (E5-HU01)', () => {
  let service: IngresosService;
  let repository: {
    findTipoMaterialById: jest.Mock;
    findPuntajeVigente: jest.Mock;
    findEstadoByNombre: jest.Mock;
    registrar: jest.Mock;
    findByIdFull: jest.Mock;
    acunar: jest.Mock;
    findAportesEmpresa: jest.Mock;
  };
  let empresas: { verificarAprobada: jest.Mock };
  let blockchain: {
    configurada: boolean;
    mintDisponible: boolean;
    tieneValidatorRole: jest.Mock;
    mint: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      findTipoMaterialById: jest
        .fn()
        .mockResolvedValue({ id: 'mat1', nombre: 'PLASTICO' }),
      findPuntajeVigente: jest
        .fn()
        .mockResolvedValue({ id: 'p1', cantidadPorKilo: '10' }),
      findEstadoByNombre: jest
        .fn()
        .mockImplementation((nombre: string) =>
          Promise.resolve(
            nombre === 'REGISTRADO' ? { id: 'estReg' } : { id: 'estAcu' },
          ),
        ),
      registrar: jest.fn().mockResolvedValue({ id: 'ing1' }),
      findByIdFull: jest
        .fn()
        .mockResolvedValue({ id: 'ing1', movimientoToken: null }),
      acunar: jest
        .fn()
        .mockResolvedValue({ id: 'ing1', movimientoToken: { txHash: '0xtx' } }),
      findAportesEmpresa: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'ing1',
            fechaIngreso: new Date('2026-08-01'),
            tokensAcumulados: 25,
            peso: 2.5,
            cooperativa: { razonSocial: 'Coop Puente Verde' },
            tipoMaterial: { nombre: 'PLASTICO' },
          },
        ],
        total: 1,
      }),
    };
    empresas = {
      verificarAprobada: jest
        .fn()
        .mockImplementation((id: string) =>
          Promise.resolve(id === 'coop1' ? coop : empresa),
        ),
    };
    blockchain = {
      configurada: false,
      mintDisponible: true,
      tieneValidatorRole: jest.fn().mockResolvedValue(true),
      mint: jest.fn().mockResolvedValue({ txHash: '0xtx', bloque: 123 }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        IngresosService,
        { provide: IngresoMaterialRepository, useValue: repository },
        { provide: EmpresasService, useValue: empresas },
        { provide: BlockchainService, useValue: blockchain },
      ],
    }).compile();

    service = moduleRef.get(IngresosService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('registra el ingreso, calcula tokens y lo acuña cuando el mint está disponible', async () => {
    await service.registrar(dto, 'coop1');

    // tokens = round(2.5 * 10) = 25
    expect(repository.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        empresaId: 'emp1',
        estadoId: 'estReg',
        peso: 2.5,
        tokensAcumulados: 25,
      }),
    );
    expect(blockchain.mint).toHaveBeenCalledWith('0xemp', 25, 'PLASTICO', 2.5);
    expect(repository.acunar).toHaveBeenCalledWith(
      'ing1',
      25,
      '0xtx',
      123,
      'estAcu',
    );
  });

  it('deja el ingreso REGISTRADO (sin acuñar) cuando el mint no está disponible', async () => {
    blockchain.mintDisponible = false;

    await service.registrar(dto, 'coop1');

    expect(repository.registrar).toHaveBeenCalled();
    expect(blockchain.mint).not.toHaveBeenCalled();
    expect(repository.acunar).not.toHaveBeenCalled();
    expect(repository.findByIdFull).toHaveBeenCalledWith('ing1');
  });

  it('deja el ingreso REGISTRADO si el mint falla (no propaga el error)', async () => {
    blockchain.mint.mockRejectedValueOnce(new Error('RPC caído'));

    await expect(service.registrar(dto, 'coop1')).resolves.toBeDefined();

    expect(repository.registrar).toHaveBeenCalled();
    expect(repository.acunar).not.toHaveBeenCalled();
  });

  it('rechaza si el usuario no está asociado a una cooperativa', async () => {
    await expect(service.registrar(dto, null)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(repository.registrar).not.toHaveBeenCalled();
  });

  it('rechaza si quien registra no es una COOPERATIVA', async () => {
    empresas.verificarAprobada.mockResolvedValueOnce({
      ...coop,
      categoria: 'EMPRESA',
    });

    await expect(service.registrar(dto, 'coop1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(repository.registrar).not.toHaveBeenCalled();
  });

  it('rechaza si la cooperativa no tiene VALIDATOR_ROLE on-chain', async () => {
    blockchain.configurada = true;
    blockchain.tieneValidatorRole.mockResolvedValueOnce(false);

    await expect(service.registrar(dto, 'coop1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(repository.registrar).not.toHaveBeenCalled();
  });

  it('rechaza si no hay puntaje vigente para el material', async () => {
    repository.findPuntajeVigente.mockResolvedValueOnce(null);

    await expect(service.registrar(dto, 'coop1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.registrar).not.toHaveBeenCalled();
  });

  describe('reintentarAcunacion', () => {
    it('acuña un ingreso pendiente (sin movimiento)', async () => {
      repository.findByIdFull.mockResolvedValueOnce({
        id: 'ing1',
        tokensAcumulados: 25,
        peso: 2.5,
        empresa: { walletAddress: '0xemp' },
        tipoMaterial: { nombre: 'PLASTICO' },
        movimientoToken: null,
      });

      await service.reintentarAcunacion('ing1');

      expect(blockchain.mint).toHaveBeenCalledWith(
        '0xemp',
        25,
        'PLASTICO',
        2.5,
      );
      expect(repository.acunar).toHaveBeenCalled();
    });

    it('rechaza si el ingreso ya fue acuñado', async () => {
      repository.findByIdFull.mockResolvedValueOnce({
        id: 'ing1',
        movimientoToken: { txHash: '0xtx' },
      });

      await expect(service.reintentarAcunacion('ing1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(blockchain.mint).not.toHaveBeenCalled();
    });
  });

  describe('misAportes (E6-HU02)', () => {
    it('mapea el historial y aplica página/límite por defecto', async () => {
      const res = await service.misAportes('emp1', {});

      expect(repository.findAportesEmpresa).toHaveBeenCalledWith(
        'emp1',
        { desde: undefined, hasta: undefined, tipoMaterialId: undefined },
        0,
        20,
      );
      expect(res).toEqual({
        data: [
          {
            id: 'ing1',
            fecha: new Date('2026-08-01'),
            cooperativa: 'Coop Puente Verde',
            material: 'PLASTICO',
            peso: 2.5,
            tokens: 25,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      });
    });

    it('acota el límite a 500 y calcula el offset de la página', async () => {
      await service.misAportes('emp1', { page: 3, limit: 9999 });

      expect(repository.findAportesEmpresa).toHaveBeenCalledWith(
        'emp1',
        expect.anything(),
        1000,
        500,
      );
    });

    it('rechaza si el usuario no está asociado a una empresa', async () => {
      await expect(service.misAportes(null, {})).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(repository.findAportesEmpresa).not.toHaveBeenCalled();
    });
  });
});
