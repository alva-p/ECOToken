-- CreateTable
CREATE TABLE "PartidaJuego" (
    "id" TEXT NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "puntaje" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartidaJuego_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartidaJuego_puntaje_createdAt_idx" ON "PartidaJuego"("puntaje" DESC, "createdAt");
