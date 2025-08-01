/*
  Warnings:

  - You are about to drop the column `url` on the `message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[messageUuid]` on the table `image_message` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `messageUuid` to the `image_message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `image_message` ADD COLUMN `messageUuid` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `message` DROP COLUMN `url`,
    ADD COLUMN `imageMessageUuid` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `image_message_messageUuid_key` ON `image_message`(`messageUuid`);

-- AddForeignKey
ALTER TABLE `image_message` ADD CONSTRAINT `image_message_messageUuid_fkey` FOREIGN KEY (`messageUuid`) REFERENCES `message`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;
