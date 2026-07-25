import { Test } from '@nestjs/testing';
import { CertificadoDigitalRepository } from './certificado-digital.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('CertificadoDigitalRepository', () => {
  let repository: CertificadoDigitalRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CertificadoDigitalRepository,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    repository = moduleRef.get(CertificadoDigitalRepository);
  });

  it('debería estar definido', () => {
    expect(repository).toBeDefined();
  });
});
