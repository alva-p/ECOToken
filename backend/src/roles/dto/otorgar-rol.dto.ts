import { IsEthereumAddress, IsIn } from 'class-validator';
import {
  ROLES_GOBERNABLES,
  RolOnChain,
} from '../../blockchain/blockchain.service';

/** Datos para otorgar/revocar un rol on-chain a una cuenta (E10-HU01). */
export class OtorgarRolDto {
  @IsEthereumAddress()
  direccionEVM: string;

  @IsIn(ROLES_GOBERNABLES)
  rol: RolOnChain;
}
