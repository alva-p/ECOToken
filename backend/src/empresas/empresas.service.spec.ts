import { Test } from '@nestjs/testing';
import { CategoriaEmpresa } from '@prisma/client';
import { EmpresasService } from './empresas.service';
import { EmpresaRepository } from './repository/empresa.repository';
import { BilleterasService } from '../billeteras/billeteras.service';

describe('EmpresasService', () => {
  let service: EmpresasService;
  const repository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const billeterasService = {
    generarBilleteraCustodial: jest.fn(),
  };

  beforeEach(async () => {
    repository.create.mockReset();
    repository.findAll.mockReset();
    repository.findById.mockReset();
    repository.update.mockReset();
    repository.remove.mockReset();
    billeterasService.generarBilleteraCustodial.mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        EmpresasService,
        { provide: EmpresaRepository, useValue: repository },
        { provide: BilleterasService, useValue: billeterasService },
      ],
    }).compile();

    service = moduleRef.get(EmpresasService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('genera una billetera custodial al registrar una empresa', () => {
    const dto = {
      razonSocial: 'Eco SRL',
      cuit: '20-12345678-9',
      categoria: CategoriaEmpresa.EMPRESA,
    } as never;

    billeterasService.generarBilleteraCustodial.mockReturnValue({
      direccionEVM: '0x1234567890abcdef1234567890abcdef12345678',
      clavePrivadaCifrada: 'iv:tag:ciphertext',
      tipoRolOnChain: 'EMPRESA',
    });
    repository.create.mockReturnValue({ id: 'empresa-1' });

    const resultado = service.registrar(dto);

    expect(billeterasService.generarBilleteraCustodial).toHaveBeenCalledWith(
      'EMPRESA',
    );
    expect(repository.create).toHaveBeenCalledWith(dto, {
      direccionEVM: '0x1234567890abcdef1234567890abcdef12345678',
      clavePrivadaCifrada: 'iv:tag:ciphertext',
      tipoRolOnChain: 'EMPRESA',
    });
    expect(resultado).toEqual({ id: 'empresa-1' });
  });
});
