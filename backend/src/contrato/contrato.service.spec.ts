import { Test } from '@nestjs/testing';
import { AccionPausa } from '@prisma/client';
import { ContratoService } from './contrato.service';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';

describe('ContratoService', () => {
  let service: ContratoService;
  let prisma: { pausaContrato: { create: jest.Mock } };
  let blockchainService: {
    estaPausado: jest.Mock;
    pausarContrato: jest.Mock;
    despausarContrato: jest.Mock;
  };

  beforeEach(async () => {
    prisma = { pausaContrato: { create: jest.fn() } };
    blockchainService = {
      estaPausado: jest.fn(),
      pausarContrato: jest.fn(),
      despausarContrato: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ContratoService,
        { provide: PrismaService, useValue: prisma },
        { provide: BlockchainService, useValue: blockchainService },
      ],
    }).compile();

    service = moduleRef.get(ContratoService);
  });

  it('estado devuelve el estado de pausa leído on-chain', async () => {
    blockchainService.estaPausado.mockResolvedValue(true);

    await expect(service.estado()).resolves.toEqual({ pausado: true });
  });

  it('pausar pausa on-chain y registra el motivo off-chain con timestamp', async () => {
    blockchainService.pausarContrato.mockResolvedValue('0xTxPause');

    const resultado = await service.pausar(
      'RPC comprometido',
      'admin@ecotoken.local',
    );

    expect(blockchainService.pausarContrato).toHaveBeenCalled();
    expect(prisma.pausaContrato.create).toHaveBeenCalledWith({
      data: {
        accion: AccionPausa.PAUSA,
        motivo: 'RPC comprometido',
        txHash: '0xTxPause',
        creadoPor: 'admin@ecotoken.local',
      },
    });
    expect(resultado).toEqual({ txHash: '0xTxPause' });
  });

  it('despausar despausa on-chain y registra el motivo off-chain', async () => {
    blockchainService.despausarContrato.mockResolvedValue('0xTxUnpause');

    const resultado = await service.despausar(
      'Incidente resuelto',
      'admin@ecotoken.local',
    );

    expect(blockchainService.despausarContrato).toHaveBeenCalled();
    expect(prisma.pausaContrato.create).toHaveBeenCalledWith({
      data: {
        accion: AccionPausa.DESPAUSA,
        motivo: 'Incidente resuelto',
        txHash: '0xTxUnpause',
        creadoPor: 'admin@ecotoken.local',
      },
    });
    expect(resultado).toEqual({ txHash: '0xTxUnpause' });
  });

  it('no registra off-chain si la pausa on-chain falla', async () => {
    blockchainService.pausarContrato.mockRejectedValue(new Error('RPC caído'));

    await expect(
      service.pausar('motivo', 'admin@ecotoken.local'),
    ).rejects.toThrow('RPC caído');
    expect(prisma.pausaContrato.create).not.toHaveBeenCalled();
  });
});
