import { Test } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { MovimientoTokenRepository } from './repository/movimiento-token.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('TokensService', () => {
  let service: TokensService;
  let repository: { sumarSaldoEmpresa: jest.Mock };
  let prisma: { empresa: { findUnique: jest.Mock } };

  beforeEach(async () => {
    repository = { sumarSaldoEmpresa: jest.fn().mockResolvedValue(165) };
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

    it('rechaza si el usuario no está asociado a una empresa', async () => {
      await expect(service.miSaldo(null)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(repository.sumarSaldoEmpresa).not.toHaveBeenCalled();
    });
  });
});
