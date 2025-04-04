/*
  Warnings:

  - You are about to drop the column `user_id` on the `messagem` table. All the data in the column will be lost.
  - Added the required column `recieve_id` to the `Messagem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_id` to the `Messagem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `messagem` DROP COLUMN `user_id`,
    ADD COLUMN `recieve_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `sender_id` VARCHAR(191) NOT NULL;
