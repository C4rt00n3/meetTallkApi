/*
  Warnings:

  - You are about to alter the column `Lat` on the `localizacao` table. The data in that column could be lost. The data in that column will be cast from `Double` to `VarChar(191)`.
  - You are about to alter the column `Lng` on the `localizacao` table. The data in that column could be lost. The data in that column will be cast from `Double` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `localizacao` MODIFY `Lat` VARCHAR(191) NULL,
    MODIFY `Lng` VARCHAR(191) NULL;
