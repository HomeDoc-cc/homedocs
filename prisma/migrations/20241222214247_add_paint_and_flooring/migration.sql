-- CreateTable
CREATE TABLE "Paint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "finish" TEXT NOT NULL,
    "code" TEXT,
    "location" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "homeId" TEXT,
    "roomId" TEXT,

    CONSTRAINT "Paint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flooring" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "brand" TEXT,
    "color" TEXT,
    "pattern" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "homeId" TEXT,
    "roomId" TEXT,

    CONSTRAINT "Flooring_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Paint_homeId_roomId_key" ON "Paint"("homeId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "Flooring_homeId_roomId_key" ON "Flooring"("homeId", "roomId");

-- AddForeignKey
ALTER TABLE "Paint" ADD CONSTRAINT "Paint_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paint" ADD CONSTRAINT "Paint_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flooring" ADD CONSTRAINT "Flooring_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flooring" ADD CONSTRAINT "Flooring_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
