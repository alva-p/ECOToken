import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CategoriaEmpresa, Empresa, EstadoEmpresa } from '@prisma/client';
import { EmpresasService } from './empresas.service';
import { EmpresaRepository } from './repository/empresa.repository';
import { BilleterasService } from '../billeteras/billeteras.service';
import { RegistrarEmpresaDto } from './dto/registrar-empresa.dto';

const empresaBase: Empresa = {
  id: 'e1',
  razonSocial: 'ACME SA',
  cuit: '20123456786',
  domicilio: null,
  representanteLegal: null,
  emailContacto: 'contacto@acme.com',
  estado: EstadoEmpresa.PENDIENTE,
  categoria: CategoriaEmpresa.EMPRESA,
  fechaRegistro: new Date(),
  nombre: null,
  datosContacto: null,
  activa: true,
  walletAddress: '0xEmpresaWallet',
  terminosVersion: null,
  terminosAceptadosEn: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('EmpresasService', () => {
  let service: EmpresasService;
  let repository: {
    create: jest.Mock;
    findByCuit: jest.Mock;
    findByEmailContacto: jest.Mock;
    registrar: jest.Mock;
    findByEstado: jest.Mock;
    findById: jest.Mock;
    updateEstado: jest.Mock;
  };
  let billeterasService: { generarBilleteraCustodial: jest.Mock };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findByCuit: jest.fn(),
      findByEmailContacto: jest.fn(),
      registrar: jest.fn(),
      findByEstado: jest.fn(),
      findById: jest.fn(),
      updateEstado: jest.fn(),
    };
    billeterasService = { generarBilleteraCustodial: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        EmpresasService,
        { provide: EmpresaRepository, useValue: repository },
        { provide: BilleterasService, useValue: billeterasService },
      ],
    }).compile();

    service = moduleRef.get(EmpresasService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('crearConBilletera (E3-HU02)', () => {
    it('genera una billetera custodial al dar de alta una empresa', () => {
      const dto = {
        razonSocial: 'Eco SRL',
        cuit: '20-12345678-9',
        categoria: CategoriaEmpresa.EMPRESA,
      } as never;

      billeterasService.generarBilleteraCustodial.mockReturnValue({
        direccionEVM: '0x1234567890abcdef1234567890abcdef12345678',
        clavePrivadaCifrada: 'iv:tag:ciphertext',
        tipoRolOnChain: 'EMPRESA',
      });
      repository.create.mockReturnValue({ id: 'empresa-1' });

      const resultado = service.crearConBilletera(dto);

      expect(billeterasService.generarBilleteraCustodial).toHaveBeenCalledWith(
        'EMPRESA',
      );
      expect(repository.create).toHaveBeenCalledWith(dto, {
        direccionEVM: '0x1234567890abcdef1234567890abcdef12345678',
        clavePrivadaCifrada: 'iv:tag:ciphertext',
        tipoRolOnChain: 'EMPRESA',
      });
      expect(resultado).toEqual({ id: 'empresa-1' });
    });
  });

  describe('registrar (E3-HU01 + E3-HU03)', () => {
    const dto: RegistrarEmpresaDto = {
      razonSocial: 'ACME SA',
      cuit: '20123456786',
      emailContacto: 'contacto@acme.com',
      aceptaTerminos: true,
      versionTerminos: 'v1',
    };

    it('registra la empresa cuando el CUIT y el correo son únicos, con billetera custodial', async () => {
      const billetera = {
        direccionEVM: '0x1234567890abcdef1234567890abcdef12345678',
        clavePrivadaCifrada: 'iv:tag:ciphertext',
        tipoRolOnChain: 'EMPRESA',
      };
      repository.findByCuit.mockResolvedValue(null);
      repository.findByEmailContacto.mockResolvedValue(null);
      billeterasService.generarBilleteraCustodial.mockReturnValue(billetera);
      repository.registrar.mockResolvedValue(empresaBase);

      const res = await service.registrar(dto);

      expect(billeterasService.generarBilleteraCustodial).toHaveBeenCalledWith(
        'EMPRESA',
      );
      expect(repository.registrar).toHaveBeenCalledWith(dto, billetera);
      expect(res).toBe(empresaBase);
    });

    it('lanza BadRequestException si no se aceptan los términos (E3-HU03)', async () => {
      await expect(
        service.registrar({ ...dto, aceptaTerminos: false }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.registrar).not.toHaveBeenCalled();
    });

    it('lanza ConflictException si el CUIT ya existe', async () => {
      repository.findByCuit.mockResolvedValue(empresaBase);

      await expect(service.registrar(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repository.registrar).not.toHaveBeenCalled();
    });

    it('lanza ConflictException si el correo ya existe', async () => {
      repository.findByCuit.mockResolvedValue(null);
      repository.findByEmailContacto.mockResolvedValue(empresaBase);

      await expect(service.registrar(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repository.registrar).not.toHaveBeenCalled();
    });
  });

  describe('aprobar / rechazar (E3-HU04)', () => {
    it('aprueba una empresa PENDIENTE → APROBADA', async () => {
      repository.findById.mockResolvedValue(empresaBase);
      repository.updateEstado.mockResolvedValue({
        ...empresaBase,
        estado: EstadoEmpresa.APROBADA,
      });

      await service.aprobar('e1');

      expect(repository.updateEstado).toHaveBeenCalledWith(
        'e1',
        EstadoEmpresa.APROBADA,
      );
    });

    it('rechaza una empresa PENDIENTE → RECHAZADA', async () => {
      repository.findById.mockResolvedValue(empresaBase);
      repository.updateEstado.mockResolvedValue({
        ...empresaBase,
        estado: EstadoEmpresa.RECHAZADA,
      });

      await service.rechazar('e1');

      expect(repository.updateEstado).toHaveBeenCalledWith(
        'e1',
        EstadoEmpresa.RECHAZADA,
      );
    });

    it('no permite aprobar una empresa que no está PENDIENTE', async () => {
      repository.findById.mockResolvedValue({
        ...empresaBase,
        estado: EstadoEmpresa.APROBADA,
      });

      await expect(service.aprobar('e1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(repository.updateEstado).not.toHaveBeenCalled();
    });

    it('lanza NotFoundException si la empresa no existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.aprobar('nope')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('verificarAprobada (gate "solo opera si aprobada")', () => {
    it('devuelve la empresa si está APROBADA', async () => {
      const aprobada = { ...empresaBase, estado: EstadoEmpresa.APROBADA };
      repository.findById.mockResolvedValue(aprobada);

      await expect(service.verificarAprobada('e1')).resolves.toBe(aprobada);
    });

    it('lanza ForbiddenException si no está APROBADA', async () => {
      repository.findById.mockResolvedValue(empresaBase);

      await expect(service.verificarAprobada('e1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });
});
