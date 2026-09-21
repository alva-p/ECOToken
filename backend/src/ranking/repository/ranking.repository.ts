import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRankingDto } from '../dto/create-ranking.dto';
import { UpdateRankingDto } from '../dto/update-ranking.dto';

/** Acceso a datos de Ranking vía PrismaService. */
@Injectable()
export class RankingRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateRankingDto) {
    return this.prisma.ranking.create({ data: dto });
  }

  findAll() {
    return this.prisma.ranking.findMany();
  }

  findById(id: string) {
    return this.prisma.ranking.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateRankingDto) {
    return this.prisma.ranking.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.ranking.delete({ where: { id } });
  }

  /**
   * Consulta los ingresos de material con tokens acuñados del período (mes y año).
   * `mes` es 1-indexado (1 = enero, 12 = diciembre). (E7-HU01)
   */
  findIngresosDelMes(mes: number, anio: number) {
    const desde = new Date(Date.UTC(anio, mes - 1, 1, 0, 0, 0, 0));
    const hasta = new Date(Date.UTC(anio, mes, 1, 0, 0, 0, 0));

    return this.prisma.ingresoMaterial.findMany({
      where: {
        fechaIngreso: {
          gte: desde,
          lt: hasta,
        },
        tokensAcumulados: {
          gt: 0,
        },
      },
      include: {
        empresa: {
          select: {
            id: true,
            razonSocial: true,
            cuit: true,
          },
        },
      },
    });
  }
}
