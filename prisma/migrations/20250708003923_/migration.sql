-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `preferenceUuid` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Preference` (
    `uuid` VARCHAR(191) NOT NULL,
    `gender` ENUM('F', 'M') NOT NULL,
    `maxAge` INTEGER NOT NULL,

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_preferenceUuid_fkey` FOREIGN KEY (`preferenceUuid`) REFERENCES `Preference`(`uuid`) ON DELETE SET NULL ON UPDATE CASCADE;
