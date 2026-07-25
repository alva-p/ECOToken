import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed idempotente (Sprint 0):
 * - Estados del ciclo de un IngresoMaterial.
 * - Tipos de material reciclable + su Puntaje (tokens por kilo) vigente.
 * Los valores son provisorios; la tokenomics definitiva se define en sprints siguientes.
 */
async function main() {
  // Estados posibles de un ingreso de material.
  const estados = [
    { nombre: 'REGISTRADO', descripcion: 'Ingreso registrado por la cooperativa.' },
    { nombre: 'VALIDADO', descripcion: 'Material pesado y validado.' },
    { nombre: 'ACUNADO', descripcion: 'Tokens acuñados on-chain.' },
  ];
  for (const e of estados) {
    await prisma.estado.upsert({
      where: { nombre: e.nombre },
      update: { descripcion: e.descripcion },
      create: e,
    });
  }

  // Tipos de material + su puntaje (tokens por kilo) provisorio.
  const materiales = [
    { nombre: 'PLASTICO', descripcion: 'Envases y films plásticos.', cantidadPorKilo: '10' },
    { nombre: 'VIDRIO', descripcion: 'Botellas y frascos de vidrio.', cantidadPorKilo: '5' },
    { nombre: 'CARTON', descripcion: 'Cartón y papel.', cantidadPorKilo: '3' },
  ];
  for (const m of materiales) {
    const tipo = await prisma.tipoMaterial.upsert({
      where: { nombre: m.nombre },
      update: { descripcion: m.descripcion },
      create: { nombre: m.nombre, descripcion: m.descripcion },
    });

    // Puntaje vigente v1 (idempotente por tipoMaterial + versionConfig).
    const existente = await prisma.puntaje.findFirst({
      where: { tipoMaterialId: tipo.id, versionConfig: 'v1' },
    });
    if (!existente) {
      await prisma.puntaje.create({
        data: {
          tipoMaterialId: tipo.id,
          versionConfig: 'v1',
          cantidadPorKilo: m.cantidadPorKilo,
          fechaDesde: new Date(),
        },
      });
    }
  }

  console.log('Seed completado: estados, tipos de material y puntajes cargados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
