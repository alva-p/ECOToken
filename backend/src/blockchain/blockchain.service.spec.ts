import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

const mockGrantRole = jest.fn();
const mockWait = jest.fn();

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');
  return {
    ...actual,
    JsonRpcProvider: jest.fn().mockImplementation(() => ({})),
    Wallet: jest.fn().mockImplementation(() => ({})),
    Contract: jest.fn().mockImplementation(() => ({
      grantRole: mockGrantRole,
    })),
  };
});

function buildConfig(overrides: Record<string, string> = {}): ConfigService {
  const values: Record<string, string> = {
    'blockchain.rpcUrl': 'https://rpc.example',
    'blockchain.contractAddress': '0xContract',
    'blockchain.adminPrivateKey': '0xAdminKey',
    ...overrides,
  };
  return { get: (key: string) => values[key] } as unknown as ConfigService;
}

async function buildService(
  configOverrides: Record<string, string> = {},
): Promise<BlockchainService> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      BlockchainService,
      { provide: ConfigService, useValue: buildConfig(configOverrides) },
    ],
  }).compile();
  return moduleRef.get(BlockchainService);
}

describe('BlockchainService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('grantValidatorRole', () => {
    it('otorga el rol y devuelve el hash de la transacción confirmada', async () => {
      mockGrantRole.mockResolvedValue({ wait: mockWait });
      mockWait.mockResolvedValue({ hash: '0xTxHash' });
      const service = await buildService();

      const txHash = await service.grantValidatorRole('0xCoopWallet');

      expect(mockGrantRole).toHaveBeenCalledWith(
        expect.any(String),
        '0xCoopWallet',
      );
      expect(txHash).toBe('0xTxHash');
    });

    it('lanza ServiceUnavailableException si la transacción falla', async () => {
      mockGrantRole.mockRejectedValue(new Error('RPC caído'));
      const service = await buildService();

      await expect(
        service.grantValidatorRole('0xCoopWallet'),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it('lanza ServiceUnavailableException si falta configuración blockchain', async () => {
      const service = await buildService({ 'blockchain.adminPrivateKey': '' });

      await expect(
        service.grantValidatorRole('0xCoopWallet'),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(mockGrantRole).not.toHaveBeenCalled();
    });
  });
});
