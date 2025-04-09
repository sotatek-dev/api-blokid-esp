-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `status` ENUM('Active', 'InActive', 'Closed') NOT NULL DEFAULT 'InActive',
    `dob` DATETIME(3) NULL,
    `role` ENUM('Admin', 'User', 'Business') NOT NULL,
    `gender` ENUM('Male', 'Female', 'Other') NOT NULL DEFAULT 'Other',
    `address` VARCHAR(191) NULL,
    `imageLink` VARCHAR(191) NULL,
    `lastActive` DATETIME(3) NULL,
    `forceResetPassword` BOOLEAN NOT NULL DEFAULT false,
    `language` ENUM('En', 'Vn') NOT NULL DEFAULT 'En',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
