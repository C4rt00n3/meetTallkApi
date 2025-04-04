-- DropForeignKey
ALTER TABLE `chathaschat` DROP FOREIGN KEY `ChatHasChat_chat_uuid_fkey`;

-- DropIndex
DROP INDEX `ChatHasChat_chat_uuid_fkey` ON `chathaschat`;

-- AddForeignKey
ALTER TABLE `ChatHasChat` ADD CONSTRAINT `ChatHasChat_chat_uuid_fkey` FOREIGN KEY (`chat_uuid`) REFERENCES `Usuario`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
