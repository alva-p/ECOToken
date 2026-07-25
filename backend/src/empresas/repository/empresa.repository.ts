import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmpresaDto } from '../dto/create-empresa.dto';
import { UpdateEmpresaDto } from '../dto/update-empresa.dto';

/** Acceso a datos de Empresa vía PrismaService. */
@Injectable()
export class EmpresaRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateEmpresaDto) {
    return this.prisma.empresa.create({ data: dto });
  }

  findAll() {
    return this.prisma.empresa.findMany();
  }

  findById(id: string) {
    return this.prisma.empresa.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateEmpresaDto) {
    return this.prisma.empresa.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.empresa.delete({ where: { id } });
  }
}
