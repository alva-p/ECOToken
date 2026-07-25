import { Test } from '@nestjs/testing';
import { PuntajesService } from './puntajes.service';
import { PuntajeRepository } from './repository/puntaje.repository';

describe('PuntajesService', () => {
  let service: PuntajesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PuntajesService, { provide: PuntajeRepository, useValue: {} }],
    }).compile();

    service = moduleRef.get(PuntajesService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});
