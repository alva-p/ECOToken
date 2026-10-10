import { Module } from '@nestjs/common';
import { BeneficiosController } from './beneficios.controller';
import { BeneficiosService } from './beneficios.service';
import { BeneficioRepository } from './repository/beneficio.repository';

@Module({
  controllers: [BeneficiosController],
  providers: [BeneficiosService, BeneficioRepository],
})
export class BeneficiosModule {}
