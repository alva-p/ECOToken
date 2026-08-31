import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const ROUNDS = 10;

/**
 * Seed de demostración (presentación al profesor). NO es parte del seed base
 * (`seed.ts`) — es más grande y específico para mostrar el flujo completo, y
 * no se corre en CI ni se pretende idempotente entre corridas con distintos
 * datos. Requisito: correr primero `npx prisma db seed` (estados, materiales,
 * puntajes, admin, empresa/coop de prueba).
 *
 * Credenciales que deja listas para el demo:
 *   empresa@ecotoken.test   / empresa1234   (Eco SRL — historial largo, saldo > 0)
 *   empresa2@ecotoken.test  / empresa1234   (Supermercado Top — pocos aportes,
 *                                            para mostrar aislamiento entre empresas)
 *   coop@ecotoken.test      / coop1234      (ya la crea seed.ts)
 *   coop2@ecotoken.test     / coop1234      (Coop Puente Verde)
 *   admin@ecotoken.test     / admin1234     (ya la crea seed.ts)
 */
async function main() {
  const passwordHash = await bcrypt.hash('empresa1234', ROUNDS);
  const coopPasswordHash = await bcrypt.hash('coop1234', ROUNDS);

  // ─── Segunda cooperativa (para variedad en el historial/buscador) ───
  const coop2 = await prisma.empresa.upsert({
    where: { cuit: '20222222223' },
    update: {},
    create: {
      razonSocial: 'Coop Puente Verde',
      cuit: '20222222223',
      emailContacto: 'coop2@ecotoken.test',
      categoria: 'COOPERATIVA',
      estado: 'APROBADA',
      activa: true,
      walletAddress: '0x2222222222222222222222222222222222222a',
    },
  });
  await prisma.billeteraCustodial.upsert({
    where: { empresaId: coop2.id },
    update: {},
    create: {
      empresaId: coop2.id,
      direccionEVM: coop2.walletAddress,
      clavePrivadaCifrada: 'seed:seed:seed',
      tipoRolOnChain: 'VALIDATOR',
    },
  });
  await prisma.usuario.upsert({
    where: { email: 'coop2@ecotoken.test' },
    update: {},
    create: {
      email: 'coop2@ecotoken.test',
      passwordHash: coopPasswordHash,
      tipoRol: 'COOPERATIVA',
      empresaId: coop2.id,
    },
  });

  const coop1 = await prisma.empresa.findUniqueOrThrow({
    where: { cuit: '20111111112' },
  });

  // ─── Empresas adicionales (para el buscador de la cooperativa, E4-HU03) ───
  const empresasExtra = [
    { razonSocial: 'Supermercado Top', cuit: '20300000011', wallet: '3' },
    { razonSocial: 'Hospital Pasteur', cuit: '20300000022', wallet: '4' },
    { razonSocial: 'GreenPack', cuit: '20300000033', wallet: '5' },
    { razonSocial: 'Panadería El Trigal', cuit: '20300000044', wallet: '6' },
    { razonSocial: 'Textil Andina', cuit: '20300000055', wallet: '7' },
  ];
  const empresas: Record<string, { id: string; walletAddress: string }> = {};
  for (const e of empresasExtra) {
    const empresa = await prisma.empresa.upsert({
      where: { cuit: e.cuit },
      update: {},
      create: {
        razonSocial: e.razonSocial,
        cuit: e.cuit,
        emailContacto: `${e.razonSocial.toLowerCase().replace(/\s+/g, '')}@ecotoken.test`,
        categoria: 'EMPRESA',
        estado: 'APROBADA',
        activa: true,
        walletAddress: `0x${e.wallet.repeat(40)}`.slice(0, 42),
      },
    });
    empresas[e.razonSocial] = empresa;
  }

  // Login para "Supermercado Top" (la segunda empresa del demo de aislamiento).
  const supermercado = empresas['Supermercado Top'];
  await prisma.usuario.upsert({
    where: { email: 'empresa2@ecotoken.test' },
    update: {},
    create: {
      email: 'empresa2@ecotoken.test',
      passwordHash,
      tipoRol: 'EMPRESA',
      empresaId: supermercado.id,
    },
  });

  const empresaHero = await prisma.empresa.findUniqueOrThrow({
    where: { cuit: '20123456786' },
  });
  await prisma.usuario.upsert({
    where: { email: 'empresa@ecotoken.test' },
    update: {},
    create: {
      email: 'empresa@ecotoken.test',
      passwordHash,
      tipoRol: 'EMPRESA',
      empresaId: empresaHero.id,
    },
  });

  // ─── Ingresos: historial largo para la empresa "hero" (paginación, filtros,
  // CSV, comprobantes en ambos estados) ───
  const materiales = await prisma.tipoMaterial.findMany();
  const puntajes = new Map(
    (await prisma.puntaje.findMany({ where: { fechaHasta: null } })).map(
      (p) => [p.tipoMaterialId, Number(p.cantidadPorKilo)],
    ),
  );
  const registrado = await prisma.estado.findUniqueOrThrow({
    where: { nombre: 'REGISTRADO' },
  });
  const acunado = await prisma.estado.findUniqueOrThrow({
    where: { nombre: 'ACUNADO' },
  });
  const coops = [coop1, coop2];

  async function crearIngreso(
    empresaId: string,
    walletEmpresa: string,
    diasAtras: number,
    materialIdx: number,
    pesoKg: number,
    coop: (typeof coops)[number],
    acunar: boolean,
  ) {
    const material = materiales[materialIdx % materiales.length];
    const factor = puntajes.get(material.id) ?? 1;
    const tokens = Math.round(pesoKg * factor);
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - diasAtras);

    const ingreso = await prisma.ingresoMaterial.create({
      data: {
        empresaId,
        cooperativaId: coop.id,
        tipoMaterialId: material.id,
        estadoId: acunar ? acunado.id : registrado.id,
        peso: pesoKg,
        tokensAcumulados: tokens,
        fechaIngreso: fecha,
      },
    });
    if (acunar) {
      const txHash =
        '0x' +
        [...Array(64)]
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join('');
      await prisma.movimientoToken.create({
        data: {
          ingresoMaterialId: ingreso.id,
          cantidad: tokens,
          txHash,
          bloque: 9_000_000 + diasAtras,
          fecha,
        },
      });
    }
    return ingreso;
  }

  // 22 aportes repartidos en ~60 días, alternando cooperativa/material, la
  // mayoría acuñados y algunos pendientes (para mostrar el comprobante en
  // ambos estados y el flujo de reintento).
  const pesos = [8, 12.5, 5, 20, 3.2, 15, 9, 6.5];
  for (let i = 0; i < 22; i++) {
    await crearIngreso(
      empresaHero.id,
      empresaHero.walletAddress,
      i * 3, // separa las fechas cada 3 días
      i,
      pesos[i % pesos.length],
      coops[i % coops.length],
      i % 6 !== 0, // 1 de cada 6 queda pendiente de acuñar
    );
  }

  // Un puñado de aportes para la segunda empresa (aislamiento entre cuentas).
  for (let i = 0; i < 3; i++) {
    await crearIngreso(
      supermercado.id,
      supermercado.walletAddress,
      i * 5,
      i + 1,
      10,
      coops[i % coops.length],
      true,
    );
  }

  const saldoHero = await prisma.movimientoToken.aggregate({
    where: { ingresoMaterial: { empresaId: empresaHero.id } },
    _sum: { cantidad: true },
  });

  console.log('\n=== Seed de demo listo ===');
  console.log('Empresa "hero" (historial largo):  empresa@ecotoken.test / empresa1234');
  console.log(`  -> saldo esperado: ${saldoHero._sum.cantidad} ECO, 22 aportes en el historial`);
  console.log('Empresa 2 (aislamiento):            empresa2@ecotoken.test / empresa1234');
  console.log('Cooperativa 1:                      coop@ecotoken.test / coop1234');
  console.log('Cooperativa 2:                      coop2@ecotoken.test / coop1234');
  console.log('Admin:                              admin@ecotoken.test / admin1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
