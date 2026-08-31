import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReporteDto } from '../dto/create-reporte.dto';
import { UpdateReporteDto } from '../dto/update-reporte.dto';

/** Acceso a datos de Reporte vía PrismaService. */
@Injectable()
export class ReporteRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateReporteDto) {
    return this.prisma.reporte.create({ data: dto });
  }

  findAll() {
    return this.prisma.reporte.findMany();
  }

  findById(id: string) {
    return this.prisma.reporte.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateReporteDto) {
    return this.prisma.reporte.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.reporte.delete({ where: { id } });
  }

  /** Ingresos de material en un rango de fechas, con la empresa que los generó (E9-HU02). */
  findIngresosEnPeriodo(desde?: Date, hasta?: Date) {
    return this.prisma.ingresoMaterial.findMany({
      where: {
        ...((desde || hasta) && {
          fechaIngreso: {
            ...(desde && { gte: desde }),
            ...(hasta && { lte: hasta }),
          },
        }),
      },
      include: {
        empresa: { select: { id: true, razonSocial: true } },
      },
      orderBy: { fechaIngreso: 'asc' },
    });
  }
}
