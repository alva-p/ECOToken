import { Test } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { MovimientoTokenRepository } from './repository/movimiento-token.repository';

describe('TokensService', () => {
  let service: TokensService;
  let repository: { sumarSaldoEmpresa: jest.Mock };

  beforeEach(async () => {
    repository = { sumarSaldoEmpresa: jest.fn().mockResolvedValue(165) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TokensService,
        { provide: MovimientoTokenRepository, useValue: repository },
      ],
    }).compile();

    service = moduleRef.get(TokensService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('miSaldo (E6-HU01)', () => {
    it('devuelve la suma de movimientos acuñados de la empresa', async () => {
      await expect(service.miSaldo('emp1')).resolves.toEqual({ saldo: 165 });
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
