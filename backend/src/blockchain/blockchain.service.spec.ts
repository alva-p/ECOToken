import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

const mockGrantRole = jest.fn();
const mockRevokeRole = jest.fn();
const mockHasRole = jest.fn();
const mockPause = jest.fn();
const mockUnpause = jest.fn();
const mockPaused = jest.fn();
const mockWait = jest.fn();
const mockGetBlockNumber = jest.fn();
const mockMint = jest.fn();
const mockGetFeeData = jest.fn();
const mockGetTransactionReceipt = jest.fn();

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');
  return {
    ...actual,
    JsonRpcProvider: jest.fn().mockImplementation(() => ({})),
    Wallet: jest.fn().mockImplementation(() => ({})),
    Contract: jest.fn().mockImplementation(() => ({
      grantRole: mockGrantRole,
      revokeRole: mockRevokeRole,
      hasRole: mockHasRole,
      pause: mockPause,
      unpause: mockUnpause,
      paused: mockPaused,
      mint: mockMint,
      runner: {
        provider: {
          getBlockNumber: mockGetBlockNumber,
          getFeeData: mockGetFeeData,
          getTransactionReceipt: mockGetTransactionReceipt,
        },
      },
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

  describe('existeTransaccion', () => {
    it('es true si la cadena devuelve el recibo y false si no existe', async () => {
      const service = await buildService();

      mockGetTransactionReceipt.mockResolvedValueOnce({ status: 1 });
      await expect(service.existeTransaccion('0xreal')).resolves.toBe(true);

      mockGetTransactionReceipt.mockResolvedValueOnce(null);
      await expect(service.existeTransaccion('0xfalso')).resolves.toBe(false);
    });
  });

  describe('mint', () => {
    const conMinter = { 'blockchain.minterPrivateKey': '0xMinterKey' };

    it('serializa el envío de acuñaciones (no pisan el nonce) pero confirma en paralelo', async () => {
      const orden: string[] = [];
      let liberarPrimero!: (tx: unknown) => void;
      mockMint
        .mockImplementationOnce(() => {
          orden.push('envío 1');
          return new Promise((resolve) => (liberarPrimero = resolve));
        })
        .mockImplementationOnce(() => {
          orden.push('envío 2');
          return Promise.resolve({
            wait: () => Promise.resolve({ hash: '0xB', blockNumber: 2 }),
          });
        });
      const service = await buildService(conMinter);

      const a = service.mint('0xE', 10, 'VIDRIO', 1);
      const b = service.mint('0xE', 20, 'VIDRIO', 2);
      await new Promise((r) => setImmediate(r));
      // El segundo no se envía hasta que el primero entró al mempool.
      expect(orden).toEqual(['envío 1']);

      liberarPrimero({
        wait: () => Promise.resolve({ hash: '0xA', blockNumber: 1 }),
      });
      await expect(a).resolves.toEqual({ txHash: '0xA', bloque: 1 });
      await expect(b).resolves.toEqual({ txHash: '0xB', bloque: 2 });
      expect(orden).toEqual(['envío 1', 'envío 2']);
    });

    it('un envío que falla no traba la cola', async () => {
      mockMint
        .mockRejectedValueOnce(new Error('nonce too low'))
        .mockResolvedValueOnce({
          wait: () => Promise.resolve({ hash: '0xOK', blockNumber: 9 }),
        });
      const service = await buildService(conMinter);

      await expect(service.mint('0xE', 1, 'VIDRIO', 1)).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
      await expect(service.mint('0xE', 1, 'VIDRIO', 1)).resolves.toEqual({
        txHash: '0xOK',
        bloque: 9,
      });
    });

    it('con GAS_PRIORITY_GWEI sube la propina; sin configurar no toca la fee', async () => {
      mockMint.mockResolvedValue({
        wait: () => Promise.resolve({ hash: '0xA', blockNumber: 1 }),
      });
      mockGetFeeData.mockResolvedValue({
        maxFeePerGas: 2_000_000_000n,
        maxPriorityFeePerGas: 1_000_000_000n,
      });

      await (await buildService(conMinter)).mint('0xE', 1, 'VIDRIO', 1);
      expect(mockMint).toHaveBeenLastCalledWith('0xE', 1n, 'VIDRIO', 1n, {});

      await (
        await buildService({
          ...conMinter,
          'blockchain.gasPriorityGwei': '5',
        })
      ).mint('0xE', 1, 'VIDRIO', 1);
      expect(mockMint).toHaveBeenLastCalledWith('0xE', 1n, 'VIDRIO', 1n, {
        maxPriorityFeePerGas: 5_000_000_000n,
        // base (2 gwei - 1 de propina) + 5 gwei de propina nueva
        maxFeePerGas: 6_000_000_000n,
      });
    });
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

  describe('E10-HU01: gestión genérica de roles', () => {
    it('hasRole consulta el contrato con el bytes32 del rol pedido', async () => {
      mockHasRole.mockResolvedValue(true);
      const service = await buildService();

      const tieneRol = await service.hasRole('MINTER_ROLE', '0xCuenta');

      expect(mockHasRole).toHaveBeenCalledWith(expect.any(String), '0xCuenta');
      expect(tieneRol).toBe(true);
    });

    it('grantRole otorga el rol pedido y devuelve el hash de la tx', async () => {
      mockGrantRole.mockResolvedValue({ wait: mockWait });
      mockWait.mockResolvedValue({ hash: '0xTxGrant' });
      const service = await buildService();

      const txHash = await service.grantRole('BURNER_ROLE', '0xCuenta');

      expect(mockGrantRole).toHaveBeenCalledWith(
        expect.any(String),
        '0xCuenta',
      );
      expect(txHash).toBe('0xTxGrant');
    });

    it('revokeRole revoca el rol pedido y devuelve el hash de la tx', async () => {
      mockRevokeRole.mockResolvedValue({ wait: mockWait });
      mockWait.mockResolvedValue({ hash: '0xTxRevoke' });
      const service = await buildService();

      const txHash = await service.revokeRole('EMERGENCY_ROLE', '0xCuenta');

      expect(mockRevokeRole).toHaveBeenCalledWith(
        expect.any(String),
        '0xCuenta',
      );
      expect(txHash).toBe('0xTxRevoke');
    });

    it('rechaza un rol fuera de ROLES_GOBERNABLES sin llamar al contrato', async () => {
      const service = await buildService();

      await expect(
        // @ts-expect-error: se prueba a propósito con un rol inválido
        service.grantRole('ADMIN_ROLE', '0xCuenta'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mockGrantRole).not.toHaveBeenCalled();
    });

    it('lanza ServiceUnavailableException si revokeRole falla', async () => {
      mockRevokeRole.mockRejectedValue(new Error('RPC caído'));
      const service = await buildService();

      await expect(
        service.revokeRole('VALIDATOR_ROLE', '0xCuenta'),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });

  describe('E10-HU02: pausa del contrato', () => {
    it('estaPausado devuelve el estado leído del contrato', async () => {
      mockPaused.mockResolvedValue(true);
      const service = await buildService();

      await expect(service.estaPausado()).resolves.toBe(true);
    });

    it('pausarContrato pausa y devuelve el hash de la tx', async () => {
      mockPause.mockResolvedValue({ wait: mockWait });
      mockWait.mockResolvedValue({ hash: '0xTxPause' });
      const service = await buildService();

      const txHash = await service.pausarContrato();

      expect(mockPause).toHaveBeenCalled();
      expect(txHash).toBe('0xTxPause');
    });

    it('despausarContrato despausa y devuelve el hash de la tx', async () => {
      mockUnpause.mockResolvedValue({ wait: mockWait });
      mockWait.mockResolvedValue({ hash: '0xTxUnpause' });
      const service = await buildService();

      const txHash = await service.despausarContrato();

      expect(mockUnpause).toHaveBeenCalled();
      expect(txHash).toBe('0xTxUnpause');
    });

    it('lanza ServiceUnavailableException si pausarContrato falla', async () => {
      mockPause.mockRejectedValue(new Error('RPC caído'));
      const service = await buildService();

      await expect(service.pausarContrato()).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });
  });

  describe('E7-HU02: bloque de referencia', () => {
    it('devuelve el número de bloque actual de la red', async () => {
      mockGetBlockNumber.mockResolvedValue(123456);
      const service = await buildService();

      await expect(service.bloqueActual()).resolves.toBe(123456);
    });

    it('devuelve null (no lanza) si la integración no está configurada', async () => {
      const service = await buildService({ 'blockchain.adminPrivateKey': '' });

      await expect(service.bloqueActual()).resolves.toBeNull();
      expect(mockGetBlockNumber).not.toHaveBeenCalled();
    });

    it('devuelve null (no lanza) si falla la consulta al nodo', async () => {
      mockGetBlockNumber.mockRejectedValue(new Error('RPC caído'));
      const service = await buildService();

      await expect(service.bloqueActual()).resolves.toBeNull();
    });
  });
});
