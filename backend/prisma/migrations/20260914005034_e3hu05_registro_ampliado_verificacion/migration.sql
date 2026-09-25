-- CreateEnum
CREATE TYPE "EstadoVerificacion" AS ENUM ('SIN_VERIFICAR', 'EN_REVISION', 'VERIFICADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('ACTA_CONSTITUCION', 'LICENCIA_COMERCIAL', 'DOCUMENTO_IMPOSITIVO', 'FACTURA_SERVICIOS');

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "codigoPostal" TEXT,
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "estadoVerificacion" "EstadoVerificacion" NOT NULL DEFAULT 'SIN_VERIFICAR',
ADD COLUMN     "pais" TEXT,
ADD COLUMN     "sitioWeb" TEXT,
ADD COLUMN     "telefono" TEXT;

-- CreateTable
CREATE TABLE "DocumentoVerificacion" (
    "id" TEXT NOT NULL,
    "tipo" "TipoDocumento" NOT NULL,
    "archivoUrl" TEXT NOT NULL,
    "nombreArchivo" TEXT,
    "mimeType" TEXT,
    "tamanioBytes" INTEGER,
    "fechaCarga" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "DocumentoVerificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentoVerificacion_empresaId_idx" ON "DocumentoVerificacion"("empresaId");

-- AddForeignKey
ALTER TABLE "DocumentoVerificacion" ADD CONSTRAINT "DocumentoVerificacion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

