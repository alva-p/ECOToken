import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';

/**
 * Módulo raíz. A medida que avancen los sprints se importan los módulos de dominio
 * (empresas, cooperativas, ingresos, tokens, certificados, ranking, reportes),
 * auth y blockchain. Ver doc/ESTRUCTURA-PROYECTO.md §4.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    // AuthModule,
    // BlockchainModule,
    // EmpresasModule, CooperativasModule, IngresosModule, TokensModule,
    // CertificadosModule, RankingModule, ReportesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
