-- CreateTable
CREATE TABLE `Block` (
    `uuid` VARCHAR(191) NOT NULL,
    `usuarioUuid` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Block` ADD CONSTRAINT `Block_usuarioUuid_fkey` FOREIGN KEY (`usuarioUuid`) REFERENCES `Usuario`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;
