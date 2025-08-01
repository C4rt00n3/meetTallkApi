-- CreateTable
CREATE TABLE `localizacao` (
    `uuid` VARCHAR(191) NOT NULL,
    `lat` VARCHAR(191) NULL,
    `lng` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NULL,
    `municipio` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `uuid` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `sexo` ENUM('F', 'M') NULL DEFAULT 'M',
    `localizacao_id` VARCHAR(191) NULL,
    `autenticacao_id` VARCHAR(191) NOT NULL,
    `preferenceUuid` VARCHAR(191) NULL,
    `provider` ENUM('google', 'app') NOT NULL DEFAULT 'app',

    UNIQUE INDEX `usuario_autenticacao_id_key`(`autenticacao_id`),
    UNIQUE INDEX `usuario_preferenceUuid_key`(`preferenceUuid`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Preference` (
    `uuid` VARCHAR(191) NOT NULL,
    `gender` ENUM('F', 'M') NOT NULL,
    `maxAge` INTEGER NOT NULL,

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Block` (
    `uuid` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `blockedUserId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Block_userId_blockedUserId_key`(`userId`, `blockedUserId`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `autenticacao` (
    `uuid` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,

    UNIQUE INDEX `autenticacao_email_key`(`email`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat` (
    `uuid` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastDateMessage` DATETIME(3) NULL,
    `fav` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_participant` (
    `chatId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`chatId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message` (
    `uuid` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `tipo` ENUM('AUDIO', 'TEXT', 'IMAGE') NULL DEFAULT 'TEXT',
    `url` VARCHAR(191) NULL,
    `chat_uuid` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sender_id` VARCHAR(191) NOT NULL,
    `receive_id` VARCHAR(191) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `deletedLocally` BOOLEAN NOT NULL DEFAULT false,
    `resposta_a_id` VARCHAR(191) NULL,
    `isUpdate` BOOLEAN NOT NULL DEFAULT false,
    `updateAt` DATETIME(3) NULL,
    `countUpdate` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `image_perfil` (
    `uuid` VARCHAR(191) NOT NULL,
    `src` LONGBLOB NOT NULL,
    `userUuid` VARCHAR(191) NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `image_message` (
    `uuid` VARCHAR(191) NOT NULL,
    `src` LONGBLOB NOT NULL,
    `userUuid` VARCHAR(191) NULL,

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_localizacao_id_fkey` FOREIGN KEY (`localizacao_id`) REFERENCES `localizacao`(`uuid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_autenticacao_id_fkey` FOREIGN KEY (`autenticacao_id`) REFERENCES `autenticacao`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_preferenceUuid_fkey` FOREIGN KEY (`preferenceUuid`) REFERENCES `Preference`(`uuid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Block` ADD CONSTRAINT `Block_blockedUserId_fkey` FOREIGN KEY (`blockedUserId`) REFERENCES `usuario`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_participant` ADD CONSTRAINT `chat_participant_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `chat`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_participant` ADD CONSTRAINT `chat_participant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `usuario`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_chat_uuid_fkey` FOREIGN KEY (`chat_uuid`) REFERENCES `chat`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_resposta_a_id_fkey` FOREIGN KEY (`resposta_a_id`) REFERENCES `message`(`uuid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `image_perfil` ADD CONSTRAINT `image_perfil_userUuid_fkey` FOREIGN KEY (`userUuid`) REFERENCES `usuario`(`uuid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `image_message` ADD CONSTRAINT `image_message_userUuid_fkey` FOREIGN KEY (`userUuid`) REFERENCES `usuario`(`uuid`) ON DELETE SET NULL ON UPDATE CASCADE;
