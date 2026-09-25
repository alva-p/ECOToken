import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { RankingController } from './ranking.controller';
import { RankingPublicoController } from './ranking-publico.controller';
import { RankingPublicoService } from './ranking-publico.service';
import { RankingService } from './ranking.service';

// Levanta la app HTTP (sin BD ni JWT) para comprobar lo que el service no ve:
// que las rutas públicas no las capture `GET /ranking/:id`, que no piden
// sesión y que los query params se validan como en producción (main.ts).
describe('RankingPublicoController (HTTP, E7-HU03)', () => {
  let app: INestApplication;
  let publico: { periodos: jest.Mock; obtener: jest.Mock };
  let ranking: { findOne: jest.Mock };

  beforeEach(async () => {
    publico = {
      periodos: jest.fn().mockResolvedValue([]),
      obtener: jest.fn().mockResolvedValue({ data: [] }),
    };
    ranking = { findOne: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      // Mismo orden que ranking.module.ts.
      controllers: [RankingPublicoController, RankingController],
      providers: [
        { provide: RankingPublicoService, useValue: publico },
        { provide: RankingService, useValue: ranking },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(() => app.close());

  it('GET /ranking/publico es público y no cae en /ranking/:id', async () => {
    await request(app.getHttpServer()).get('/ranking/publico').expect(200);

    expect(publico.obtener).toHaveBeenCalledWith(undefined, undefined);
    expect(ranking.findOne).not.toHaveBeenCalled();
  });

  it('convierte mes y anio de la query a número', async () => {
    await request(app.getHttpServer())
      .get('/ranking/publico?mes=8&anio=2026')
      .expect(200);

    expect(publico.obtener).toHaveBeenCalledWith(8, 2026);
  });

  it('GET /ranking/publico/periodos aplica el límite pedido', async () => {
    await request(app.getHttpServer())
      .get('/ranking/publico/periodos?limite=6')
      .expect(200);

    expect(publico.periodos).toHaveBeenCalledWith(6);
  });

  it.each([
    '/ranking/publico?mes=13&anio=2026',
    '/ranking/publico?mes=abc&anio=2026',
    '/ranking/publico?anio=1999&mes=1',
    '/ranking/publico?otro=1',
    '/ranking/publico/periodos?limite=0',
    '/ranking/publico/periodos?limite=25',
  ])('rechaza con 400 la query inválida %s', async (url) => {
    await request(app.getHttpServer()).get(url).expect(400);
  });
});
