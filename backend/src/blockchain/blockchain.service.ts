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
const ECOTOKEN_ABI = [
  'function grantRole(bytes32 role, address account) external',
  'function hasRole(bytes32 role, address account) external view returns (bool)',
  'function mint(address empresa, uint256 amount, string material, uint256 peso) external',
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
}
