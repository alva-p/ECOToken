import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 10;

/**
 * Seed idempotente (Sprint 0):
 * - Estados del ciclo de un IngresoMaterial.
 * - Tipos de material reciclable + su Puntaje (tokens por kilo) vigente.
 * Los valores son provisorios; la tokenomics definitiva se define en sprints siguientes.
 * - Fuera de producción, además crea usuarios y una empresa de prueba para
 *   testear el login y el buscador de cooperativa sin tener que insertarlos a mano.
 */
async function main() {
  // Estados posibles de un ingreso de material.
  const estados = [
    {
      nombre: 'REGISTRADO',
      descripcion: 'Ingreso registrado por la cooperativa.',
    },
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
    {
      nombre: 'PLASTICO',
      descripcion: 'Envases y films plásticos.',
      cantidadPorKilo: '10',
    },
    {
      nombre: 'VIDRIO',
      descripcion: 'Botellas y frascos de vidrio.',
      cantidadPorKilo: '5',
    },
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

  // Usuarios y empresa de prueba (nunca en producción: credenciales conocidas).
  if (process.env.NODE_ENV !== 'production') {
    const adminPasswordHash = await bcrypt.hash('admin1234', BCRYPT_ROUNDS);
    await prisma.usuario.upsert({
      where: { email: 'admin@ecotoken.test' },
      update: {},
      create: {
        email: 'admin@ecotoken.test',
        passwordHash: adminPasswordHash,
        tipoRol: 'ADMIN',
      },
    });

    const empresaTest = await prisma.empresa.upsert({
      where: { cuit: '20123456786' },
      update: {},
      create: {
        razonSocial: 'Eco SRL',
        cuit: '20123456786',
        emailContacto: 'contacto@ecosrl.test',
        categoria: 'EMPRESA',
        estado: 'APROBADA',
        activa: true,
        walletAddress: '0x1111111111111111111111111111111111111e',
      },
    });

    const coop = await prisma.empresa.upsert({
      where: { cuit: '20111111112' },
      update: {},
      create: {
        razonSocial: 'Cooperativa de Prueba',
        cuit: '20111111112',
        emailContacto: 'coop@ecotoken.test',
        categoria: 'COOPERATIVA',
        estado: 'APROBADA',
        activa: true,
        walletAddress: '0x1111111111111111111111111111111111111a',
      },
    });
    await prisma.billeteraCustodial.upsert({
      where: { empresaId: coop.id },
      update: {},
      create: {
        empresaId: coop.id,
        direccionEVM: coop.walletAddress,
        clavePrivadaCifrada: 'seed:seed:seed',
        tipoRolOnChain: 'VALIDATOR',
      },
    });
    const coopPasswordHash = await bcrypt.hash('coop1234', BCRYPT_ROUNDS);
    await prisma.usuario.upsert({
      where: { email: 'coop@ecotoken.test' },
      update: {},
      create: {
        email: 'coop@ecotoken.test',
        passwordHash: coopPasswordHash,
        tipoRol: 'COOPERATIVA',
        empresaId: coop.id,
      },
    });

    console.log(
      'Usuarios de prueba: admin@ecotoken.test / admin1234, coop@ecotoken.test / coop1234. ' +
        `Empresa de prueba (aprobada) para el buscador: ${empresaTest.razonSocial}.`,
    );
  }

  console.log(
    'Seed completado: estados, tipos de material y puntajes cargados.',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
