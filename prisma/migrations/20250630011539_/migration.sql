/*
  Warnings:

  - You are about to alter the column `estado` on the `localizacao` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `localizacao` MODIFY `estado` VARCHAR(191) NULL;
