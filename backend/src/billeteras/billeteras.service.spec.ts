import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BilleterasService } from './billeteras.service';
import { BilleteraCustodialRepository } from './repository/billetera-custodial.repository';

describe('BilleterasService', () => {
  let service: BilleterasService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        BilleterasService,
        { provide: BilleteraCustodialRepository, useValue: {} },
        {
          provide: ConfigService,
          useValue: {
            get: jest
              .fn()
              .mockReturnValue('clave_maestra_para_pruebas_1234567890'),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(BilleterasService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('cifra y descifra una clave privada', () => {
    const clavePrivada =
      '0x1111111111111111111111111111111111111111111111111111111111111111';

    const cifrada = service.cifrarClavePrivada(clavePrivada);
    const descifrada = service.descifrarClavePrivada(cifrada);

    expect(cifrada).not.toEqual(clavePrivada);
    expect(descifrada).toEqual(clavePrivada);
  });

  it('genera una billetera custodial con dirección y clave cifrada', () => {
    const billetera = service.generarBilleteraCustodial();

    expect(billetera.direccionEVM).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(billetera.clavePrivadaCifrada).toContain(':');
    expect(billetera.tipoRolOnChain).toBe('EMPRESA');
  });
});
