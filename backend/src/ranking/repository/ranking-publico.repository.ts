import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/** Acceso a datos de la consulta pública de rankings cerrados (E7-HU03). */
@Injectable()
export class RankingPublicoRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Períodos con cierre, del más reciente al más antiguo. Cada período tiene
   * una fila por empresa (o una sentinela con `empresaId` null si no hubo
   * aportes), por eso se agrupa y `empresas` cuenta solo las no nulas.
   */
  async periodosCerrados(limite: number) {
    const grupos = await this.prisma.ranking.groupBy({
      by: ['anio', 'mes'],
      where: { estado: 'CERRADO' },
      _count: { empresaId: true },
      _max: { fechaCierre: true },
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
      take: limite,
    });
    return grupos.map((g) => ({
      mes: g.mes,
      anio: g.anio,
      fechaCierre: g._max.fechaCierre,
      empresas: g._count.empresaId,
    }));
  }

  /** Snapshot cerrado de un período, o null si ese período no fue cerrado. */
  async snapshotCerrado(mes: number, anio: number) {
    const filas = await this.prisma.ranking.findMany({
      where: { mes, anio, estado: 'CERRADO' },
      select: {
        empresaId: true,
        fechaCierre: true,
        hashSnapshot: true,
        bloqueReferencia: true,
      },
    });
    if (filas.length === 0) return null;
    return {
      fechaCierre: filas[0].fechaCierre,
      hashSnapshot: filas[0].hashSnapshot,
      bloqueReferencia: filas[0].bloqueReferencia,
      empresaIds: filas.flatMap((f) => (f.empresaId ? [f.empresaId] : [])),
    };
  }

  /** Kg y tokens del mes/año por empresa, acotado a las empresas del snapshot. */
  async totalesPorEmpresa(mes: number, anio: number, empresaIds: string[]) {
    if (empresaIds.length === 0) return [];
    const grupos = await this.prisma.ingresoMaterial.groupBy({
      by: ['empresaId'],
      where: {
        empresaId: { in: empresaIds },
        fechaIngreso: {
          gte: new Date(Date.UTC(anio, mes - 1, 1)),
          lt: new Date(Date.UTC(anio, mes, 1)),
        },
      },
      _sum: { peso: true, tokensAcumulados: true },
    });
    return grupos.map((g) => ({
      empresaId: g.empresaId,
      kg: g._sum.peso ?? 0,
      tokens: g._sum.tokensAcumulados ?? 0,
    }));
  }

  /** Razón social de las empresas indicadas (único dato de empresa que se publica). */
  razonesSociales(empresaIds: string[]) {
    return this.prisma.empresa.findMany({
      where: { id: { in: empresaIds } },
      select: { id: true, razonSocial: true },
    });
  }

  /** Kg por tipo de material del mes/año, acotado a las empresas indicadas. */
  async kgPorMaterial(mes: number, anio: number, empresaIds: string[]) {
    if (empresaIds.length === 0) return [];
    const grupos = await this.prisma.ingresoMaterial.groupBy({
      by: ['tipoMaterialId'],
      where: {
        empresaId: { in: empresaIds },
        fechaIngreso: {
          gte: new Date(Date.UTC(anio, mes - 1, 1)),
          lt: new Date(Date.UTC(anio, mes, 1)),
        },
      },
      _sum: { peso: true },
    });
    const tipos = await this.prisma.tipoMaterial.findMany({
      where: { id: { in: grupos.map((g) => g.tipoMaterialId) } },
      select: { id: true, nombre: true },
    });
    const nombres = new Map(tipos.map((t) => [t.id, t.nombre]));
    return grupos.map((g) => ({
      material: nombres.get(g.tipoMaterialId) ?? 'Otros',
      kg: g._sum.peso ?? 0,
    }));
  }

  /** Certificados emitidos hasta el período (inclusive) por empresa. */
  async certificadosPorEmpresa(
    mes: number,
    anio: number,
    empresaIds: string[],
  ) {
    if (empresaIds.length === 0) return [];
    const grupos = await this.prisma.certificadoDigital.groupBy({
      by: ['empresaId'],
      where: {
        empresaId: { in: empresaIds },
        OR: [{ anio: { lt: anio } }, { anio, mes: { lte: mes } }],
      },
      _count: { _all: true },
    });
    return grupos.map((g) => ({
      empresaId: g.empresaId,
      cantidad: g._count._all,
    }));
  }

  /** CO₂ evitado de los certificados emitidos para el período, por empresa. */
  async co2PorEmpresa(mes: number, anio: number, empresaIds: string[]) {
    if (empresaIds.length === 0) return [];
    const grupos = await this.prisma.certificadoDigital.groupBy({
      by: ['empresaId'],
      where: { mes, anio, empresaId: { in: empresaIds } },
      _sum: { co2Evitado: true },
    });
    return grupos.map((g) => ({
      empresaId: g.empresaId,
      co2: g._sum.co2Evitado ?? 0,
    }));
  }

  /** Períodos cerrados en los que participó la empresa. */
  mesesCerrados(empresaId: string) {
    return this.prisma.ranking.findMany({
      where: { empresaId, estado: 'CERRADO' },
      select: { mes: true, anio: true },
    });
  }
}
