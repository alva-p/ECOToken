import { Test } from '@nestjs/testing';
import { ReportesService } from './reportes.service';
import { ReporteRepository } from './repository/reporte.repository';

describe('ReportesService', () => {
  let service: ReportesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReportesService,
        { provide: ReporteRepository, useValue: {} },
      ],
    }).compile();

    service = moduleRef.get(ReportesService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});
