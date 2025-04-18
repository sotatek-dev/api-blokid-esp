/*
  Warnings:

  - You are about to drop the column `executiveList` on the `EnrichmentRaw` table. All the data in the column will be lost.
  - You are about to drop the column `executivePersonId` on the `EnrichmentRaw` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `ExecutivePerson` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `ExecutivePerson` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Footprint` table. All the data in the column will be lost.
  - You are about to drop the column `company` on the `PersonEnrichment` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `PersonEnrichment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `EnrichmentRaw` DROP FOREIGN KEY `EnrichmentRaw_executivePersonId_fkey`;

-- DropForeignKey
ALTER TABLE `Footprint` DROP FOREIGN KEY `Footprint_personId_fkey`;

-- AlterTable
ALTER TABLE `EnrichmentRaw` DROP COLUMN `executiveList`,
    DROP COLUMN `executivePersonId`,
    ADD COLUMN `executiveCompanyId` INTEGER NULL;

-- AlterTable
ALTER TABLE `ExecutivePerson` DROP COLUMN `department`,
    DROP COLUMN `position`;

-- AlterTable
ALTER TABLE `Footprint` DROP COLUMN `description`,
    ADD COLUMN `actionDetail` VARCHAR(191) NULL,
    ADD COLUMN `deviceUsed` VARCHAR(191) NULL,
    MODIFY `element` ENUM('Ads', 'Button', 'Link', 'Form', 'Page', 'Content', 'Image', 'Cart', 'SocialMedia') NOT NULL,
    MODIFY `priorityLevel` ENUM('HIGH', 'MEDIUM', 'LOW') NULL,
    MODIFY `personId` INTEGER NULL;

-- AlterTable
ALTER TABLE `PersonEnrichment` DROP COLUMN `company`,
    DROP COLUMN `title`,
    ADD COLUMN `companyAddress` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `EnrichmentRaw` ADD CONSTRAINT `EnrichmentRaw_executiveCompanyId_fkey` FOREIGN KEY (`executiveCompanyId`) REFERENCES `ExecutiveCompany`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Footprint` ADD CONSTRAINT `Footprint_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `ExecutivePerson`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
