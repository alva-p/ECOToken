import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, id, JsonRpcProvider, Wallet } from 'ethers';

/**
 * ABI mínimo: sólo lo que este servicio necesita hoy (otorgar/revocar roles
 * de OpenZeppelin AccessControl). No hay todavía un ABI generado por un
 * deploy real (ver contracts/deployments/, vacío) — cuando exista, este
 * array se reemplaza por el ABI completo copiado desde ahí (ver
 * doc/ESTRUCTURA-PROYECTO.md §3).
 */
const ACCESS_CONTROL_ABI = [
  'function grantRole(bytes32 role, address account) external',
  'function revokeRole(bytes32 role, address account) external',
  'function hasRole(bytes32 role, address account) external view returns (bool)',
];

/**
 * Roles gobernables desde el panel de admin (E10-HU01). ADMIN_ROLE queda
 * afuera a propósito: es DEFAULT_ADMIN_ROLE y transferirlo por este panel
 * genérico es demasiado sensible para el alcance de esta historia.
 */
export const ROLES_GOBERNABLES = [
  'MINTER_ROLE',
  'BURNER_ROLE',
  'VALIDATOR_ROLE',
  'EMERGENCY_ROLE',
] as const;

export type RolOnChain = (typeof ROLES_GOBERNABLES)[number];

/**
 * Núcleo Web3 del modelo custodial. Responsabilidades actuales:
 *  - Otorgar roles on-chain (E4-HU01: VALIDATOR_ROLE a la cuenta operadora de
 *    una cooperativa recién dada de alta).
 * Responsabilidades futuras (ver doc/ESTRUCTURA-PROYECTO.md §4.2):
 *  - mint/burn firmados con las cuentas MINTER/BURNER (E5-HU01).
 *
 * Un rol de AccessControl es simplemente `keccak256(nombre)` calculado
 * off-chain (`ethers.id(...)`) — no hace falta que el contrato declare una
 * constante Solidity para ese rol para poder otorgarlo con `grantRole`.
 */
@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private readonly contract: Contract | null;

  constructor(private readonly config: ConfigService) {
    const rpcUrl = this.config.get<string>('blockchain.rpcUrl');
    const contractAddress = this.config.get<string>(
      'blockchain.contractAddress',
    );
    const adminPrivateKey = this.config.get<string>(
      'blockchain.adminPrivateKey',
    );

    if (!rpcUrl || !contractAddress || !adminPrivateKey) {
      this.logger.warn(
        'Blockchain sin configurar (SEPOLIA_RPC_URL / ECOTOKEN_CONTRACT_ADDRESS / ' +
          'ADMIN_PRIVATE_KEY faltantes). Las operaciones on-chain fallarán hasta que ' +
          'se complete la configuración y exista un contrato desplegado.',
      );
      this.contract = null;
      return;
    }

    const provider = new JsonRpcProvider(rpcUrl);
    const adminSigner = new Wallet(adminPrivateKey, provider);
    this.contract = new Contract(
      contractAddress,
      ACCESS_CONTROL_ABI,
      adminSigner,
    );
  }

  /**
   * Otorga VALIDATOR_ROLE a la dirección de la billetera operadora de una
   * cooperativa (E4-HU01) y devuelve el hash de la transacción confirmada.
   */
  grantValidatorRole(address: string): Promise<string> {
    return this.grantRole('VALIDATOR_ROLE', address);
  }

  /** Consulta si `address` tiene `rol` otorgado on-chain (E10-HU01). */
  async hasRole(rol: RolOnChain, address: string): Promise<boolean> {
    const roleId = this.roleId(rol);
    if (!this.contract) {
      throw new ServiceUnavailableException(
        `No se pudo consultar ${rol}: la integración blockchain no está configurada.`,
      );
    }

    try {
      return (await this.contract.hasRole(roleId, address)) as boolean;
    } catch (err) {
      this.logger.error(
        `Falló la consulta de ${rol} para ${address}: ${(err as Error).message}`,
      );
      throw new ServiceUnavailableException(
        `No se pudo consultar ${rol} on-chain. Intentá nuevamente más tarde.`,
      );
    }
  }

  /** Otorga `rol` a `address` on-chain (E10-HU01) y devuelve el hash de la tx confirmada. */
  async grantRole(rol: RolOnChain, address: string): Promise<string> {
    return this.enviarTransaccionDeRol('grantRole', 'otorgar', rol, address);
  }

  /** Revoca `rol` a `address` on-chain (E10-HU01) y devuelve el hash de la tx confirmada. */
  async revokeRole(rol: RolOnChain, address: string): Promise<string> {
    return this.enviarTransaccionDeRol('revokeRole', 'revocar', rol, address);
  }

  private async enviarTransaccionDeRol(
    metodo: 'grantRole' | 'revokeRole',
    accion: string,
    rol: RolOnChain,
    address: string,
  ): Promise<string> {
    const roleId = this.roleId(rol);
    if (!this.contract) {
      throw new ServiceUnavailableException(
        `No se pudo ${accion} ${rol}: la integración blockchain no está configurada.`,
      );
    }

    try {
      const tx = await this.contract[metodo](roleId, address);
      const receipt = await tx.wait();
      return receipt.hash as string;
    } catch (err) {
      this.logger.error(
        `Falló el ${accion} de ${rol} a ${address}: ${(err as Error).message}`,
      );
      throw new ServiceUnavailableException(
        `No se pudo ${accion} ${rol} on-chain. Intentá nuevamente más tarde.`,
      );
    }
  }

  private roleId(rol: RolOnChain): string {
    if (!ROLES_GOBERNABLES.includes(rol)) {
      throw new BadRequestException(`Rol desconocido: ${rol}`);
    }
    return id(rol);
  }
}
