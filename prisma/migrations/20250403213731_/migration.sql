-- DropForeignKey
ALTER TABLE `chathaschat` DROP FOREIGN KEY `ChatHasChat_chat_idtable1_fkey`;

-- AddForeignKey
ALTER TABLE `ChatHasChat` ADD CONSTRAINT `ChatHasChat_chat_idtable1_fkey` FOREIGN KEY (`chat_idtable1`) REFERENCES `Chat`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
