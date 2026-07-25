import { PartialType } from '@nestjs/mapped-types';
import { CreateRankingDto } from './create-ranking.dto';

/** Actualización de Ranking: todos los campos opcionales. */
export class UpdateRankingDto extends PartialType(CreateRankingDto) {}
