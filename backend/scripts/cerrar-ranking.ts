import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RankingService } from '../src/ranking/ranking.service';
import { mesAnterior } from '../src/ranking/mes-anterior.util';

/**
 * Cierre manual del ranking mensual desde la terminal (E7-HU02/E8-HU01) — no
 * hay botón en el panel de admin a propósito, esto reemplaza al comando
 * curl+login que se usaba para lo mismo.
 *
 * Uso:
 *   npm run ranking:cerrar                # cierra el mes calendario anterior
 *   npm run ranking:cerrar -- 9 2026      # cierra un período puntual
 */
async function main() {
  const [mesArg, anioArg] = process.argv.slice(2);
  const { mes, anio } =
    mesArg && anioArg
      ? { mes: Number(mesArg), anio: Number(anioArg) }
      : mesAnterior(new Date());

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });
  try {
    const resultado = await app
      .get(RankingService)
      .cerrarRankingDelMes(mes, anio);
    console.log('Ranking cerrado:', resultado);
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error('No se pudo cerrar el ranking:', err.message);
  process.exit(1);
});
