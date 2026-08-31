import { Test } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';

describe('RolesService', () => {
  let service: RolesService;
  let prisma: { billeteraCustodial: { findMany: jest.Mock } };
  let blockchainService: {
    hasRole: jest.Mock;
    grantRole: jest.Mock;
    revokeRole: jest.Mock;
  };

  beforeEach(async () => {
    prisma = { billeteraCustodial: { findMany: jest.fn() } };
    blockchainService = {
      hasRole: jest.fn().mockResolvedValue(false),
      grantRole: jest.fn(),
      revokeRole: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: PrismaService, useValue: prisma },
        { provide: BlockchainService, useValue: blockchainService },
      ],
    }).compile();

    service = moduleRef.get(RolesService);
  });

  describe('listarCuentas', () => {
    it('devuelve cada cuenta con el estado on-chain de los 4 roles gobernables', async () => {
      prisma.billeteraCustodial.findMany.mockResolvedValue([
        {
          direccionEVM: '0xCoop',
          empresaId: 'e1',
          empresa: { razonSocial: 'Cooperativa Villa María' },
        },
      ]);
      blockchainService.hasRole.mockImplementation((rol: string) =>
        Promise.resolve(rol === 'VALIDATOR_ROLE'),
      );

      const cuentas = await service.listarCuentas();

      expect(cuentas).toEqual([
        {
          direccionEVM: '0xCoop',
          empresaId: 'e1',
          razonSocial: 'Cooperativa Villa María',
          roles: {
            MINTER_ROLE: false,
            BURNER_ROLE: false,
            VALIDATOR_ROLE: true,
            EMERGENCY_ROLE: false,
          },
        },
      ]);
    });
  });

  describe('otorgar / revocar', () => {
    it('delega en BlockchainService.grantRole', async () => {
      blockchainService.grantRole.mockResolvedValue('0xTxHash');

      const txHash = await service.otorgar('0xCoop', 'VALIDATOR_ROLE');

      expect(blockchainService.grantRole).toHaveBeenCalledWith(
        'VALIDATOR_ROLE',
        '0xCoop',
      );
      expect(txHash).toBe('0xTxHash');
    });

    it('delega en BlockchainService.revokeRole', async () => {
      blockchainService.revokeRole.mockResolvedValue('0xTxHash2');

      const txHash = await service.revocar('0xCoop', 'MINTER_ROLE');

      expect(blockchainService.revokeRole).toHaveBeenCalledWith(
        'MINTER_ROLE',
        '0xCoop',
      );
      expect(txHash).toBe('0xTxHash2');
    });
  });
});
