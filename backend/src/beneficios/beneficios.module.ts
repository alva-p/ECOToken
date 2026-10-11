import { Module } from '@nestjs/common';
import { TokensModule } from '../tokens/tokens.module';
import { BeneficiosController } from './beneficios.controller';
import { BeneficiosService } from './beneficios.service';
import { BeneficioRepository } from './repository/beneficio.repository';

@Module({
  imports: [TokensModule],
  controllers: [BeneficiosController],
  providers: [BeneficiosService, BeneficioRepository],
})
export class BeneficiosModule {}
