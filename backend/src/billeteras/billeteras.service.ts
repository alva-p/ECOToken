import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Wallet } from 'ethers';
import { encrypt } from '../common/helpers/crypto.helper';
import { BilleteraCustodialRepository } from './repository/billetera-custodial.repository';
import { CreateBilleteraCustodialDto } from './dto/create-billetera-custodial.dto';
import { UpdateBilleteraCustodialDto } from './dto/update-billetera-custodial.dto';

/** Lógica de negocio de BilleteraCustodial. */
@Injectable()
export class BilleterasService {
  constructor(
    private readonly repository: BilleteraCustodialRepository,
    private readonly config: ConfigService,
  ) {}

  create(dto: CreateBilleteraCustodialDto) {
    return this.repository.create(dto);
  }

  /**
   * Genera un par de claves EVM nuevo para una Empresa (p. ej. la cuenta
   * operadora de una cooperativa, E4-HU01), cifra la clave privada antes de
   * persistirla y devuelve la BilleteraCustodial creada.
   */
  async generarParaEmpresa(empresaId: string, tipoRolOnChain: string) {
    const wallet = Wallet.createRandom();
    const encryptionKey = this.config.get<string>('walletEncryptionKey');
    if (!encryptionKey) {
      throw new Error(
        'No se puede generar una billetera custodial: falta WALLET_ENCRYPTION_KEY.',
      );
    }

    return this.repository.create({
      direccionEVM: wallet.address,
      clavePrivadaCifrada: encrypt(wallet.privateKey, encryptionKey),
      tipoRolOnChain,
      empresaId,
    });
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const billetera = await this.repository.findById(id);
    if (!billetera)
      throw new NotFoundException(`BilleteraCustodial ${id} no encontrada`);
    return billetera;
  }

  async update(id: string, dto: UpdateBilleteraCustodialDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }
}
