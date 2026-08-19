import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  CategoriaEmpresa,
  Empresa,
  EstadoEmpresa,
  TipoRol,
} from '@prisma/client';
import { EmpresasService } from './empresas.service';
import { EmpresaRepository } from './repository/empresa.repository';
import { BilleterasService } from '../billeteras/billeteras.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistrarEmpresaDto } from './dto/registrar-empresa.dto';
import { AltaCooperativaDto } from './dto/alta-cooperativa.dto';

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
  terminosVersion: null,
  terminosAceptadosEn: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('EmpresasService', () => {
  let service: EmpresasService;
  let repository: {
    findByCuit: jest.Mock;
    findByEmailContacto: jest.Mock;
    registrar: jest.Mock;
    findByEstado: jest.Mock;
    findById: jest.Mock;
    updateEstado: jest.Mock;
    altaCooperativa: jest.Mock;
    remove: jest.Mock;
    buscar: jest.Mock;
  };
  let billeterasService: { generarParaEmpresa: jest.Mock; remove: jest.Mock };
  let blockchainService: { grantValidatorRole: jest.Mock };
  let usuariosService: { create: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    repository = {
      findByCuit: jest.fn(),
      findByEmailContacto: jest.fn(),
      registrar: jest.fn(),
      findByEstado: jest.fn(),
      findById: jest.fn(),
      updateEstado: jest.fn(),
      altaCooperativa: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
      buscar: jest.fn(),
    };
    billeterasService = {
      generarParaEmpresa: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    blockchainService = { grantValidatorRole: jest.fn() };
    usuariosService = {
      create: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        EmpresasService,
        { provide: EmpresaRepository, useValue: repository },
        { provide: BilleterasService, useValue: billeterasService },
        { provide: BlockchainService, useValue: blockchainService },
        { provide: UsuariosService, useValue: usuariosService },
      ],
    }).compile();

    service = moduleRef.get(EmpresasService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('registrar (E3-HU01 + E3-HU03)', () => {
    const dto: RegistrarEmpresaDto = {
      razonSocial: 'ACME SA',
      cuit: '20123456786',
      emailContacto: 'contacto@acme.com',
      aceptaTerminos: true,
      versionTerminos: 'v1',
    };

    it('registra la empresa cuando el CUIT y el correo son únicos', async () => {
      repository.findByCuit.mockResolvedValue(null);
      repository.findByEmailContacto.mockResolvedValue(null);
      repository.registrar.mockResolvedValue(empresaBase);

      const res = await service.registrar(dto);

      expect(repository.registrar).toHaveBeenCalledWith(dto);
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

  describe('altaCooperativa (E4-HU01)', () => {
    const dto: AltaCooperativaDto = {
      razonSocial: 'Cooperativa Verde',
      cuit: '20123456786',
      emailContacto: 'contacto@coopverde.com',
    };
    const cooperativa: Empresa = {
      ...empresaBase,
      id: 'coop-1',
      razonSocial: dto.razonSocial,
      emailContacto: dto.emailContacto,
      categoria: CategoriaEmpresa.COOPERATIVA,
      estado: EstadoEmpresa.APROBADA,
    };
    const billetera = { id: 'billetera-1', direccionEVM: '0xCoopWallet' };

    beforeEach(() => {
      repository.findByCuit.mockResolvedValue(null);
      repository.findByEmailContacto.mockResolvedValue(null);
      repository.altaCooperativa.mockResolvedValue(cooperativa);
      billeterasService.generarParaEmpresa.mockResolvedValue(billetera);
      blockchainService.grantValidatorRole.mockResolvedValue('0xTxHash');
      usuariosService.create.mockImplementation((data) =>
        Promise.resolve({ id: 'usuario-1', ...data }),
      );
    });

    it('crea la empresa, la billetera, otorga el rol y crea el usuario', async () => {
      const res = await service.altaCooperativa(dto);

      expect(repository.altaCooperativa).toHaveBeenCalledWith(dto);
      expect(billeterasService.generarParaEmpresa).toHaveBeenCalledWith(
        cooperativa.id,
        'VALIDATOR',
      );
      expect(blockchainService.grantValidatorRole).toHaveBeenCalledWith(
        billetera.direccionEVM,
      );
      expect(usuariosService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: dto.emailContacto,
          tipoRol: TipoRol.COOPERATIVA,
          empresaId: cooperativa.id,
        }),
      );

      expect(res.empresa).toBe(cooperativa);
      expect(res.direccionEVM).toBe(billetera.direccionEVM);
      expect(res.txHash).toBe('0xTxHash');
      expect(res.credencialesTemporales.email).toBe(dto.emailContacto);
      expect(res.credencialesTemporales.passwordTemporal).toEqual(
        expect.any(String),
      );
    });

    it('lanza ConflictException si el CUIT ya existe y no crea nada más', async () => {
      repository.findByCuit.mockResolvedValue(cooperativa);

      await expect(service.altaCooperativa(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repository.altaCooperativa).not.toHaveBeenCalled();
    });

    it('revierte empresa y billetera si falla el grant on-chain', async () => {
      blockchainService.grantValidatorRole.mockRejectedValue(
        new Error('RPC caído'),
      );

      await expect(service.altaCooperativa(dto)).rejects.toThrow('RPC caído');

      expect(billeterasService.remove).toHaveBeenCalledWith(billetera.id);
      expect(repository.remove).toHaveBeenCalledWith(cooperativa.id);
      expect(usuariosService.create).not.toHaveBeenCalled();
    });

    it('revierte empresa, billetera y usuario si falla la creación del usuario', async () => {
      usuariosService.create.mockRejectedValue(new Error('email duplicado'));

      await expect(service.altaCooperativa(dto)).rejects.toThrow(
        'email duplicado',
      );

      expect(billeterasService.remove).toHaveBeenCalledWith(billetera.id);
      expect(repository.remove).toHaveBeenCalledWith(cooperativa.id);
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

  describe('buscar (E4-HU03)', () => {
    it('devuelve [] sin consultar el repository si la query tiene menos de 2 caracteres', async () => {
      await expect(service.buscar('a')).resolves.toEqual([]);
      await expect(service.buscar('')).resolves.toEqual([]);
      await expect(service.buscar('   ')).resolves.toEqual([]);
      expect(repository.buscar).not.toHaveBeenCalled();
    });

    it('delega en el repository con la query recortada', async () => {
      const resultados = [{ ...empresaBase, razonSocial: 'ACME SA' }];
      repository.buscar.mockResolvedValue(resultados);

      const res = await service.buscar('  acme  ');

      expect(repository.buscar).toHaveBeenCalledWith('acme');
      expect(res).toBe(resultados);
    });
  });
});
