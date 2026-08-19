import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMovimientoTokenDto } from '../dto/create-movimiento-token.dto';
import { UpdateMovimientoTokenDto } from '../dto/update-movimiento-token.dto';

/** Acceso a datos de MovimientoToken vía PrismaService. */
@Injectable()
export class MovimientoTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateMovimientoTokenDto) {
    return this.prisma.movimientoToken.create({ data: dto });
  }

  findAll() {
    return this.prisma.movimientoToken.findMany();
  }

  findById(id: string) {
    return this.prisma.movimientoToken.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateMovimientoTokenDto) {
    return this.prisma.movimientoToken.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.movimientoToken.delete({ where: { id } });
  }
}
