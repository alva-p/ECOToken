import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEstadoDto } from '../dto/create-estado.dto';
import { UpdateEstadoDto } from '../dto/update-estado.dto';

/** Acceso a datos de Estado vía PrismaService. */
@Injectable()
export class EstadoRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateEstadoDto) {
    return this.prisma.estado.create({ data: dto });
  }

  findAll() {
    return this.prisma.estado.findMany();
  }

  findById(id: string) {
    return this.prisma.estado.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateEstadoDto) {
    return this.prisma.estado.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.estado.delete({ where: { id } });
  }
}
