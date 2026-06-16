import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEjemploDto } from '../dto/create-ejemplo.dto';
import { UpdateEjemploDto } from '../dto/update-ejemplo.dto';

/**
 * Plantilla de repository: acceso a datos vía PrismaService.
 * Reemplazar `this.prisma.ejemplo` por el modelo real definido en prisma/schema.prisma.
 */
@Injectable()
export class EjemploRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateEjemploDto) {
    // return this.prisma.ejemplo.create({ data: dto });
    return Promise.resolve({ id: 'stub', ...dto });
  }

  findAll() {
    // return this.prisma.ejemplo.findMany();
    return Promise.resolve([]);
  }

  findById(id: string) {
    // return this.prisma.ejemplo.findUnique({ where: { id } });
    return Promise.resolve(null);
  }

  update(id: string, dto: UpdateEjemploDto) {
    // return this.prisma.ejemplo.update({ where: { id }, data: dto });
    return Promise.resolve({ id, ...dto });
  }

  remove(id: string) {
    // return this.prisma.ejemplo.delete({ where: { id } });
    return Promise.resolve({ id });
  }
}
