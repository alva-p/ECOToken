import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('reporta estado ok y db up cuando la consulta responde', async () => {
    const result = await controller.check();
    expect(result.status).toBe('ok');
    expect(result.db).toBe('up');
  });

  it('reporta db down cuando la consulta falla', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn().mockRejectedValue(new Error('sin conexión')),
          },
        },
      ],
    }).compile();

    const result = await moduleRef.get(HealthController).check();
    expect(result.status).toBe('ok');
    expect(result.db).toBe('down');
  });
});
