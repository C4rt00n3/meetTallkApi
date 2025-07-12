-- AlterTable
ALTER TABLE `message` ADD COLUMN `isUpdate` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `updateAt` DATETIME(3) NULL;
