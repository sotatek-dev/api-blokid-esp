/*
  Warnings:

  - A unique constraint covering the columns `[email,fullName,executiveCompanyId]` on the table `ExecutivePerson` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `ExecutivePerson_email_fullName_key` ON `ExecutivePerson`;

-- AlterTable
ALTER TABLE `ExecutivePerson` ADD COLUMN `executiveUploadId` INTEGER NULL;

-- AlterTable
ALTER TABLE `ExecutiveUpload` ADD COLUMN `isEnriched` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isSaved` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `ExecutivePerson_email_fullName_executiveCompanyId_key` ON `ExecutivePerson`(`email`, `fullName`, `executiveCompanyId`);

-- AddForeignKey
ALTER TABLE `ExecutivePerson` ADD CONSTRAINT `ExecutivePerson_executiveUploadId_fkey` FOREIGN KEY (`executiveUploadId`) REFERENCES `ExecutiveUpload`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
