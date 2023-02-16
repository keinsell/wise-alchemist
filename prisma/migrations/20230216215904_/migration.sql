/*
  Warnings:

  - Added the required column `discordBotMessageId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "discordBotMessageId" TEXT NOT NULL DEFAULT 'NOT_FOUND';
