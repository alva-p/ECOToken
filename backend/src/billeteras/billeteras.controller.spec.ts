import { Test } from '@nestjs/testing';
import { BilleterasController } from './billeteras.controller';
import { BilleterasService } from './billeteras.service';

describe('BilleterasController', () => {
  let controller: BilleterasController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [BilleterasController],
      providers: [{ provide: BilleterasService, useValue: {} }],
    }).compile();

    controller = moduleRef.get(BilleterasController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});
