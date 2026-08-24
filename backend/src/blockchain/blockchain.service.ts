import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, id, JsonRpcProvider, Wallet } from 'ethers';

/**
 * ABI mínimo: sólo lo que este servicio necesita hoy (otorgar roles de
 * OpenZeppelin AccessControl). No hay todavía un ABI generado por un deploy
 * real (ver contracts/deployments/, vacío) — cuando exista, este array se
 * reemplaza por el ABI completo copiado desde ahí (ver doc/ESTRUCTURA-PROYECTO.md §3).
 */
const ACCESS_CONTROL_ABI = [
  'function grantRole(bytes32 role, address account) external',
  'function hasRole(bytes32 role, address account) external view returns (bool)',
  'function pause() external',
  'function unpause() external',
  'function paused() external view returns (bool)',
];

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
  async grantValidatorRole(address: string): Promise<string> {
    if (!this.contract) {
      throw new ServiceUnavailableException(
        'No se pudo otorgar VALIDATOR_ROLE: la integración blockchain no está configurada.',
      );
    }

    try {
      const role = id('VALIDATOR_ROLE');
      const tx = await this.contract.grantRole(role, address);
      const receipt = await tx.wait();
      return receipt.hash as string;
    } catch (err) {
      this.logger.error(
        `Falló el otorgamiento de VALIDATOR_ROLE a ${address}: ${(err as Error).message}`,
      );
      throw new ServiceUnavailableException(
        'No se pudo otorgar VALIDATOR_ROLE on-chain. Intentá nuevamente más tarde.',
      );
    }
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
