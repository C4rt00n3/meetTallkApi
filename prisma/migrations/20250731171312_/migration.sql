/*
  Warnings:

  - You are about to drop the column `isPrimary` on the `image_perfil` table. All the data in the column will be lost.
  - You are about to drop the column `preferenceUuid` on the `usuario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userUuid]` on the table `Preference` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slot` to the `image_perfil` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateAt` to the `image_perfil` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userUuid` to the `Preference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateAt` to the `usuario` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `usuario` DROP FOREIGN KEY `usuario_preferenceUuid_fkey`;

-- DropIndex
DROP INDEX `usuario_preferenceUuid_key` ON `usuario`;

-- AlterTable
ALTER TABLE `image_perfil` DROP COLUMN `isPrimary`,
    ADD COLUMN `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `slot` INTEGER NOT NULL,
    ADD COLUMN `updateAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `preference` ADD COLUMN `userUuid` VARCHAR(191) NOT NULL,
    MODIFY `gender` ENUM('F', 'M', 'O') NOT NULL;

-- AlterTable
ALTER TABLE `usuario` DROP COLUMN `preferenceUuid`,
    ADD COLUMN `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updateAt` DATETIME(3) NOT NULL,
    MODIFY `sexo` ENUM('F', 'M', 'O') NULL DEFAULT 'M';

-- CreateTable
CREATE TABLE `PrivacyUser` (
    `uuid` VARCHAR(191) NOT NULL,
    `noMarkRead` BOOLEAN NOT NULL DEFAULT false,
    `imageBreak` INTEGER NOT NULL DEFAULT 0,
    `talkBreak` INTEGER NOT NULL DEFAULT 0,
    `userUuid` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PrivacyUser_userUuid_key`(`userUuid`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Preference_userUuid_key` ON `Preference`(`userUuid`);

-- AddForeignKey
ALTER TABLE `PrivacyUser` ADD CONSTRAINT `PrivacyUser_userUuid_fkey` FOREIGN KEY (`userUuid`) REFERENCES `usuario`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Preference` ADD CONSTRAINT `Preference_userUuid_fkey` FOREIGN KEY (`userUuid`) REFERENCES `usuario`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;
