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
const ECOTOKEN_ABI = [
  'function grantRole(bytes32 role, address account) external',
  'function revokeRole(bytes32 role, address account) external',
  'function hasRole(bytes32 role, address account) external view returns (bool)',
  'function mint(address empresa, uint256 amount, string material, uint256 peso) external',
  'function pause() external',
  'function unpause() external',
  'function paused() external view returns (bool)',
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
  /** Contrato firmado por la cuenta ADMIN (otorga roles). */
  private readonly contract: Contract | null;
  /** Contrato firmado por la cuenta MINTER (acuña tokens, E5-HU01). */
  private readonly minterContract: Contract | null;

  constructor(private readonly config: ConfigService) {
    const rpcUrl = this.config.get<string>('blockchain.rpcUrl');
    const contractAddress = this.config.get<string>(
      'blockchain.contractAddress',
    );
    const adminPrivateKey = this.config.get<string>(
      'blockchain.adminPrivateKey',
    );
    const minterPrivateKey = this.config.get<string>(
      'blockchain.minterPrivateKey',
    );

    if (!rpcUrl || !contractAddress || !adminPrivateKey) {
      this.logger.warn(
        'Blockchain sin configurar (SEPOLIA_RPC_URL / ECOTOKEN_CONTRACT_ADDRESS / ' +
          'ADMIN_PRIVATE_KEY faltantes). Las operaciones on-chain fallarán hasta que ' +
          'se complete la configuración y exista un contrato desplegado.',
      );
      this.contract = null;
      this.minterContract = null;
      return;
    }

    // La construcción se envuelve en try/catch: una clave o dirección con formato
    // inválido (p. ej. los placeholders `0x...` de .env.example) no debe tirar
    // abajo el arranque de la app; simplemente deja la integración deshabilitada.
    try {
      const provider = new JsonRpcProvider(rpcUrl);
      this.contract = new Contract(
        contractAddress,
        ECOTOKEN_ABI,
        new Wallet(adminPrivateKey, provider),
      );
      this.minterContract = minterPrivateKey
        ? new Contract(
            contractAddress,
            ECOTOKEN_ABI,
            new Wallet(minterPrivateKey, provider),
          )
        : null;
    } catch (err) {
      this.logger.warn(
        `Blockchain con configuración inválida (${(err as Error).message}). ` +
          'Las operaciones on-chain quedarán deshabilitadas.',
      );
      this.contract = null;
      this.minterContract = null;
    }
  }

  /** True si la integración on-chain (cuenta ADMIN) está operativa. */
  get configurada(): boolean {
    return this.contract !== null;
  }

  /** True si se puede firmar la acuñación de tokens (cuenta MINTER configurada). */
  get mintDisponible(): boolean {
    return this.minterContract !== null;
  }

  /** True si la dirección tiene VALIDATOR_ROLE on-chain (E4-HU01/E5-HU01). */
  async tieneValidatorRole(address: string): Promise<boolean> {
    if (!this.contract) {
      throw new ServiceUnavailableException(
        'No se pudo verificar VALIDATOR_ROLE: la integración blockchain no está configurada.',
      );
    }
    return (await this.contract.hasRole(
      id('VALIDATOR_ROLE'),
      address,
    )) as boolean;
  }

  /**
   * Acuña `amount` tokens ECO hacia la billetera de una empresa, dejando
   * trazabilidad del material y el peso (evento `Minted`). Devuelve el hash de
   * la transacción y el bloque de confirmación (E5-HU01).
   */
  async mint(
    empresa: string,
    amount: number,
    material: string,
    peso: number,
  ): Promise<{ txHash: string; bloque: number }> {
    if (!this.minterContract) {
      throw new ServiceUnavailableException(
        'No se pudo acuñar: la cuenta MINTER no está configurada.',
      );
    }

    try {
      const tx = await this.minterContract.mint(
        empresa,
        BigInt(amount),
        material,
        BigInt(Math.round(peso)),
      );
      const receipt = await tx.wait();
      return {
        txHash: receipt.hash as string,
        bloque: Number(receipt.blockNumber),
      };
    } catch (err) {
      this.logger.error(
        `Falló el mint hacia ${empresa} (${amount} tokens): ${(err as Error).message}`,
      );
      throw new ServiceUnavailableException(
        'No se pudo acuñar los tokens on-chain. El ingreso quedó registrado y la acuñación puede reintentarse.',
      );
    }
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

  /** Estado actual de pausa del contrato (E10-HU02). */
  async estaPausado(): Promise<boolean> {
    if (!this.contract) {
      throw new ServiceUnavailableException(
        'No se pudo consultar el estado del contrato: la integración blockchain no está configurada.',
      );
    }

    try {
      return (await this.contract.paused()) as boolean;
    } catch (err) {
      this.logger.error(
        `Falló la consulta de pausa del contrato: ${(err as Error).message}`,
      );
      throw new ServiceUnavailableException(
        'No se pudo consultar el estado del contrato on-chain. Intentá nuevamente más tarde.',
      );
    }
  }

  /** Pausa el contrato (E10-HU02) y devuelve el hash de la tx confirmada. */
  pausarContrato(): Promise<string> {
    return this.enviarTransaccionSimple('pause', 'pausar');
  }

  /** Despausa el contrato (E10-HU02) y devuelve el hash de la tx confirmada. */
  despausarContrato(): Promise<string> {
    return this.enviarTransaccionSimple('unpause', 'despausar');
  }

  private async enviarTransaccionSimple(
    metodo: 'pause' | 'unpause',
    accion: string,
  ): Promise<string> {
    if (!this.contract) {
      throw new ServiceUnavailableException(
        `No se pudo ${accion} el contrato: la integración blockchain no está configurada.`,
      );
    }

    try {
      const tx = await this.contract[metodo]();
      const receipt = await tx.wait();
      return receipt.hash as string;
    } catch (err) {
      this.logger.error(
        `Falló el ${accion} del contrato: ${(err as Error).message}`,
      );
      throw new ServiceUnavailableException(
        `No se pudo ${accion} el contrato on-chain. Intentá nuevamente más tarde.`,
      );
    }
  }
}
