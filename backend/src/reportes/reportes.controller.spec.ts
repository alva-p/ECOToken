import { Test } from '@nestjs/testing';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

describe('ReportesController', () => {
  let controller: ReportesController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ReportesController],
      providers: [{ provide: ReportesService, useValue: {} }],
    }).compile();

    controller = moduleRef.get(ReportesController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});
