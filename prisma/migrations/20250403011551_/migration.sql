/*
  Warnings:

  - You are about to drop the `messagem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `messagem` DROP FOREIGN KEY `Messagem_chat_uuid_fkey`;

-- DropTable
DROP TABLE `messagem`;

-- CreateTable
CREATE TABLE `Menssagem` (
    `uuid` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `type` ENUM('A', 'T', 'I') NULL DEFAULT 'T',
    `url` VARCHAR(191) NULL,
    `chat_uuid` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sender_id` VARCHAR(191) NOT NULL,
    `recieve_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Menssagem` ADD CONSTRAINT `Menssagem_chat_uuid_fkey` FOREIGN KEY (`chat_uuid`) REFERENCES `Chat`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;
