/*
  Warnings:

  - You are about to drop the column `manufacturer` on the `Color` table. All the data in the column will be lost.
  - You are about to drop the column `hex` on the `Paint` table. All the data in the column will be lost.
  - You are about to drop the column `rgbB` on the `Paint` table. All the data in the column will be lost.
  - You are about to drop the column `rgbG` on the `Paint` table. All the data in the column will be lost.
  - You are about to drop the column `rgbR` on the `Paint` table. All the data in the column will be lost.
  - Added the required column `brand` to the `Color` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Color" DROP COLUMN "manufacturer",
ADD COLUMN     "brand" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Paint" DROP COLUMN "hex",
DROP COLUMN "rgbB",
DROP COLUMN "rgbG",
DROP COLUMN "rgbR";
