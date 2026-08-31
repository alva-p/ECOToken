-- AlterTable
ALTER TABLE "IngresoMaterial" ADD COLUMN     "cooperativaId" TEXT;

-- AddForeignKey
ALTER TABLE "IngresoMaterial" ADD CONSTRAINT "IngresoMaterial_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

