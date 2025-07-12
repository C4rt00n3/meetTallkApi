/*
  Warnings:

  - You are about to drop the column `contry` on the `localizacao` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `localizacao` DROP COLUMN `contry`,
    ADD COLUMN `country` VARCHAR(191) NULL;
