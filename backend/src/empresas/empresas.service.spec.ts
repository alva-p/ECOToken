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
    findAll: jest.Mock;
    findByCuit: jest.Mock;
    findByEmailContacto: jest.Mock;
    registrar: jest.Mock;
    findByEstado: jest.Mock;
    findById: jest.Mock;
    updateEstado: jest.Mock;
    altaCooperativa: jest.Mock;
    remove: jest.Mock;
    update: jest.Mock;
    deactivate: jest.Mock;
    buscar: jest.Mock;
  };
  let billeterasService: { generarBilleteraCustodial: jest.Mock };
  let blockchainService: {
    grantValidatorRole: jest.Mock;
    revokeRole: jest.Mock;
  };
  let usuariosService: {
    create: jest.Mock;
    remove: jest.Mock;
    findByEmail: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByCuit: jest.fn(),
      findByEmailContacto: jest.fn(),
      registrar: jest.fn(),
      findByEstado: jest.fn(),
      findById: jest.fn(),
      updateEstado: jest.fn(),
      altaCooperativa: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
      update: jest.fn(),
      deactivate: jest.fn(),
      buscar: jest.fn(),
    };
    billeterasService = { generarBilleteraCustodial: jest.fn() };
    blockchainService = {
      grantValidatorRole: jest.fn(),
      revokeRole: jest.fn(),
    };
    usuariosService = {
      create: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
      findByEmail: jest.fn(),
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
    const billetera = {
      direccionEVM: '0xCoopWallet',
      clavePrivadaCifrada: 'iv:tag:ciphertext',
      tipoRolOnChain: 'VALIDATOR',
    };

    beforeEach(() => {
      repository.findByCuit.mockResolvedValue(null);
      repository.findByEmailContacto.mockResolvedValue(null);
      billeterasService.generarBilleteraCustodial.mockReturnValue(billetera);
      repository.altaCooperativa.mockResolvedValue(cooperativa);
      blockchainService.grantValidatorRole.mockResolvedValue('0xTxHash');
      usuariosService.create.mockImplementation((data) =>
        Promise.resolve({ id: 'usuario-1', ...data }),
      );
    });

    it('crea la empresa con billetera, otorga el rol y crea el usuario', async () => {
      const res = await service.altaCooperativa(dto);

      expect(billeterasService.generarBilleteraCustodial).toHaveBeenCalledWith(
        'VALIDATOR',
      );
      expect(repository.altaCooperativa).toHaveBeenCalledWith(dto, billetera);
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

    it('revierte la empresa si falla el grant on-chain', async () => {
      blockchainService.grantValidatorRole.mockRejectedValue(
        new Error('RPC caído'),
      );

      await expect(service.altaCooperativa(dto)).rejects.toThrow('RPC caído');

      expect(repository.remove).toHaveBeenCalledWith(cooperativa.id);
      expect(usuariosService.create).not.toHaveBeenCalled();
    });

    it('revierte empresa y usuario si falla la creación del usuario', async () => {
      usuariosService.create.mockRejectedValue(new Error('email duplicado'));

      await expect(service.altaCooperativa(dto)).rejects.toThrow(
        'email duplicado',
      );

      expect(repository.remove).toHaveBeenCalledWith(cooperativa.id);
    });
  });

  describe('aprobar / rechazar (E3-HU04)', () => {
    it('aprueba una empresa PENDIENTE → APROBADA y crea su usuario de acceso', async () => {
      repository.findById.mockResolvedValue(empresaBase);
      repository.updateEstado.mockResolvedValue({
        ...empresaBase,
        estado: EstadoEmpresa.APROBADA,
      });
      usuariosService.create.mockResolvedValue({
        id: 'u1',
        email: empresaBase.emailContacto,
      });

      const res = await service.aprobar('e1');

      expect(repository.updateEstado).toHaveBeenCalledWith(
        'e1',
        EstadoEmpresa.APROBADA,
      );
      expect(usuariosService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: empresaBase.emailContacto,
          tipoRol: TipoRol.EMPRESA,
          empresaId: empresaBase.id,
        }),
      );
      expect(res.credencialesTemporales.email).toBe(empresaBase.emailContacto);
      expect(res.credencialesTemporales.passwordTemporal).toEqual(
        expect.any(String),
      );
    });

    it('rechaza aprobar si la empresa no tiene email de contacto', async () => {
      repository.findById.mockResolvedValue({
        ...empresaBase,
        emailContacto: null,
      });

      await expect(service.aprobar('e1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(repository.updateEstado).not.toHaveBeenCalled();
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

  describe('baja lógica administrativa', () => {
    const cooperativa = {
      ...empresaBase,
      categoria: CategoriaEmpresa.COOPERATIVA,
      walletAddress: '0xCoopWallet',
    };

    it('revoca VALIDATOR_ROLE antes de desactivar una cooperativa', async () => {
      repository.findById.mockResolvedValue(cooperativa);
      blockchainService.revokeRole.mockResolvedValue('0xTxHash');
      repository.deactivate.mockResolvedValue({
        ...cooperativa,
        activa: false,
      });

      const resultado = await service.remove(cooperativa.id);

      expect(blockchainService.revokeRole).toHaveBeenCalledWith(
        'VALIDATOR_ROLE',
        cooperativa.walletAddress,
      );
      expect(repository.deactivate).toHaveBeenCalledWith(cooperativa.id);
      expect(resultado.txHash).toBe('0xTxHash');
    });

    it('no desactiva la cooperativa si falla la revocación on-chain', async () => {
      repository.findById.mockResolvedValue(cooperativa);
      blockchainService.revokeRole.mockRejectedValue(new Error('RPC caído'));

      await expect(service.remove(cooperativa.id)).rejects.toThrow('RPC caído');

      expect(repository.deactivate).not.toHaveBeenCalled();
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

    it('lanza ForbiddenException si está dada de baja', async () => {
      repository.findById.mockResolvedValue({
        ...empresaBase,
        estado: EstadoEmpresa.APROBADA,
        activa: false,
      });

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
