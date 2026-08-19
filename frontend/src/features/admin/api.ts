import { api } from '@/lib/api';
import type { Empresa } from '@/types';

export interface AltaCooperativaInput {
  razonSocial: string;
  cuit: string;
  emailContacto: string;
  domicilio?: string;
  representanteLegal?: string;
}

export interface AltaCooperativaResponse {
  empresa: Empresa;
  direccionEVM: string;
  txHash: string;
  credencialesTemporales: {
    email: string;
    passwordTemporal: string;
  };
}

/** Alta administrativa de cooperativa (E4-HU01): crea la cuenta operadora
 * on-chain (VALIDATOR_ROLE) y las credenciales de acceso de la cooperativa. */
export function altaCooperativa(
  dto: AltaCooperativaInput,
): Promise<AltaCooperativaResponse> {
  return api<AltaCooperativaResponse>('/empresas/cooperativas', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}
