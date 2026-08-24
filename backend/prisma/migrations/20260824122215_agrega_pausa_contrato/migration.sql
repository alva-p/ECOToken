-- CreateEnum
CREATE TYPE "AccionPausa" AS ENUM ('PAUSA', 'DESPAUSA');

-- CreateTable
CREATE TABLE "PausaContrato" (
    "id" TEXT NOT NULL,
    "accion" "AccionPausa" NOT NULL,
    "motivo" TEXT NOT NULL,
    "txHash" TEXT,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PausaContrato_pkey" PRIMARY KEY ("id")
);
