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
      include: { empresa: { select: { razonSocial: true } } },
    });
  }

  findById(id: string) {
    return this.prisma.certificadoDigital.findUnique({ where: { id } });
  }

  /** Solo campos públicos: sin CUIT/email/domicilio de la empresa (E8-HU03). */
  findByHash(hash: string) {
    return this.prisma.certificadoDigital.findFirst({
      where: { hashVerificacion: hash },
      select: {
        id: true,
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
}
