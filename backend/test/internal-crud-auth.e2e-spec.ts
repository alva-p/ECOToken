import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TipoRol } from '@prisma/client';
import request from 'supertest';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { CertificadosController } from '../src/certificados/certificados.controller';
import { CertificadosService } from '../src/certificados/certificados.service';
import { IngresosController } from '../src/ingresos/ingresos.controller';
import { IngresosService } from '../src/ingresos/ingresos.service';
import { RankingController } from '../src/ranking/ranking.controller';
import { RankingService } from '../src/ranking/ranking.service';
import { ReportesController } from '../src/reportes/reportes.controller';
import { ReportesService } from '../src/reportes/reportes.service';
import { TokensController } from '../src/tokens/tokens.controller';
import { TokensService } from '../src/tokens/tokens.service';

const controllers = [
  {
    route: 'ingresos',
    controller: IngresosController,
    service: IngresosService,
  },
  { route: 'tokens', controller: TokensController, service: TokensService },
  {
    route: 'certificados',
    controller: CertificadosController,
    service: CertificadosService,
  },
  { route: 'ranking', controller: RankingController, service: RankingService },
  {
    route: 'reportes',
    controller: ReportesController,
    service: ReportesService,
  },
];

const operations = [
  { method: 'get', suffix: '', status: 200 },
  { method: 'post', suffix: '', status: 201 },
  { method: 'get', suffix: '/sample-id', status: 200 },
  { method: 'patch', suffix: '/sample-id', status: 200 },
  { method: 'delete', suffix: '/sample-id', status: 200 },
] as const;

describe.each(controllers)('$route internal CRUD authorization', (entry) => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [entry.controller],
      providers: [
        RolesGuard,
        {
          provide: entry.service,
          useValue: {
            create: jest.fn().mockResolvedValue({}),
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
            remove: jest.fn().mockResolvedValue({}),
            obtenerRankingMesActual: jest
              .fn()
              .mockResolvedValue({ ranking: [] }),
            verificar: jest.fn().mockResolvedValue({ valido: true }),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate(context: ExecutionContext) {
          const req = context.switchToHttp().getRequest<{
            headers: Record<string, string | undefined>;
            user?: { rol: TipoRol };
          }>();
          const role = req.headers['x-test-role'] as TipoRol | undefined;
          if (!role) throw new UnauthorizedException();
          req.user = { rol: role };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it.each(operations)('requires login for $method $suffix', async (op) => {
    await request(app.getHttpServer())
      [op.method](`/${entry.route}${op.suffix}`)
      .expect(401);
  });

  it.each(operations)('rejects EMPRESA for $method $suffix', async (op) => {
    await request(app.getHttpServer())
      [op.method](`/${entry.route}${op.suffix}`)
      .set('x-test-role', TipoRol.EMPRESA)
      .expect(403);
  });

  it.each(operations)('allows ADMIN for $method $suffix', async (op) => {
    await request(app.getHttpServer())
      [op.method](`/${entry.route}${op.suffix}`)
      .set('x-test-role', TipoRol.ADMIN)
      .expect(op.status);
  });

  if (entry.route === 'ranking') {
    it('keeps the current ranking public', async () => {
      await request(app.getHttpServer()).get('/ranking/actual').expect(200);
    });
  }

  if (entry.route === 'certificados') {
    it('keeps certificate verification public', async () => {
      await request(app.getHttpServer())
        .get('/certificados/verificar/sample-hash')
        .expect(200, { valido: true });
    });
  }
});
