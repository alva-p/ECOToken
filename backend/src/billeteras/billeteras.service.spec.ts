import { Test } from '@nestjs/testing';
import { BilleterasService } from './billeteras.service';
import { BilleteraCustodialRepository } from './repository/billetera-custodial.repository';

describe('BilleterasService', () => {
  let service: BilleterasService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        BilleterasService,
        { provide: BilleteraCustodialRepository, useValue: {} },
      ],
    }).compile();

    service = moduleRef.get(BilleterasService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});
