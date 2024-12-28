-- CreateTable
CREATE TABLE "Color" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "rgbR" INTEGER NOT NULL,
    "rgbG" INTEGER NOT NULL,
    "rgbB" INTEGER NOT NULL,
    "manufacturer" TEXT NOT NULL,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Color_code_key" ON "Color"("code");
