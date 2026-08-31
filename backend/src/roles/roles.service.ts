import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  BlockchainService,
  ROLES_GOBERNABLES,
  RolOnChain,
} from '../blockchain/blockchain.service';

/** Gestión de roles on-chain desde el panel de admin (E10-HU01). */
@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainService,
  ) {}

  /**
   * Cuentas custodiales registradas con el estado real (on-chain, via
   * hasRole) de cada rol gobernable. Se lee del contrato en vez de confiar
   * en BilleteraCustodial.tipoRolOnChain para no reflejar un rol
   * desactualizado si se otorgó/revocó por fuera de este panel.
   */
  async listarCuentas() {
    const billeteras = await this.prisma.billeteraCustodial.findMany({
      include: { empresa: { select: { razonSocial: true } } },
    });

    return Promise.all(
      billeteras.map(async (billetera) => ({
        direccionEVM: billetera.direccionEVM,
        empresaId: billetera.empresaId,
        razonSocial: billetera.empresa?.razonSocial ?? null,
        roles: await this.rolesDeCuenta(billetera.direccionEVM),
      })),
    );
  }

  private async rolesDeCuenta(
    direccionEVM: string,
  ): Promise<Record<RolOnChain, boolean>> {
    const entries = await Promise.all(
      ROLES_GOBERNABLES.map(
        async (rol) =>
          [
            rol,
            await this.blockchainService.hasRole(rol, direccionEVM),
          ] as const,
      ),
    );
    return Object.fromEntries(entries) as Record<RolOnChain, boolean>;
  }

  otorgar(direccionEVM: string, rol: RolOnChain) {
    return this.blockchainService.grantRole(rol, direccionEVM);
  }

  revocar(direccionEVM: string, rol: RolOnChain) {
    return this.blockchainService.revokeRole(rol, direccionEVM);
  }
}
