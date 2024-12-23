/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Home` table. All the data in the column will be lost.
  - Made the column `brand` on table `Flooring` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `userId` to the `Home` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homeId` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Home" DROP CONSTRAINT "Home_ownerId_fkey";

-- AlterTable
ALTER TABLE "Flooring" ALTER COLUMN "brand" SET NOT NULL;

-- AlterTable
ALTER TABLE "Home" DROP COLUMN "ownerId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "homeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Paint" ALTER COLUMN "location" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'OTHER';

-- AddForeignKey
ALTER TABLE "Home" ADD CONSTRAINT "Home_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;
