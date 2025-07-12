/*
  Warnings:

  - A unique constraint covering the columns `[preferenceUuid]` on the table `usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `usuario_preferenceUuid_key` ON `usuario`(`preferenceUuid`);
