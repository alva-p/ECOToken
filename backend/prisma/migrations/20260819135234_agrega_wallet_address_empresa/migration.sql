-- DropForeignKey
ALTER TABLE "BilleteraCustodial" DROP CONSTRAINT "BilleteraCustodial_empresaId_fkey";

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "walletAddress" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_walletAddress_key" ON "Empresa"("walletAddress");

-- AddForeignKey
ALTER TABLE "BilleteraCustodial" ADD CONSTRAINT "BilleteraCustodial_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

