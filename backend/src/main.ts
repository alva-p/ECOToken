import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Detrás de proxies (Vercel/Cloudflare) hay que confiar en X-Forwarded-For para
  // que el rate limit cuente por IP real. TRUST_PROXY = cantidad de saltos.
  if (process.env.TRUST_PROXY) {
    app
      .getHttpAdapter()
      .getInstance()
      .set('trust proxy', Number(process.env.TRUST_PROXY));
  }

  app.use(helmet());

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`ECOToken backend escuchando en http://localhost:${port}`);
}
bootstrap();
