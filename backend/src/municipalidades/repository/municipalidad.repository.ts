import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMunicipalidadDto } from '../dto/create-municipalidad.dto';
import { UpdateMunicipalidadDto } from '../dto/update-municipalidad.dto';

/** Acceso a datos de Municipalidad vía PrismaService. */
@Injectable()
export class MunicipalidadRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateMunicipalidadDto) {
    return this.prisma.municipalidad.create({ data: dto });
  }

  findAll() {
    return this.prisma.municipalidad.findMany();
  }

  findById(id: string) {
    return this.prisma.municipalidad.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateMunicipalidadDto) {
    return this.prisma.municipalidad.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.municipalidad.delete({ where: { id } });
  }
}
