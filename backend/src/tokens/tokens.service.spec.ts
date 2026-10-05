import { Test } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { MovimientoTokenRepository } from './repository/movimiento-token.repository';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TokensService', () => {
  let service: TokensService;
  let repository: { sumarSaldoEmpresa: jest.Mock };
  let blockchain: { saldoOnChain: jest.Mock };
  let prisma: { empresa: { findUnique: jest.Mock } };

  beforeEach(async () => {
    repository = { sumarSaldoEmpresa: jest.fn().mockResolvedValue(165) };
    blockchain = { saldoOnChain: jest.fn().mockResolvedValue(null) };
    prisma = {
      empresa: {
        findUnique: jest.fn().mockResolvedValue({ walletAddress: '0xabc' }),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TokensService,
        { provide: MovimientoTokenRepository, useValue: repository },
        { provide: PrismaService, useValue: prisma },
        { provide: BlockchainService, useValue: blockchain },
      ],
    }).compile();

    service = moduleRef.get(TokensService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('miSaldo (E6-HU01)', () => {
    it('devuelve la suma de movimientos acuñados de la empresa', async () => {
      await expect(service.miSaldo('emp1')).resolves.toEqual({
        saldo: 165,
        walletAddress: '0xabc',
      });
      expect(repository.sumarSaldoEmpresa).toHaveBeenCalledWith('emp1');
    });

    it('prefiere el saldo on-chain cuando está disponible', async () => {
      blockchain.saldoOnChain.mockResolvedValue(1000);
      await expect(service.miSaldo('emp1')).resolves.toEqual({
        saldo: 1000,
        walletAddress: '0xabc',
      });
      expect(blockchain.saldoOnChain).toHaveBeenCalledWith('0xabc');
    });

    it('rechaza si el usuario no está asociado a una empresa', async () => {
      await expect(service.miSaldo(null)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(repository.sumarSaldoEmpresa).not.toHaveBeenCalled();
    });
  });
});
