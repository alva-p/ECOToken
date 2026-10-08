import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { BlockchainService } from '../src/blockchain/blockchain.service';
import { BilleterasService } from '../src/billeteras/billeteras.service';
import { IngresosService } from '../src/ingresos/ingresos.service';
import { asegurarBilleteraCustodial } from './billetera-propia';

/**
 * Carga aportes de material REALES entre todas las empresas y cooperativas
 * activas: cada cooperativa registra, por el mismo camino que la app
 * (`IngresosService.registrar`: valida VALIDATOR_ROLE on-chain, calcula los
 * tokens con el puntaje vigente y acuña en Sepolia), y cada aporte queda con su
 * transacción real (evento `Minted` en la pestaña Logs del explorador).
 *
 * Reparto determinístico: APORTES_POR_EMPRESA aportes a cada empresa activa,
 * rotando cooperativas y materiales, con pesos en kg enteros (el evento
 * on-chain guarda el peso redondeado).
 *
 * Uso:
 *   npm run ingresos:cargar-reales                 # solo muestra el plan
 *   npm run ingresos:cargar-reales -- --ejecutar   # registra y acuña de verdad
 */
const APORTES_POR_EMPRESA = 2;
const PESOS_KG = [12, 35, 8, 50, 20, 15, 42, 27, 9, 60, 18, 31];
const ESPERA_MAXIMA_MS = 5 * 60_000;

async function main() {
  const ejecutar = process.argv.includes('--ejecutar');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['warn', 'error'],
  });
  try {
    const prisma = app.get(PrismaService);
    const blockchain = app.get(BlockchainService);
    const billeteras = app.get(BilleterasService);
    const ingresos = app.get(IngresosService);
    if (!blockchain.mintDisponible) {
      throw new Error('La cuenta MINTER no está configurada.');
    }

    const activas = { estado: 'APROBADA' as const, activa: true };
    const [empresas, cooperativas, materiales] = await Promise.all([
      prisma.empresa.findMany({
        where: { ...activas, categoria: 'EMPRESA' },
        include: { billeteraCustodial: true },
        orderBy: { razonSocial: 'asc' },
      }),
      prisma.empresa.findMany({
        where: { ...activas, categoria: 'COOPERATIVA' },
        orderBy: { razonSocial: 'asc' },
      }),
      prisma.tipoMaterial.findMany({ orderBy: { nombre: 'asc' } }),
    ]);
    if (!empresas.length || !cooperativas.length || !materiales.length) {
      throw new Error('Faltan empresas, cooperativas o materiales activos.');
    }

    const factores = new Map<string, number>();
    for (const m of materiales) {
      const p = await prisma.puntaje.findFirst({
        where: { tipoMaterialId: m.id, fechaHasta: null },
        orderBy: { fechaDesde: 'desc' },
      });
      factores.set(m.id, Number(p?.cantidadPorKilo ?? 0));
    }

    // Plan: [empresa, cooperativa, material, kg]
    const plan = empresas.flatMap((empresa, i) =>
      Array.from({ length: APORTES_POR_EMPRESA }, (_, k) => {
        const n = i * APORTES_POR_EMPRESA + k;
        return {
          empresa,
          cooperativa: cooperativas[(i + k) % cooperativas.length],
          material: materiales[n % materiales.length],
          kg: PESOS_KG[n % PESOS_KG.length],
        };
      }),
    );

    // Cooperativas sin VALIDATOR_ROLE on-chain: se les otorga (si no, el
    // registro lo rechazaría).
    const sinRol: typeof cooperativas = [];
    for (const c of cooperativas) {
      if (!(await blockchain.tieneValidatorRole(c.walletAddress)))
        sinRol.push(c);
    }

    console.log(
      `${plan.length} aportes entre ${empresas.length} empresas y ${cooperativas.length} cooperativas:`,
    );
    for (const p of plan) {
      const tokens = Math.round(p.kg * (factores.get(p.material.id) ?? 0));
      console.log(
        ` - ${p.cooperativa.razonSocial} -> ${p.empresa.razonSocial}: ${p.kg} kg ${p.material.nombre} (~${tokens} ECO)` +
          (p.empresa.billeteraCustodial
            ? ''
            : ' [se crea billetera custodial]'),
      );
    }
    for (const c of sinRol) {
      console.log(` * ${c.razonSocial}: se le otorga VALIDATOR_ROLE on-chain`);
    }
    if (!ejecutar) {
      console.log('\nSolo plan. Para ejecutarlo: -- --ejecutar');
      return;
    }

    for (const c of sinRol) {
      const tx = await blockchain.grantValidatorRole(c.walletAddress);
      console.log(`VALIDATOR_ROLE otorgado a ${c.razonSocial}: ${tx}`);
    }
    for (const e of empresas) {
      const wallet = await asegurarBilleteraCustodial(prisma, billeteras, e);
      e.walletAddress = wallet;
    }

    // Se registra de a uno (como lo haría cada cooperativa); la acuñación
    // corre de fondo y la cola de envíos del MINTER ordena los nonces.
    const ids: string[] = [];
    for (const p of plan) {
      const r = await ingresos.registrar(
        { empresaId: p.empresa.id, tipoMaterialId: p.material.id, peso: p.kg },
        p.cooperativa.id,
      );
      if (!r) throw new Error('El registro no devolvió el aporte.');
      ids.push(r.id);
      console.log(
        `[${ids.length}/${plan.length}] registrado: ${p.cooperativa.razonSocial} -> ${p.empresa.razonSocial} ${p.kg} kg ${p.material.nombre}`,
      );
    }

    // Esperar a que confirmen todas las acuñaciones antes de cerrar la app.
    const limite = Date.now() + ESPERA_MAXIMA_MS;
    let confirmados = 0;
    while (Date.now() < limite) {
      confirmados = await prisma.movimientoToken.count({
        where: { ingresoMaterialId: { in: ids }, txHash: { not: null } },
      });
      if (confirmados === ids.length) break;
      await new Promise((r) => setTimeout(r, 4000));
    }
    console.log(`Acuñados en Sepolia: ${confirmados} de ${ids.length}.`);
    if (confirmados < ids.length) {
      console.log(
        'Los que faltan quedan REGISTRADOS y se pueden reintentar desde la app.',
      );
    }
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error('No se pudo completar:', err.message);
  process.exit(1);
});
