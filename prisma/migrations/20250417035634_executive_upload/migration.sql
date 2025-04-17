/*
  Warnings:

  - You are about to drop the column `targetCompanyId` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `targetList` on the `EnrichmentRaw` table. All the data in the column will be lost.
  - You are about to drop the column `targetPersonId` on the `EnrichmentRaw` table. All the data in the column will be lost.
  - You are about to drop the column `targetCompanyId` on the `ExecutivePerson` table. All the data in the column will be lost.
  - You are about to drop the column `targetPersonId` on the `PersonEnrichment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email,fullName]` on the table `ExecutivePerson` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `executiveCompanyId` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Made the column `budget` on table `Campaign` required. This step will fail if there are existing NULL values in that column.
  - Made the column `spend` on table `Campaign` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `executiveList` to the `EnrichmentRaw` table without a default value. This is not possible if the table is not empty.
  - Added the required column `executivePersonId` to the `EnrichmentRaw` table without a default value. This is not possible if the table is not empty.
  - Added the required column `executiveCompanyId` to the `ExecutivePerson` table without a default value. This is not possible if the table is not empty.
  - Made the column `firstName` on table `ExecutivePerson` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `ExecutivePerson` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fullName` on table `ExecutivePerson` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `ExecutivePerson` required. This step will fail if there are existing NULL values in that column.
  - Made the column `intentScore` on table `ExecutivePerson` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `executiveCompanyId` to the `ExecutiveUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filePath` to the `ExecutiveUpload` table without a default value. This is not possible if the table is not empty.
  - Made the column `intentScore` on table `Footprint` required. This step will fail if there are existing NULL values in that column.
  - Made the column `confidence` on table `Footprint` required. This step will fail if there are existing NULL values in that column.
  - Made the column `confidence` on table `IdentifyResolution` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `executivePersonId` to the `PersonEnrichment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Campaign` DROP FOREIGN KEY `Campaign_targetCompanyId_fkey`;

-- DropForeignKey
ALTER TABLE `EnrichmentRaw` DROP FOREIGN KEY `EnrichmentRaw_targetPersonId_fkey`;

-- DropForeignKey
ALTER TABLE `PersonEnrichment` DROP FOREIGN KEY `PersonEnrichment_targetPersonId_fkey`;

-- AlterTable
ALTER TABLE `Campaign` DROP COLUMN `targetCompanyId`,
    ADD COLUMN `executiveCompanyId` INTEGER NOT NULL,
    MODIFY `budget` DOUBLE NOT NULL,
    MODIFY `spend` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `reached` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `EnrichmentRaw` DROP COLUMN `targetList`,
    DROP COLUMN `targetPersonId`,
    ADD COLUMN `executiveList` JSON NOT NULL,
    ADD COLUMN `executivePersonId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ExecutivePerson` DROP COLUMN `targetCompanyId`,
    ADD COLUMN `executiveCompanyId` INTEGER NOT NULL,
    MODIFY `firstName` VARCHAR(191) NOT NULL,
    MODIFY `lastName` VARCHAR(191) NOT NULL,
    MODIFY `fullName` VARCHAR(191) NOT NULL,
    MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `intentScore` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `ExecutiveUpload` ADD COLUMN `executiveCompanyId` INTEGER NOT NULL,
    ADD COLUMN `filePath` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Footprint` MODIFY `intentScore` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `confidence` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `IdentifyResolution` MODIFY `confidence` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `PersonEnrichment` DROP COLUMN `targetPersonId`,
    ADD COLUMN `executivePersonId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ExecutivePerson_email_fullName_key` ON `ExecutivePerson`(`email`, `fullName`);

-- AddForeignKey
ALTER TABLE `ExecutiveUpload` ADD CONSTRAINT `ExecutiveUpload_executiveCompanyId_fkey` FOREIGN KEY (`executiveCompanyId`) REFERENCES `ExecutiveCompany`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExecutivePerson` ADD CONSTRAINT `ExecutivePerson_executiveCompanyId_fkey` FOREIGN KEY (`executiveCompanyId`) REFERENCES `ExecutiveCompany`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonEnrichment` ADD CONSTRAINT `PersonEnrichment_executivePersonId_fkey` FOREIGN KEY (`executivePersonId`) REFERENCES `ExecutivePerson`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnrichmentRaw` ADD CONSTRAINT `EnrichmentRaw_executivePersonId_fkey` FOREIGN KEY (`executivePersonId`) REFERENCES `ExecutivePerson`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_executiveCompanyId_fkey` FOREIGN KEY (`executiveCompanyId`) REFERENCES `ExecutiveCompany`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
