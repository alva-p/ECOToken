import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBeneficioDto } from '../dto/create-beneficio.dto';
import { UpdateBeneficioDto } from '../dto/update-beneficio.dto';

/** Acceso a datos de Beneficio vía PrismaService. */
@Injectable()
export class BeneficioRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateBeneficioDto) {
    return this.prisma.beneficio.create({ data: aData(dto) });
  }

  findAll() {
    return this.prisma.beneficio.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findById(id: string) {
    return this.prisma.beneficio.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateBeneficioDto) {
    return this.prisma.beneficio.update({ where: { id }, data: aData(dto) });
  }

  remove(id: string) {
    return this.prisma.beneficio.delete({ where: { id } });
  }
}

function aData<T extends { vigenteHasta?: string }>(dto: T) {
  const { vigenteHasta, ...resto } = dto;
  return {
    ...resto,
    ...(vigenteHasta && { vigenteHasta: new Date(vigenteHasta) }),
  };
}
