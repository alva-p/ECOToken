import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Wallet } from 'ethers';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';
import { BilleteraCustodialRepository } from './repository/billetera-custodial.repository';
import { CreateBilleteraCustodialDto } from './dto/create-billetera-custodial.dto';
import { UpdateBilleteraCustodialDto } from './dto/update-billetera-custodial.dto';

export interface BilleteraCustodialGenerada {
  direccionEVM: string;
  clavePrivadaCifrada: string;
  tipoRolOnChain: string;
}

/** Lógica de negocio de BilleteraCustodial. */
@Injectable()
export class BilleterasService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  create(dto: CreateBilleteraCustodialDto) {
    return this.repository.create(dto);
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

  /** Genera una billetera EVM y cifra su clave privada para almacenamiento custodial. */
  generarBilleteraCustodial(
    tipoRolOnChain = 'EMPRESA',
  ): BilleteraCustodialGenerada {
    const wallet = Wallet.createRandom();

    return {
      direccionEVM: wallet.address,
      clavePrivadaCifrada: this.cifrarClavePrivada(wallet.privateKey),
      tipoRolOnChain,
    };
  }

  /** Cifra una clave privada EVM con AES-256-GCM usando WALLET_ENCRYPTION_KEY. */
  cifrarClavePrivada(clavePrivada: string): string {
    const key = this.obtenerClaveMaestra();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([
      cipher.update(clavePrivada, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
      iv.toString('hex'),
      authTag.toString('hex'),
      ciphertext.toString('hex'),
    ].join(':');
  }

  /** Recupera la clave privada en claro para procedimientos de respaldo o restore. */
  descifrarClavePrivada(clavePrivadaCifrada: string): string {
    const key = this.obtenerClaveMaestra();
    const [ivHex, authTagHex, ciphertextHex] = clavePrivadaCifrada.split(':');

    if (!ivHex || !authTagHex || !ciphertextHex) {
      throw new BadRequestException(
        'Formato inválido de clave privada cifrada',
      );
    }

    const decipher = createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(ivHex, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertextHex, 'hex')),
      decipher.final(),
    ]);

    return plaintext.toString('utf8');
  }

  private obtenerClaveMaestra(): Buffer {
    const clave = this.configService
      .get<string>('WALLET_ENCRYPTION_KEY')
      ?.trim();

    if (!clave || clave === 'cambiar_por_clave_de_cifrado') {
      throw new BadRequestException(
        'WALLET_ENCRYPTION_KEY es obligatoria para generar billeteras custodiales',
      );
    }

    return createHash('sha256').update(clave, 'utf8').digest();
  }
}
