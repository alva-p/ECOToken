import { Test } from '@nestjs/testing';
import { CertificadosController } from './certificados.controller';
import { CertificadosService } from './certificados.service';

describe('CertificadosController', () => {
  let controller: CertificadosController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CertificadosController],
      providers: [{ provide: CertificadosService, useValue: {} }],
    }).compile();

    controller = moduleRef.get(CertificadosController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});
