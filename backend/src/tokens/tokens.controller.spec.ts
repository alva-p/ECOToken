import { Test } from '@nestjs/testing';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';

describe('TokensController', () => {
  let controller: TokensController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TokensController],
      providers: [{ provide: TokensService, useValue: {} }],
    }).compile();

    controller = moduleRef.get(TokensController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});
