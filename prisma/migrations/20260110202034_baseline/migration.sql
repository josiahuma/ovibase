/*
  Warnings:

  - The primary key for the `attendance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `churchunitcategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `eventcategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `leader` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `member` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `smstemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[donationId]` on the table `finance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `attendance` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(32) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `churchunitcategory` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(32) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `eventcategory` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(32) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `finance` ADD COLUMN `donationId` VARCHAR(30) NULL;

-- AlterTable
ALTER TABLE `leader` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(32) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `member` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(32) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `smslog` MODIFY `templateId` VARCHAR(191) NULL,
    MODIFY `memberId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `smstemplate` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(32) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `donation` (
    `id` VARCHAR(30) NOT NULL,
    `tenantId` VARCHAR(30) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(10) NOT NULL,
    `isRecurring` BOOLEAN NOT NULL DEFAULT false,
    `interval` VARCHAR(16) NULL,
    `giftAid` BOOLEAN NOT NULL DEFAULT false,
    `donorName` VARCHAR(191) NULL,
    `donorEmail` VARCHAR(191) NULL,
    `address1` VARCHAR(191) NULL,
    `address2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `county` VARCHAR(191) NULL,
    `postcode` VARCHAR(32) NULL,
    `country` VARCHAR(2) NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `stripeSessionId` VARCHAR(191) NULL,
    `stripePaymentIntentId` VARCHAR(191) NULL,
    `stripeSubscriptionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `paidAt` DATETIME(3) NULL,

    UNIQUE INDEX `Donation_stripeSessionId_key`(`stripeSessionId`),
    UNIQUE INDEX `Donation_stripePaymentIntentId_key`(`stripePaymentIntentId`),
    UNIQUE INDEX `Donation_stripeSubscriptionId_key`(`stripeSubscriptionId`),
    INDEX `Donation_tenantId_createdAt_idx`(`tenantId`, `createdAt`),
    INDEX `Donation_tenantId_status_idx`(`tenantId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stripeprovidersetting` (
    `tenantId` VARCHAR(30) NOT NULL,
    `mode` ENUM('TEST', 'LIVE') NOT NULL DEFAULT 'TEST',
    `secretKeyEnc` LONGBLOB NULL,
    `secretKeyIv` LONGBLOB NULL,
    `secretKeyTag` LONGBLOB NULL,
    `publishableKey` VARCHAR(191) NULL,
    `webhookSecretEnc` LONGBLOB NULL,
    `webhookSecretIv` LONGBLOB NULL,
    `webhookSecretTag` LONGBLOB NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'gbp',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`tenantId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Finance_donationId_key` ON `finance`(`donationId`);

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `Attendance_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `churchunitcategory` ADD CONSTRAINT `ChurchUnitCategory_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `domain` ADD CONSTRAINT `Domain_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donationfund` ADD CONSTRAINT `DonationFund_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventcategory` ADD CONSTRAINT `EventCategory_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expensecategory` ADD CONSTRAINT `ExpenseCategory_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance` ADD CONSTRAINT `Finance_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `incomecategory` ADD CONSTRAINT `IncomeCategory_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leader` ADD CONSTRAINT `Leader_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member` ADD CONSTRAINT `Member_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `membersubmission` ADD CONSTRAINT `MemberSubmission_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `smsprovidersetting` ADD CONSTRAINT `SmsProviderSetting_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `smstemplate` ADD CONSTRAINT `SmsTemplate_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenantsubscription` ADD CONSTRAINT `TenantSubscription_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usertenant` ADD CONSTRAINT `UserTenant_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usertenant` ADD CONSTRAINT `UserTenant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
