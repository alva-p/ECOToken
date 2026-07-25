import { Module } from '@nestjs/common';
import { CertificadosController } from './certificados.controller';
import { CertificadosService } from './certificados.service';
import { CertificadoDigitalRepository } from './repository/certificado-digital.repository';

@Module({
  controllers: [CertificadosController],
  providers: [CertificadosService, CertificadoDigitalRepository],
  exports: [CertificadosService],
})
export class CertificadosModule {}
