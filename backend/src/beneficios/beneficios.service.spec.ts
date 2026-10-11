import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { BeneficiosService } from './beneficios.service';

describe('BeneficiosService — canjes', () => {
  const beneficio = {
    id: 'b1',
    activo: true,
    vigenteHasta: null as Date | null,
    cupos: 2 as number | null,
    costoTokens: 1000,
  };
  let tx: {
    beneficio: { findUnique: jest.Mock };
    canje: { create: jest.Mock };
  };
  let repository: Record<string, jest.Mock>;
  let tokens: { miSaldo: jest.Mock };
  let service: BeneficiosService;

  beforeEach(() => {
    tx = {
      beneficio: { findUnique: jest.fn().mockResolvedValue({ ...beneficio }) },
      canje: { create: jest.fn().mockResolvedValue({ id: 'c1' }) },
    };
    repository = {
      transaccion: jest.fn((fn) => fn(tx)),
      cuposOcupados: jest.fn().mockResolvedValue(new Map([['b1', 1]])),
      reservado: jest.fn().mockResolvedValue(500),
      findCanje: jest.fn(),
      actualizarEstadoCanje: jest.fn(),
    };
    tokens = { miSaldo: jest.fn().mockResolvedValue({ saldo: 1500 }) };
    service = new BeneficiosService(repository as never, tokens as never);
  });

  it('crea la solicitud con el costo vigente si alcanzan saldo y cupos', async () => {
    await expect(service.canjear('emp1', 'b1')).resolves.toEqual({ id: 'c1' });
    expect(tx.canje.create).toHaveBeenCalledWith({
      data: { beneficioId: 'b1', empresaId: 'emp1', costoTokens: 1000 },
    });
  });

  it('descuenta lo reservado por otros canjes del saldo', async () => {
    repository.reservado.mockResolvedValue(501);
    await expect(service.canjear('emp1', 'b1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(tx.canje.create).not.toHaveBeenCalled();
  });

  it('rechaza si no quedan cupos', async () => {
    repository.cuposOcupados.mockResolvedValue(new Map([['b1', 2]]));
    await expect(service.canjear('emp1', 'b1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('rechaza beneficios pausados o vencidos', async () => {
    tx.beneficio.findUnique.mockResolvedValue({
      ...beneficio,
      vigenteHasta: new Date('2000-01-01'),
    });
    await expect(service.canjear('emp1', 'b1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('exige una empresa asociada', async () => {
    await expect(service.canjear(null, 'b1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('solo resuelve solicitudes pendientes', async () => {
    repository.findCanje.mockResolvedValue({ id: 'c1', estado: 'APROBADO' });
    await expect(
      service.resolverCanje('c1', 'RECHAZADO'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.actualizarEstadoCanje).not.toHaveBeenCalled();
  });
});
