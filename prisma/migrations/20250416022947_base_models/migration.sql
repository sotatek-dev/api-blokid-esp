/*
  Warnings:

  - You are about to alter the column `status` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `status` ENUM('Active', 'Inactive', 'Closed') NOT NULL DEFAULT 'Inactive';

-- CreateTable
CREATE TABLE `Business` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Business_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExecutiveCompany` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessId` INTEGER NULL,
    `name` VARCHAR(191) NOT NULL,
    `geography` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExecutiveUpload` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileName` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `storageLink` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExecutivePerson` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `fullName` VARCHAR(191) NULL,
    `linkedinProfileUrl` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `position` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `enrichmentStatus` ENUM('InProgress', 'Completed', 'Failed', 'NoEnrichment') NOT NULL DEFAULT 'NoEnrichment',
    `intentScore` DOUBLE NULL,
    `targetCompanyId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonEnrichment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `emailStatus` VARCHAR(191) NULL,
    `linkedin` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `company` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `position` VARCHAR(191) NULL,
    `companyName` VARCHAR(191) NULL,
    `targetPersonId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EnrichmentRaw` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `targetPersonId` INTEGER NOT NULL,
    `targetList` JSON NOT NULL,
    `request` JSON NOT NULL,
    `response` JSON NULL,
    `type` ENUM('Person', 'Company') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Footprint` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `action` ENUM('Click', 'Download', 'View', 'SubmitForm', 'Visit', 'Share') NOT NULL,
    `element` ENUM('Ads', 'Button', 'Link', 'Form', 'Page', 'Content') NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `priorityLevel` ENUM('HIGH', 'MEDIUM', 'LOW') NOT NULL,
    `intentScore` DOUBLE NULL,
    `confidence` DOUBLE NULL,
    `personId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IdentifyResolution` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personId` INTEGER NOT NULL,
    `email` VARCHAR(191) NULL,
    `emailHash` VARCHAR(191) NULL,
    `ip` VARCHAR(191) NULL,
    `uid` VARCHAR(191) NULL,
    `deviceFingerprint` VARCHAR(191) NULL,
    `confidence` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Campaign` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaignName` VARCHAR(191) NOT NULL,
    `budget` DOUBLE NULL,
    `spend` DOUBLE NULL,
    `remaining` DOUBLE NOT NULL,
    `reached` DOUBLE NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `status` ENUM('Active', 'Suspended', 'WaitingToLaunch', 'Completed', 'Paused', 'Cancelled') NOT NULL,
    `objective` ENUM('Nurture', 'Engagement', 'Awareness') NOT NULL,
    `description` VARCHAR(191) NULL,
    `geography` JSON NOT NULL,
    `role` JSON NOT NULL,
    `targetCompanyId` INTEGER NOT NULL,
    `campaignMetricId` INTEGER NOT NULL,
    `isBugdetByChannel` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Campaign_campaignMetricId_key`(`campaignMetricId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampaignStrategy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('Active', 'Suspended', 'WaitingToLaunch', 'Completed', 'Paused', 'Cancelled') NOT NULL,
    `channel` ENUM('GoogleAds', 'LinkedIn', 'DV360') NOT NULL,
    `budget` DOUBLE NOT NULL,
    `format` ENUM('SingleImage', 'SingleVideo') NOT NULL,
    `creativeLink` VARCHAR(191) NULL,
    `content` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NULL,
    `finishDate` DATETIME(3) NULL,
    `campaignId` INTEGER NOT NULL,
    `campaignMetricId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `CampaignStrategy_campaignMetricId_key`(`campaignMetricId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampaignMetric` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `spend` DOUBLE NULL,
    `account` INTEGER NULL,
    `impressions` INTEGER NULL,
    `avgTimeOnSite` DOUBLE NULL,
    `performance` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Business` ADD CONSTRAINT `Business_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExecutiveCompany` ADD CONSTRAINT `ExecutiveCompany_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonEnrichment` ADD CONSTRAINT `PersonEnrichment_targetPersonId_fkey` FOREIGN KEY (`targetPersonId`) REFERENCES `ExecutivePerson`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnrichmentRaw` ADD CONSTRAINT `EnrichmentRaw_targetPersonId_fkey` FOREIGN KEY (`targetPersonId`) REFERENCES `ExecutivePerson`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Footprint` ADD CONSTRAINT `Footprint_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `ExecutivePerson`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IdentifyResolution` ADD CONSTRAINT `IdentifyResolution_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `ExecutivePerson`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_campaignMetricId_fkey` FOREIGN KEY (`campaignMetricId`) REFERENCES `CampaignMetric`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_targetCompanyId_fkey` FOREIGN KEY (`targetCompanyId`) REFERENCES `ExecutiveCompany`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignStrategy` ADD CONSTRAINT `CampaignStrategy_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignStrategy` ADD CONSTRAINT `CampaignStrategy_campaignMetricId_fkey` FOREIGN KEY (`campaignMetricId`) REFERENCES `CampaignMetric`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
