import { Injectable } from '@nestjs/common';
import { AccionPausa } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';

/** Pausa/despausa del contrato con motivo registrado off-chain (E10-HU02). */
@Injectable()
export class ContratoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainService,
  ) {}

  async estado() {
    return { pausado: await this.blockchainService.estaPausado() };
  }

  async pausar(motivo: string, creadoPor: string): Promise<{ txHash: string }> {
    const txHash = await this.blockchainService.pausarContrato();
    await this.registrar(AccionPausa.PAUSA, motivo, txHash, creadoPor);
    return { txHash };
  }

  async despausar(
    motivo: string,
    creadoPor: string,
  ): Promise<{ txHash: string }> {
    const txHash = await this.blockchainService.despausarContrato();
    await this.registrar(AccionPausa.DESPAUSA, motivo, txHash, creadoPor);
    return { txHash };
  }

  /**
   * Persiste el registro de auditoría *después* de que la tx on-chain
   * confirmó: si el registro fallara antes, quedaría un motivo guardado sin
   * que el contrato haya cambiado de estado.
   */
  private registrar(
    accion: AccionPausa,
    motivo: string,
    txHash: string,
    creadoPor: string,
  ) {
    return this.prisma.pausaContrato.create({
      data: { accion, motivo, txHash, creadoPor },
    });
  }
}
