import { Injectable } from '@nestjs/common';
import { EstadoCanje, Prisma } from '@prisma/client';
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

  // ─── Canjes ───

  contarCanjes(beneficioId: string) {
    return this.prisma.canje.count({ where: { beneficioId } });
  }

  /** Activos y vigentes (vigenteHasta es inclusivo: vale todo ese día). */
  findVigentes(desde: Date) {
    return this.prisma.beneficio.findMany({
      where: {
        activo: true,
        OR: [{ vigenteHasta: null }, { vigenteHasta: { gte: desde } }],
      },
      orderBy: { costoTokens: 'asc' },
    });
  }

  /** Cupos ocupados por beneficio: todo canje que no fue rechazado. */
  async cuposOcupados(tx: Prisma.TransactionClient = this.prisma) {
    const filas = await tx.canje.groupBy({
      by: ['beneficioId'],
      where: { estado: { not: EstadoCanje.RECHAZADO } },
      _count: { _all: true },
    });
    return new Map(filas.map((f) => [f.beneficioId, f._count._all]));
  }

  /** ECO reservados por canjes de la empresa todavía no rechazados. */
  async reservado(
    empresaId: string,
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    const { _sum } = await tx.canje.aggregate({
      where: { empresaId, estado: { not: EstadoCanje.RECHAZADO } },
      _sum: { costoTokens: true },
    });
    return _sum.costoTokens ?? 0;
  }

  canjesDeEmpresa(empresaId: string) {
    return this.prisma.canje.findMany({
      where: { empresaId },
      include: { beneficio: { select: { titulo: true, tipo: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllCanjes() {
    return this.prisma.canje.findMany({
      include: {
        beneficio: { select: { titulo: true, tipo: true } },
        empresa: { select: { razonSocial: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findCanje(id: string) {
    return this.prisma.canje.findUnique({ where: { id } });
  }

  actualizarEstadoCanje(id: string, estado: EstadoCanje) {
    return this.prisma.canje.update({ where: { id }, data: { estado } });
  }

  /**
   * Corre `fn` en una transacción serializable: dos solicitudes simultáneas
   * no pueden ocupar el mismo último cupo ni gastar el mismo saldo.
   */
  transaccion<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(fn, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  }
}

function aData<T extends { vigenteHasta?: string }>(dto: T) {
  const { vigenteHasta, ...resto } = dto;
  return {
    ...resto,
    ...(vigenteHasta && { vigenteHasta: new Date(vigenteHasta) }),
  };
}
