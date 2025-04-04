/*
  Warnings:

  - A unique constraint covering the columns `[usuarioUuid,blockedUserId]` on the table `Block` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `blockedUserId` to the `Block` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `block` DROP FOREIGN KEY `Block_usuarioUuid_fkey`;

-- DropIndex
DROP INDEX `Block_usuarioUuid_fkey` ON `block`;

-- AlterTable
ALTER TABLE `block` ADD COLUMN `blockedUserId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Block_usuarioUuid_blockedUserId_key` ON `Block`(`usuarioUuid`, `blockedUserId`);

-- AddForeignKey
ALTER TABLE `Block` ADD CONSTRAINT `Block_blockedUserId_fkey` FOREIGN KEY (`blockedUserId`) REFERENCES `Usuario`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
