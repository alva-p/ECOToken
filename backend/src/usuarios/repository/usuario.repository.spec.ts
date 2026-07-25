import { Test } from '@nestjs/testing';
import { UsuarioRepository } from './usuario.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsuarioRepository', () => {
  let repository: UsuarioRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UsuarioRepository, { provide: PrismaService, useValue: {} }],
    }).compile();

    repository = moduleRef.get(UsuarioRepository);
  });

  it('debería estar definido', () => {
    expect(repository).toBeDefined();
  });
});
