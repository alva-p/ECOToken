import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePuntajeDto } from '../dto/create-puntaje.dto';
import { UpdatePuntajeDto } from '../dto/update-puntaje.dto';

/** Acceso a datos de Puntaje vía PrismaService. */
@Injectable()
export class PuntajeRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePuntajeDto) {
    return this.prisma.puntaje.create({ data: dto });
  }

  findAll() {
    return this.prisma.puntaje.findMany();
  }

  findById(id: string) {
    return this.prisma.puntaje.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdatePuntajeDto) {
    return this.prisma.puntaje.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.puntaje.delete({ where: { id } });
  }
}
