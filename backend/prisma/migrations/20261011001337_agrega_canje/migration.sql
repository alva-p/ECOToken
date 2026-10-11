-- CreateEnum
CREATE TYPE "EstadoCanje" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- CreateTable
CREATE TABLE "Canje" (
    "id" TEXT NOT NULL,
    "costoTokens" INTEGER NOT NULL,
    "estado" "EstadoCanje" NOT NULL DEFAULT 'PENDIENTE',
    "beneficioId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Canje_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Canje_empresaId_idx" ON "Canje"("empresaId");

-- CreateIndex
CREATE INDEX "Canje_beneficioId_idx" ON "Canje"("beneficioId");

-- AddForeignKey
ALTER TABLE "Canje" ADD CONSTRAINT "Canje_beneficioId_fkey" FOREIGN KEY ("beneficioId") REFERENCES "Beneficio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Canje" ADD CONSTRAINT "Canje_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
