/*
  Warnings:

  - You are about to drop the column `type` on the `message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `message` DROP COLUMN `type`,
    ADD COLUMN `resposta_a_id` VARCHAR(191) NULL,
    ADD COLUMN `tipo` ENUM('AUDIO', 'TEXT', 'IMAGE') NULL DEFAULT 'TEXT';

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_resposta_a_id_fkey` FOREIGN KEY (`resposta_a_id`) REFERENCES `message`(`uuid`) ON DELETE SET NULL ON UPDATE CASCADE;
