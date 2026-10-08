import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { BlockchainService } from '../src/blockchain/blockchain.service';
import { BilleterasService } from '../src/billeteras/billeteras.service';
import { asegurarBilleteraCustodial } from './billetera-propia';

/**
 * Acuña en Sepolia los aportes que no tienen una transacción real: los que no
 * tienen MovimientoToken (acuñación pendiente) y los que guardan un hash que no
 * existe en la cadena (datos de demo). Cada aporte pasa a tener su tx real,
 * visible en el explorador (pestaña Logs, evento `Minted`).
 *
 * Si la empresa tiene una billetera que no es custodial (una dirección
 * inventada que nadie controla), primero se le genera una billetera custodial
 * propia: así los tokens quedan en una cuenta real.
 *
 * El movimiento se guarda apenas confirma cada acuñación (un reintento no
 * vuelve a acuñar lo que ya salió). Idempotente.
 *
 * Uso:
 *   npm run ingresos:acunar-reales -- --simular   # solo lista qué haría
 *   npm run ingresos:acunar-reales                # acuña de verdad
 */
const EN_PARALELO = 4;

async function main() {
  const simular = process.argv.includes('--simular');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['warn', 'error'],
  });
  try {
    const prisma = app.get(PrismaService);
    const blockchain = app.get(BlockchainService);
    const billeteras = app.get(BilleterasService);
    if (!blockchain.mintDisponible) {
      throw new Error('La cuenta MINTER no está configurada.');
    }

    const acunado = await prisma.estado.findFirst({
      where: { nombre: 'ACUNADO' },
    });
    if (!acunado) throw new Error('Falta el estado ACUNADO (correr el seed).');

    const ingresos = await prisma.ingresoMaterial.findMany({
      include: {
        empresa: { include: { billeteraCustodial: true } },
        tipoMaterial: true,
        movimientoToken: true,
      },
      orderBy: { fechaIngreso: 'asc' },
    });

    type Ingreso = (typeof ingresos)[number];
    const pendientes: Ingreso[] = [];
    for (const ingreso of ingresos) {
      const tx = ingreso.movimientoToken?.txHash;
      if (!tx || !(await blockchain.existeTransaccion(tx))) {
        pendientes.push(ingreso);
      }
    }

    const porEmpresa = new Map<string, Ingreso[]>();
    for (const i of pendientes) {
      porEmpresa.set(i.empresaId, [...(porEmpresa.get(i.empresaId) ?? []), i]);
    }
    console.log(
      `${pendientes.length} aportes sin transacción real, de ${porEmpresa.size} empresas:`,
    );
    for (const lista of porEmpresa.values()) {
      const e = lista[0].empresa;
      const tokens = lista.reduce((s, i) => s + i.tokensAcumulados, 0);
      console.log(
        ` - ${e.razonSocial}: ${lista.length} aportes, ${tokens} ECO` +
          (e.billeteraCustodial
            ? ''
            : ' (sin billetera custodial: se crea una)'),
      );
    }
    if (simular || pendientes.length === 0) return;

    // Billetera propia para las empresas que solo tenían una dirección inventada.
    const billeteraDe = new Map<string, string>();
    for (const lista of porEmpresa.values()) {
      const e = lista[0].empresa;
      billeteraDe.set(
        e.id,
        await asegurarBilleteraCustodial(prisma, billeteras, e),
      );
    }

    let hechos = 0;
    for (let i = 0; i < pendientes.length; i += EN_PARALELO) {
      await Promise.all(
        pendientes.slice(i, i + EN_PARALELO).map(async (ingreso) => {
          const { txHash, bloque } = await blockchain.mint(
            billeteraDe.get(ingreso.empresaId)!,
            ingreso.tokensAcumulados,
            ingreso.tipoMaterial.nombre,
            ingreso.peso,
          );
          if (ingreso.movimientoToken) {
            await prisma.movimientoToken.update({
              where: { id: ingreso.movimientoToken.id },
              data: { txHash, bloque },
            });
          } else {
            await prisma.$transaction([
              prisma.movimientoToken.create({
                data: {
                  ingresoMaterialId: ingreso.id,
                  cantidad: ingreso.tokensAcumulados,
                  txHash,
                  bloque,
                },
              }),
              prisma.ingresoMaterial.update({
                where: { id: ingreso.id },
                data: { estadoId: acunado.id },
              }),
            ]);
          }
          hechos++;
          console.log(
            `[${hechos}/${pendientes.length}] ${ingreso.empresa.razonSocial} ${ingreso.peso} kg ${ingreso.tipoMaterial.nombre} -> ${txHash}`,
          );
        }),
      );
    }
    console.log(`Listo: ${hechos} aportes acuñados en Sepolia.`);
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error('No se pudo completar:', err.message);
  process.exit(1);
});
