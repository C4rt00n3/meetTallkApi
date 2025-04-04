-- CreateTable
CREATE TABLE `Localizacao` (
    `uuid` VARCHAR(191) NOT NULL,
    `Lat` DOUBLE NULL,
    `Lng` DOUBLE NULL,
    `estado` ENUM('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO') NOT NULL,
    `municipio` VARCHAR(191) NULL,

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `uuid` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `imagem_url` VARCHAR(191) NULL,
    `idade` INTEGER NOT NULL,
    `sexo` ENUM('F', 'M') NULL DEFAULT 'M',
    `localizacao_id` VARCHAR(191) NULL,
    `autenticacao_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Usuario_imagem_url_key`(`imagem_url`),
    UNIQUE INDEX `Usuario_autenticacao_id_key`(`autenticacao_id`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Autenticacao` (
    `uuid` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Autenticacao_email_key`(`email`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chat` (
    `uuid` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatHasChat` (
    `chat_idtable1` VARCHAR(191) NOT NULL,
    `chat_uuid` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`chat_idtable1`, `chat_uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Messagem` (
    `uuid` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `type` ENUM('A', 'T', 'I') NULL DEFAULT 'T',
    `url` VARCHAR(191) NULL,
    `chat_uuid` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_localizacao_id_fkey` FOREIGN KEY (`localizacao_id`) REFERENCES `Localizacao`(`uuid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Autenticacao` ADD CONSTRAINT `Autenticacao_uuid_fkey` FOREIGN KEY (`uuid`) REFERENCES `Usuario`(`autenticacao_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatHasChat` ADD CONSTRAINT `ChatHasChat_chat_idtable1_fkey` FOREIGN KEY (`chat_idtable1`) REFERENCES `Chat`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatHasChat` ADD CONSTRAINT `ChatHasChat_chat_uuid_fkey` FOREIGN KEY (`chat_uuid`) REFERENCES `Usuario`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Messagem` ADD CONSTRAINT `Messagem_chat_uuid_fkey` FOREIGN KEY (`chat_uuid`) REFERENCES `Chat`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;
