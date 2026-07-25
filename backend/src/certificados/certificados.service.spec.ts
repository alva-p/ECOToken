import { Test } from '@nestjs/testing';
import { CertificadosService } from './certificados.service';
import { CertificadoDigitalRepository } from './repository/certificado-digital.repository';

describe('CertificadosService', () => {
  let service: CertificadosService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CertificadosService,
        { provide: CertificadoDigitalRepository, useValue: {} },
      ],
    }).compile();

    service = moduleRef.get(CertificadosService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});
