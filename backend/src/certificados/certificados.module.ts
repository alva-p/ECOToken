import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EmpresasModule } from '../empresas/empresas.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { CertificadosController } from './certificados.controller';
import { CertificadosService } from './certificados.service';
import { CertificadoDigitalRepository } from './repository/certificado-digital.repository';

@Module({
  imports: [AuthModule, EmpresasModule, BlockchainModule],
  controllers: [CertificadosController],
  providers: [CertificadosService, CertificadoDigitalRepository],
  exports: [CertificadosService],
})
export class CertificadosModule {}
