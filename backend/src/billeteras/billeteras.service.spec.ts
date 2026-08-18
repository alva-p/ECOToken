import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BilleterasService } from './billeteras.service';
import { BilleteraCustodialRepository } from './repository/billetera-custodial.repository';

describe('BilleterasService', () => {
  let service: BilleterasService;
  let repository: { create: jest.Mock };
  let config: { get: jest.Mock };

  beforeEach(async () => {
    repository = { create: jest.fn() };
    config = { get: jest.fn().mockReturnValue('clave-de-cifrado-de-prueba') };

    const moduleRef = await Test.createTestingModule({
      providers: [
        BilleterasService,
        { provide: BilleteraCustodialRepository, useValue: repository },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = moduleRef.get(BilleterasService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('generarParaEmpresa (E4-HU01)', () => {
    it('genera una wallet, cifra la clave privada y la persiste', async () => {
      repository.create.mockImplementation((data) => ({ id: 'b1', ...data }));

      const billetera = await service.generarParaEmpresa('empresa-1', 'VALIDATOR');

      expect(repository.create).toHaveBeenCalledTimes(1);
      const dto = repository.create.mock.calls[0][0];
      expect(dto.empresaId).toBe('empresa-1');
      expect(dto.tipoRolOnChain).toBe('VALIDATOR');
      expect(dto.direccionEVM).toMatch(/^0x[a-fA-F0-9]{40}$/);
      // La clave privada nunca se persiste en claro: el payload cifrado tiene
      // el formato iv:authTag:ciphertext (3 segmentos base64), no el de una
      // clave privada EVM en hexadecimal (0x + 64 dígitos).
      expect(dto.clavePrivadaCifrada).toMatch(
        /^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/,
      );
      expect(dto.clavePrivadaCifrada).not.toMatch(/^0x[a-fA-F0-9]{64}$/);
      expect(billetera.id).toBe('b1');
    });

    it('lanza si falta WALLET_ENCRYPTION_KEY', async () => {
      config.get.mockReturnValue('');

      await expect(
        service.generarParaEmpresa('empresa-1', 'VALIDATOR'),
      ).rejects.toThrow('WALLET_ENCRYPTION_KEY');
      expect(repository.create).not.toHaveBeenCalled();
    });
  });
});
