import type { Empresa } from '../../empresas/entities/empresa.entity';

/**
 * Billetera custodial de una empresa: dirección EVM y clave privada cifrada
 * administradas por la plataforma (modelo custodial).
 *
 * La clave privada se almacena SIEMPRE cifrada (clavePrivadaCifrada); nunca
 * debe manejarse en claro ni exponerse en logs o respuestas.
 */
export class BilleteraCustodial {
  id: string;
  direccionEVM: string;
  clavePrivadaCifrada: string;
  tipoRolOnChain: string;
  empresaId: string;
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  empresa?: Empresa;
}
