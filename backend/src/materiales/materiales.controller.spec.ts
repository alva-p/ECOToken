import { Test } from '@nestjs/testing';
import { MaterialesController } from './materiales.controller';
import { MaterialesService } from './materiales.service';

describe('MaterialesController', () => {
  let controller: MaterialesController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MaterialesController],
      providers: [{ provide: MaterialesService, useValue: {} }],
    }).compile();

    controller = moduleRef.get(MaterialesController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});
