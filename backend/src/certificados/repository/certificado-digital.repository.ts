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

  findAll() {
    return this.prisma.certificadoDigital.findMany();
  }

  findById(id: string) {
    return this.prisma.certificadoDigital.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateCertificadoDigitalDto) {
    return this.prisma.certificadoDigital.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.certificadoDigital.delete({ where: { id } });
  }
}
