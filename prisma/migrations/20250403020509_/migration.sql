/*
  Warnings:

  - You are about to drop the column `lastDateMensage` on the `menssagem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `chat` ADD COLUMN `lastDateMensage` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `menssagem` DROP COLUMN `lastDateMensage`;
