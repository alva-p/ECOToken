import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CertificadosService } from '../src/certificados/certificados.service';

/**
 * Congela el reporte mensual de los certificados emitidos antes de que el
 * reporte se guardara al cierre. Usa los aportes actuales de cada mes y no
 * modifica el certificado (hash, kg y posición quedan igual). Idempotente.
 *
 * Uso: npm run certificados:congelar-reportes
 */
async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['warn', 'error'],
  });
  try {
    const resultado = await app
      .get(CertificadosService)
      .congelarReportesPendientes();
    console.log('Reportes congelados:', resultado);
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error('No se pudieron congelar los reportes:', err.message);
  process.exit(1);
});
