import { Test } from '@nestjs/testing';
import { TokensService } from './tokens.service';
import { MovimientoTokenRepository } from './repository/movimiento-token.repository';

describe('TokensService', () => {
  let service: TokensService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TokensService,
        { provide: MovimientoTokenRepository, useValue: {} },
      ],
    }).compile();

    service = moduleRef.get(TokensService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});
