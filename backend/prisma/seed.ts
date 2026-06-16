import { PrismaClient, TipoMaterial } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed idempotente (Sprint 0): tabla de conversión peso → tokens por material.
 * Los valores son provisorios; la tokenomics definitiva se define en sprints siguientes.
 */
async function main() {
  const conversiones: Array<{ tipoMaterial: TipoMaterial; tokensPorKg: number }> = [
    { tipoMaterial: 'PLASTICO', tokensPorKg: 10 },
    { tipoMaterial: 'VIDRIO', tokensPorKg: 5 },
    { tipoMaterial: 'CARTON', tokensPorKg: 3 },
  ];

  for (const c of conversiones) {
    await prisma.tablaConversion.upsert({
      where: { tipoMaterial: c.tipoMaterial },
      update: { tokensPorKg: c.tokensPorKg },
      create: c,
    });
  }

  console.log('Seed completado: tabla de conversión cargada.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
