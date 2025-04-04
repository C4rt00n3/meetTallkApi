-- DropForeignKey
ALTER TABLE `usuario` DROP FOREIGN KEY `Usuario_autenticacao_id_fkey`;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_autenticacao_id_fkey` FOREIGN KEY (`autenticacao_id`) REFERENCES `Autenticacao`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
