import type { PrismaService } from '../src/prisma/prisma.service';
import type { BilleterasService } from '../src/billeteras/billeteras.service';

/**
 * Devuelve la billetera de la empresa; si solo tenía una dirección inventada
 * (sin billetera custodial) le genera una propia y la guarda, para que los
 * tokens acuñados queden en una cuenta real que el sistema controla.
 */
export async function asegurarBilleteraCustodial(
  prisma: PrismaService,
  billeteras: BilleterasService,
  empresa: {
    id: string;
    razonSocial: string;
    walletAddress: string;
    billeteraCustodial: unknown | null;
  },
): Promise<string> {
  if (empresa.billeteraCustodial) return empresa.walletAddress;

  const nueva = billeteras.generarBilleteraCustodial('EMPRESA');
  await prisma.empresa.update({
    where: { id: empresa.id },
    data: {
      walletAddress: nueva.direccionEVM,
      billeteraCustodial: {
        create: {
          direccionEVM: nueva.direccionEVM,
          clavePrivadaCifrada: nueva.clavePrivadaCifrada,
          tipoRolOnChain: nueva.tipoRolOnChain,
        },
      },
    },
  });
  console.log(
    `Billetera custodial creada para ${empresa.razonSocial}: ${nueva.direccionEVM}`,
  );
  return nueva.direccionEVM;
}
