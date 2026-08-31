import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIngresoMaterialDto } from '../dto/create-ingreso-material.dto';
import { UpdateIngresoMaterialDto } from '../dto/update-ingreso-material.dto';

/** Acceso a datos de IngresoMaterial vía PrismaService. */
@Injectable()
export class IngresoMaterialRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateIngresoMaterialDto) {
    return this.prisma.ingresoMaterial.create({
      data: dto,
      include: { estado: true, tipoMaterial: true },
    });
  }

  findAll() {
    return this.prisma.ingresoMaterial.findMany({
      include: { estado: true, tipoMaterial: true },
    });
  }

  findById(id: string) {
    return this.prisma.ingresoMaterial.findUnique({
      where: { id },
      include: { estado: true, tipoMaterial: true },
    });
  }

  update(id: string, dto: UpdateIngresoMaterialDto) {
    return this.prisma.ingresoMaterial.update({
      where: { id },
      data: dto,
      include: { estado: true, tipoMaterial: true },
    });
  }

  remove(id: string) {
    return this.prisma.ingresoMaterial.delete({ where: { id } });
  }
}
