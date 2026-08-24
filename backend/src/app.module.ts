import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { ContratoModule } from './contrato/contrato.module';
import { EmpresasModule } from './empresas/empresas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { MunicipalidadesModule } from './municipalidades/municipalidades.module';
import { BilleterasModule } from './billeteras/billeteras.module';
import { MaterialesModule } from './materiales/materiales.module';
import { EstadosModule } from './estados/estados.module';
import { PuntajesModule } from './puntajes/puntajes.module';
import { IngresosModule } from './ingresos/ingresos.module';
import { TokensModule } from './tokens/tokens.module';
import { CertificadosModule } from './certificados/certificados.module';
import { RankingModule } from './ranking/ranking.module';
import { ReportesModule } from './reportes/reportes.module';

/**
 * Módulo raíz. Registra los módulos de dominio derivados del diagrama de clases.
 * Ver doc/ESTRUCTURA-PROYECTO.md §4.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    AuthModule,
    BlockchainModule,
    ContratoModule,
    EmpresasModule,
    UsuariosModule,
    MunicipalidadesModule,
    BilleterasModule,
    MaterialesModule,
    EstadosModule,
    PuntajesModule,
    IngresosModule,
    TokensModule,
    CertificadosModule,
    RankingModule,
    ReportesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
