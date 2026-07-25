import { Test } from '@nestjs/testing';
import { PuntajesController } from './puntajes.controller';
import { PuntajesService } from './puntajes.service';

describe('PuntajesController', () => {
  let controller: PuntajesController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PuntajesController],
      providers: [{ provide: PuntajesService, useValue: {} }],
    }).compile();

    controller = moduleRef.get(PuntajesController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});
