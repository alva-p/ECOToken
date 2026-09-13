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

  /** Ingresos del mes/año indicados, con la empresa que los generó (E7-HU02). */
  findIngresosDelMes(mes: number, anio: number) {
    const desde = new Date(Date.UTC(anio, mes - 1, 1));
    const hasta = new Date(Date.UTC(anio, mes, 1));
    return this.prisma.ingresoMaterial.findMany({
      where: { fechaIngreso: { gte: desde, lt: hasta } },
      include: { empresa: { select: { id: true, razonSocial: true } } },
    });
  }

  /** True si ya existe un cierre para ese período (idempotencia del job). */
  async existeCierre(mes: number, anio: number): Promise<boolean> {
    const cierre = await this.prisma.ranking.findFirst({
      where: { mes, anio, estado: 'CERRADO' },
      select: { id: true },
    });
    return cierre !== null;
  }

  /** Persiste el snapshot cerrado: una fila por empresa (o una sentinela si el mes no tuvo aportes). */
  cerrarConSnapshot(
    mes: number,
    anio: number,
    empresas: { empresaId: string }[],
    snapshot: { hashSnapshot: string; bloqueReferencia: number | null },
  ) {
    const fechaCierre = new Date();
    const base = { mes, anio, fechaCierre, estado: 'CERRADO', ...snapshot };
    const filas =
      empresas.length > 0
        ? empresas.map((e) => ({ ...base, empresaId: e.empresaId }))
        : [{ ...base, empresaId: null }];
    return this.prisma.ranking.createMany({ data: filas });
  }
}
