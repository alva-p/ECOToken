import { Injectable, NotFoundException } from '@nestjs/common';
import { CertificadoDigitalRepository } from './repository/certificado-digital.repository';
import { CreateCertificadoDigitalDto } from './dto/create-certificado-digital.dto';
import { UpdateCertificadoDigitalDto } from './dto/update-certificado-digital.dto';

/** Lógica de negocio de CertificadoDigital (solo CRUD). */
@Injectable()
export class CertificadosService {
  constructor(private readonly repository: CertificadoDigitalRepository) {}

  create(dto: CreateCertificadoDigitalDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const certificado = await this.repository.findById(id);
    if (!certificado)
      throw new NotFoundException(`CertificadoDigital ${id} no encontrado`);
    return certificado;
  }

  async update(id: string, dto: UpdateCertificadoDigitalDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }
}
