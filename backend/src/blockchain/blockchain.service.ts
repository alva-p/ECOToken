import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Núcleo Web3 del modelo custodial (STUB inicial - Sprint 0).
 * Responsabilidades futuras:
 *  - Conectar al provider (Sepolia) y al contrato ECOToken vía ethers.
 *  - Firmar mint/burn con las cuentas operadoras (MINTER/BURNER).
 *  - Calcular tokens según la tabla de conversión.
 * Ver doc/ESTRUCTURA-PROYECTO.md §4.2 (flujo registro de material → mint).
 */
@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);

  constructor(private readonly config: ConfigService) {}

  // TODO(sprint): async mint(empresaWallet, tipoMaterial, pesoGramos): Promise<string /* txHash */>
  // TODO(sprint): async emergencyBurn(from, amount): Promise<string>
}
