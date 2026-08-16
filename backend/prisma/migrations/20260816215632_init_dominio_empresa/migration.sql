-- CreateEnum
CREATE TYPE "TipoRol" AS ENUM ('EMPRESA', 'COOPERATIVA', 'MUNICIPALIDAD', 'ADMIN');

-- CreateEnum
CREATE TYPE "CategoriaEmpresa" AS ENUM ('EMPRESA', 'COOPERATIVA');

-- CreateEnum
CREATE TYPE "EstadoEmpresa" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "tipoRol" "TipoRol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "empresaId" TEXT,
    "municipalidadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Municipalidad" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Municipalidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "domicilio" TEXT,
    "representanteLegal" TEXT,
    "emailContacto" TEXT,
    "estado" "EstadoEmpresa" NOT NULL DEFAULT 'PENDIENTE',
    "categoria" "CategoriaEmpresa" NOT NULL DEFAULT 'EMPRESA',
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombre" TEXT,
    "datosContacto" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BilleteraCustodial" (
    "id" TEXT NOT NULL,
    "direccionEVM" TEXT NOT NULL,
    "clavePrivadaCifrada" TEXT NOT NULL,
    "tipoRolOnChain" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BilleteraCustodial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reporte" (
    "id" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "fechaGeneracion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datosConsolidados" JSONB NOT NULL,
    "creadorPor" TEXT NOT NULL,
    "empresaId" TEXT,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoMaterial" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estado" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Estado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Puntaje" (
    "id" TEXT NOT NULL,
    "fechaDesde" TIMESTAMP(3) NOT NULL,
    "fechaHasta" TIMESTAMP(3),
    "versionConfig" TEXT NOT NULL,
    "cantidadPorKilo" TEXT NOT NULL,
    "tipoMaterialId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Puntaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngresoMaterial" (
    "id" TEXT NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokensAcumulados" INTEGER NOT NULL DEFAULT 0,
    "empresaId" TEXT NOT NULL,
    "tipoMaterialId" TEXT NOT NULL,
    "estadoId" TEXT NOT NULL,

    CONSTRAINT "IngresoMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoToken" (
    "id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "txHash" TEXT,
    "bloque" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ingresoMaterialId" TEXT NOT NULL,

    CONSTRAINT "MovimientoToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificadoDigital" (
    "id" TEXT NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hashVerificacion" TEXT NOT NULL,
    "urlPDF" TEXT,
    "txHashOnChain" TEXT,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "CertificadoDigital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ranking" (
    "id" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "fechaCierre" TIMESTAMP(3),
    "hashSnapshot" TEXT,
    "bloqueReferencia" INTEGER,
    "estado" TEXT,
    "empresaId" TEXT,

    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_cuit_key" ON "Empresa"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_emailContacto_key" ON "Empresa"("emailContacto");

-- CreateIndex
CREATE UNIQUE INDEX "BilleteraCustodial_direccionEVM_key" ON "BilleteraCustodial"("direccionEVM");

-- CreateIndex
CREATE UNIQUE INDEX "BilleteraCustodial_empresaId_key" ON "BilleteraCustodial"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "TipoMaterial_nombre_key" ON "TipoMaterial"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Estado_nombre_key" ON "Estado"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "MovimientoToken_ingresoMaterialId_key" ON "MovimientoToken"("ingresoMaterialId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_municipalidadId_fkey" FOREIGN KEY ("municipalidadId") REFERENCES "Municipalidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BilleteraCustodial" ADD CONSTRAINT "BilleteraCustodial_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Puntaje" ADD CONSTRAINT "Puntaje_tipoMaterialId_fkey" FOREIGN KEY ("tipoMaterialId") REFERENCES "TipoMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngresoMaterial" ADD CONSTRAINT "IngresoMaterial_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngresoMaterial" ADD CONSTRAINT "IngresoMaterial_tipoMaterialId_fkey" FOREIGN KEY ("tipoMaterialId") REFERENCES "TipoMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngresoMaterial" ADD CONSTRAINT "IngresoMaterial_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "Estado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoToken" ADD CONSTRAINT "MovimientoToken_ingresoMaterialId_fkey" FOREIGN KEY ("ingresoMaterialId") REFERENCES "IngresoMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificadoDigital" ADD CONSTRAINT "CertificadoDigital_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
