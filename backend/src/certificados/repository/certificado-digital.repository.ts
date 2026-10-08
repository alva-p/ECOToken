import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCertificadoDigitalDto } from '../dto/create-certificado-digital.dto';
import { UpdateCertificadoDigitalDto } from '../dto/update-certificado-digital.dto';

/** Acceso a datos de CertificadoDigital vía PrismaService. */
@Injectable()
export class CertificadoDigitalRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCertificadoDigitalDto) {
    return this.prisma.certificadoDigital.create({ data: dto });
  }

  /** Idempotente por empresa+mes+año (E8-HU01): un reintento del cierre no duplica. */
  emitir(dto: CreateCertificadoDigitalDto) {
    return this.prisma.certificadoDigital.upsert({
      where: {
        empresaId_mes_anio: {
          empresaId: dto.empresaId,
          mes: dto.mes,
          anio: dto.anio,
        },
      },
      create: dto,
      update: dto,
    });
  }

  /** Ingresos de la empresa en el mes/año indicado, con el material (E8-HU01/02). */
  findIngresosDelPeriodo(empresaId: string, mes: number, anio: number) {
    const desde = new Date(Date.UTC(anio, mes - 1, 1));
    const hasta = new Date(Date.UTC(anio, mes, 1));
    return this.prisma.ingresoMaterial.findMany({
      where: { empresaId, fechaIngreso: { gte: desde, lt: hasta } },
      select: { peso: true, tipoMaterial: { select: { nombre: true } } },
    });
  }

  findAll() {
    return this.prisma.certificadoDigital.findMany();
  }

  /** Certificados de una empresa, más nuevos primero (E8-HU02). */
  findByEmpresaId(empresaId: string) {
    return this.prisma.certificadoDigital.findMany({
      where: { empresaId },
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
    });
  }

  /** Certificado con razón social de la empresa, para armar el PDF (E8-HU02). */
  findByIdConEmpresa(id: string) {
    return this.prisma.certificadoDigital.findUnique({
      where: { id },
      include: {
        empresa: {
          select: {
            razonSocial: true,
            cuit: true,
            domicilio: true,
            walletAddress: true,
          },
        },
      },
    });
  }

  findById(id: string) {
    return this.prisma.certificadoDigital.findUnique({ where: { id } });
  }

  /**
   * Solo campos públicos: sin CUIT/email/domicilio de la empresa (E8-HU03).
   * `empresaId` es de uso interno (el service lo quita antes de responder).
   */
  findByHash(hash: string) {
    return this.prisma.certificadoDigital.findFirst({
      where: { hashVerificacion: hash },
      select: {
        id: true,
        empresaId: true,
        fechaEmision: true,
        mes: true,
        anio: true,
        posicion: true,
        kgReciclados: true,
        co2Evitado: true,
        hashVerificacion: true,
        urlPDF: true,
        txHashOnChain: true,
        empresa: { select: { razonSocial: true } },
      },
    });
  }

  update(id: string, dto: UpdateCertificadoDigitalDto) {
    return this.prisma.certificadoDigital.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.certificadoDigital.delete({ where: { id } });
  }

  // ─── Reporte mensual de actividad ───

  /** Entregas de la empresa en el mes, con el hash de acuñación si ya existe. */
  findEntregasDelPeriodo(empresaId: string, mes: number, anio: number) {
    return this.prisma.ingresoMaterial.findMany({
      where: {
        empresaId,
        fechaIngreso: {
          gte: new Date(Date.UTC(anio, mes - 1, 1)),
          lt: new Date(Date.UTC(anio, mes, 1)),
        },
      },
      orderBy: { fechaIngreso: 'asc' },
      select: {
        fechaIngreso: true,
        peso: true,
        tokensAcumulados: true,
        tipoMaterial: { select: { nombre: true } },
        movimientoToken: { select: { txHash: true } },
      },
    });
  }

  /** Tokens acumulados por la empresa antes del inicio del mes (saldo anterior). */
  async sumarTokensAntesDe(empresaId: string, mes: number, anio: number) {
    const { _sum } = await this.prisma.ingresoMaterial.aggregate({
      where: {
        empresaId,
        fechaIngreso: { lt: new Date(Date.UTC(anio, mes - 1, 1)) },
      },
      _sum: { tokensAcumulados: true },
    });
    return _sum.tokensAcumulados ?? 0;
  }

  /** CO₂ evitado por la empresa en el año, en los meses anteriores al indicado. */
  async sumarCo2AnioPrevio(empresaId: string, mes: number, anio: number) {
    const { _sum } = await this.prisma.certificadoDigital.aggregate({
      where: { empresaId, anio, mes: { lt: mes } },
      _sum: { co2Evitado: true },
    });
    return _sum.co2Evitado ?? 0;
  }
}
