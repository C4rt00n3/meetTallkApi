/*
  Warnings:

  - Made the column `autenticacao_id` on table `usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `autenticacao` DROP FOREIGN KEY `Autenticacao_uuid_fkey`;

-- AlterTable
ALTER TABLE `usuario` MODIFY `autenticacao_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_autenticacao_id_fkey` FOREIGN KEY (`autenticacao_id`) REFERENCES `Autenticacao`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;
