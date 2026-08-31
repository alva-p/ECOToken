import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovimientoTokenRepository } from './repository/movimiento-token.repository';
import { CreateMovimientoTokenDto } from './dto/create-movimiento-token.dto';
import { UpdateMovimientoTokenDto } from './dto/update-movimiento-token.dto';

/** Lógica de negocio de MovimientoToken. */
@Injectable()
export class TokensService {
  constructor(
    private readonly repository: MovimientoTokenRepository,
    private readonly prisma: PrismaService,
  ) {}

  create(dto: CreateMovimientoTokenDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const movimiento = await this.repository.findById(id);
    if (!movimiento)
      throw new NotFoundException(`Movimiento de token ${id} no encontrado`);
    return movimiento;
  }

  async update(id: string, dto: UpdateMovimientoTokenDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }

  // ─── E6-HU01: saldo de tokens de la empresa ───

  /** Saldo actual de tokens ECO y dirección EVM de la empresa logueada. */
  async miSaldo(
    empresaId: string | null,
  ): Promise<{ saldo: number; walletAddress: string | null }> {
    if (!empresaId) {
      throw new ForbiddenException(
        'El usuario no está asociado a ninguna empresa',
      );
    }
    const [saldo, empresa] = await Promise.all([
      this.repository.sumarSaldoEmpresa(empresaId),
      this.prisma.empresa.findUnique({
        where: { id: empresaId },
        select: { walletAddress: true },
      }),
    ]);
    return { saldo, walletAddress: empresa?.walletAddress ?? null };
  }
}
