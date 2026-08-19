import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRankingDto } from '../dto/create-ranking.dto';
import { UpdateRankingDto } from '../dto/update-ranking.dto';

/** Acceso a datos de Ranking vía PrismaService. */
@Injectable()
export class RankingRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateRankingDto) {
    return this.prisma.ranking.create({ data: dto });
  }

  findAll() {
    return this.prisma.ranking.findMany();
  }

  findById(id: string) {
    return this.prisma.ranking.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateRankingDto) {
    return this.prisma.ranking.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.ranking.delete({ where: { id } });
  }
}
