/*
  Warnings:

  - You are about to drop the column `tokens` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "tokens",
ADD COLUMN     "tokensUsed" INTEGER,
ALTER COLUMN "output" DROP NOT NULL;
