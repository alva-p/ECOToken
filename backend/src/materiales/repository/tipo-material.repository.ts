import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTipoMaterialDto } from '../dto/create-tipo-material.dto';
import { UpdateTipoMaterialDto } from '../dto/update-tipo-material.dto';

/** Acceso a datos de TipoMaterial vía PrismaService. */
@Injectable()
export class TipoMaterialRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTipoMaterialDto) {
    return this.prisma.tipoMaterial.create({ data: dto });
  }

  findAll() {
    return this.prisma.tipoMaterial.findMany();
  }

  findById(id: string) {
    return this.prisma.tipoMaterial.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateTipoMaterialDto) {
    return this.prisma.tipoMaterial.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.tipoMaterial.delete({ where: { id } });
  }
}
