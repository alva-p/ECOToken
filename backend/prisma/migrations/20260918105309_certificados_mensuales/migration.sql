-- AlterTable
ALTER TABLE "CertificadoDigital" ADD COLUMN     "anio" INTEGER NOT NULL,
ADD COLUMN     "co2Evitado" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "credencialFirmada" TEXT NOT NULL,
ADD COLUMN     "kgReciclados" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "mes" INTEGER NOT NULL,
ADD COLUMN     "posicion" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CertificadoDigital_empresaId_mes_anio_key" ON "CertificadoDigital"("empresaId", "mes", "anio");
