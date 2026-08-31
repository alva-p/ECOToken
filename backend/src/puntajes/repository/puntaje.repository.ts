import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePuntajeDto } from '../dto/create-puntaje.dto';
import { UpdatePuntajeDto } from '../dto/update-puntaje.dto';

/** Acceso a datos de Puntaje (tabla de conversión peso -> tokens) vía PrismaService. */
@Injectable()
export class PuntajeRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePuntajeDto) {
    return this.prisma.puntaje.create({
      data: {
        tipoMaterialId: dto.tipoMaterialId,
        cantidadPorKilo: dto.cantidadPorKilo,
        versionConfig: dto.versionConfig ?? 'v1',
        fechaDesde: dto.fechaDesde ? new Date(dto.fechaDesde) : new Date(),
        fechaHasta: dto.fechaHasta ? new Date(dto.fechaHasta) : null,
      },
      include: { tipoMaterial: true },
    });
  }

  findAll() {
    return this.prisma.puntaje.findMany({
      include: { tipoMaterial: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.puntaje.findUnique({
      where: { id },
      include: { tipoMaterial: true },
    });
  }

  /** Obtiene el puntaje/factor vigente para un material en una fecha dada (RN-07). */
  findVigenteByTipoMaterial(tipoMaterialId: string, fecha: Date = new Date()) {
    return this.prisma.puntaje.findFirst({
      where: {
        tipoMaterialId,
        fechaDesde: { lte: fecha },
        OR: [{ fechaHasta: null }, { fechaHasta: { gte: fecha } }],
      },
      include: { tipoMaterial: true },
      orderBy: { fechaDesde: 'desc' },
    });
  }

  /** Obtiene la tabla completa de conversiones vigentes por material. */
  findVigentes(fecha: Date = new Date()) {
    return this.prisma.puntaje.findMany({
      where: {
        fechaDesde: { lte: fecha },
        OR: [{ fechaHasta: null }, { fechaHasta: { gte: fecha } }],
      },
      include: { tipoMaterial: true },
      orderBy: { tipoMaterial: { nombre: 'asc' } },
    });
  }

  /** Cierra la vigencia de la configuración anterior estableciendo fechaHasta (historial versionado). */
  cerrarPuntajeVigente(tipoMaterialId: string, fechaCierre: Date = new Date()) {
    return this.prisma.puntaje.updateMany({
      where: {
        tipoMaterialId,
        fechaHasta: null,
      },
      data: {
        fechaHasta: fechaCierre,
      },
    });
  }

  update(id: string, dto: UpdatePuntajeDto) {
    const data: any = { ...dto };
    if (dto.fechaDesde) data.fechaDesde = new Date(dto.fechaDesde);
    if (dto.fechaHasta) data.fechaHasta = new Date(dto.fechaHasta);
    return this.prisma.puntaje.update({
      where: { id },
      data,
      include: { tipoMaterial: true },
    });
  }

  remove(id: string) {
    return this.prisma.puntaje.delete({ where: { id } });
  }
}
