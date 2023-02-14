/*
  Warnings:

  - Made the column `output` on table `Message` required. This step will fail if there are existing NULL values in that column.
  - Made the column `model` on table `Message` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tokensUsed` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "output" SET NOT NULL,
ALTER COLUMN "model" SET NOT NULL,
ALTER COLUMN "tokensUsed" SET NOT NULL;
