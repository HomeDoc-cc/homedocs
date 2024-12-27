/*
  Warnings:

  - The `unit` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TaskRecurrenceUnit" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "unit",
ADD COLUMN     "unit" "TaskRecurrenceUnit";
