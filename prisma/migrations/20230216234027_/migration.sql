/*
  Warnings:

  - Added the required column `ownerId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'text-davinci-002-render-sha',
ADD COLUMN     "ownerId" TEXT NOT NULL;
