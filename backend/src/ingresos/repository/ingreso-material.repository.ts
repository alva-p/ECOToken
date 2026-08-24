import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIngresoMaterialDto } from '../dto/create-ingreso-material.dto';
import { UpdateIngresoMaterialDto } from '../dto/update-ingreso-material.dto';

/** Datos internos para dar de alta un ingreso ya validado (E5-HU01). */
export interface RegistrarIngresoData {
  empresaId: string;
  tipoMaterialId: string;
  estadoId: string;
  peso: number;
  tokensAcumulados: number;
}

/** Relaciones que se devuelven al consultar un ingreso completo. */
const INGRESO_INCLUDE = {
  empresa: true,
  tipoMaterial: true,
  estado: true,
  movimientoToken: true,
} as const;

/** Acceso a datos de IngresoMaterial vía PrismaService. */
@Injectable()
export class IngresoMaterialRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateIngresoMaterialDto) {
    return this.prisma.ingresoMaterial.create({ data: dto });
  }

  findAll() {
    return this.prisma.ingresoMaterial.findMany();
  }

  findById(id: string) {
    return this.prisma.ingresoMaterial.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateIngresoMaterialDto) {
    return this.prisma.ingresoMaterial.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.ingresoMaterial.delete({ where: { id } });
  }

  // ─── E5-HU01: registro de ingreso y acuñación ───

  /** Ingreso con sus relaciones (empresa, material, estado, movimiento). */
  findByIdFull(id: string) {
    return this.prisma.ingresoMaterial.findUnique({
      where: { id },
      include: INGRESO_INCLUDE,
    });
  }

  /** Estado del ciclo del ingreso por nombre (REGISTRADO, VALIDADO, ACUNADO). */
  findEstadoByNombre(nombre: string) {
    return this.prisma.estado.findUnique({ where: { nombre } });
  }

  /** Tipo de material por id (para la trazabilidad del evento Minted). */
  findTipoMaterialById(id: string) {
    return this.prisma.tipoMaterial.findUnique({ where: { id } });
  }

  /** Puntaje vigente (sin fecha de fin) de un tipo de material, el más reciente. */
  findPuntajeVigente(tipoMaterialId: string) {
    return this.prisma.puntaje.findFirst({
      where: { tipoMaterialId, fechaHasta: null },
      orderBy: { fechaDesde: 'desc' },
    });
  }

  /** Da de alta el ingreso (estado inicial ya resuelto por el service). */
  registrar(data: RegistrarIngresoData) {
    return this.prisma.ingresoMaterial.create({
      data,
      include: INGRESO_INCLUDE,
    });
  }

  /**
   * Registra el movimiento on-chain y mueve el ingreso al estado ACUÑADO, en una
   * sola transacción para no dejar el movimiento sin su cambio de estado.
   */
  async acunar(
    ingresoId: string,
    cantidad: number,
    txHash: string,
    bloque: number,
    estadoAcunadoId: string,
  ) {
    const [, ingreso] = await this.prisma.$transaction([
      this.prisma.movimientoToken.create({
        data: { ingresoMaterialId: ingresoId, cantidad, txHash, bloque },
      }),
      this.prisma.ingresoMaterial.update({
        where: { id: ingresoId },
        data: { estadoId: estadoAcunadoId },
        include: INGRESO_INCLUDE,
      }),
    ]);
    return ingreso;
  }
}
