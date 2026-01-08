/* =========================================================
   OviBase PROD Migration (New Update Only)
   Adds:
   - Finance.donationId + unique index + FK to Donation
   - StripeProviderSetting
   - Donation
   - DonationFund
   - MemberSubmission
   - TenantSubscription
   IMPORTANT:
   - Assumes the original tables already exist on production.
   - DOES NOT re-add existing foreign keys like Domain_tenantId_fkey.
   - Uses Finance (capital F) to match production casing.
   ========================================================= */

START TRANSACTION;

/* ---------------------------------------------------------
   1) Finance: add donationId (PROD has `Finance`, not `finance`)
   --------------------------------------------------------- */
ALTER TABLE `Finance`
  ADD COLUMN `donationId` VARCHAR(30) NULL;

/* Unique index for donationId */
CREATE UNIQUE INDEX `Finance_donationId_key`
  ON `Finance`(`donationId`);

/* ---------------------------------------------------------
   2) StripeProviderSetting
   --------------------------------------------------------- */
CREATE TABLE `StripeProviderSetting` (
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

/* FK: StripeProviderSetting -> Tenant */
ALTER TABLE `StripeProviderSetting`
  ADD CONSTRAINT `StripeProviderSetting_tenantId_fkey`
  FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

/* ---------------------------------------------------------
   3) Donation
   --------------------------------------------------------- */
CREATE TABLE `Donation` (
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

/* FK: Donation -> Tenant */
ALTER TABLE `Donation`
  ADD CONSTRAINT `Donation_tenantId_fkey`
  FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

/* FK: Finance.donationId -> Donation.id */
ALTER TABLE `Finance`
  ADD CONSTRAINT `Finance_donationId_fkey`
  FOREIGN KEY (`donationId`) REFERENCES `Donation`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

/* ---------------------------------------------------------
   4) DonationFund
   --------------------------------------------------------- */
CREATE TABLE `DonationFund` (
  `id` VARCHAR(30) NOT NULL,
  `tenantId` VARCHAR(30) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `isDefault` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `DonationFund_tenantId_idx`(`tenantId`),
  INDEX `DonationFund_tenantId_isDefault_idx`(`tenantId`, `isDefault`),
  UNIQUE INDEX `DonationFund_tenantId_name_key`(`tenantId`, `name`),

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

/* FK: DonationFund -> Tenant */
ALTER TABLE `DonationFund`
  ADD CONSTRAINT `DonationFund_tenantId_fkey`
  FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

/* ---------------------------------------------------------
   5) MemberSubmission
   --------------------------------------------------------- */
CREATE TABLE `MemberSubmission` (
  `id` VARCHAR(30) NOT NULL,
  `tenantId` VARCHAR(30) NOT NULL,
  `firstName` VARCHAR(191) NOT NULL,
  `lastName` VARCHAR(191) NULL,
  `gender` VARCHAR(32) NULL,
  `mobileNumber` VARCHAR(32) NULL,
  `email` VARCHAR(191) NULL,
  `dateOfBirth` DATETIME(3) NULL,
  `anniversaryDate` DATETIME(3) NULL,
  `churchUnit` VARCHAR(191) NULL,
  `churchLeader` VARCHAR(191) NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `reviewedAt` DATETIME(3) NULL,
  `reviewedBy` VARCHAR(30) NULL,
  `rejectReason` TEXT NULL,
  `memberId` VARCHAR(30) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `MemberSubmission_memberId_key`(`memberId`),
  INDEX `MemberSubmission_tenantId_createdAt_idx`(`tenantId`, `createdAt`),
  INDEX `MemberSubmission_tenantId_status_idx`(`tenantId`, `status`),
  INDEX `MemberSubmission_tenantId_email_idx`(`tenantId`, `email`),
  INDEX `MemberSubmission_tenantId_mobileNumber_idx`(`tenantId`, `mobileNumber`),

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

/* FK: MemberSubmission -> Tenant */
ALTER TABLE `MemberSubmission`
  ADD CONSTRAINT `MemberSubmission_tenantId_fkey`
  FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

/* ---------------------------------------------------------
   6) TenantSubscription (OviBase platform plan)
   --------------------------------------------------------- */
CREATE TABLE `TenantSubscription` (
  `id` VARCHAR(191) NOT NULL,
  `tenantId` VARCHAR(191) NOT NULL,
  `stripeCustomerId` VARCHAR(191) NULL,
  `stripeSubscriptionId` VARCHAR(191) NULL,
  `stripePriceId` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'inactive',
  `currentPeriodEnd` DATETIME(3) NULL,
  `cancelAtPeriodEnd` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `TenantSubscription_tenantId_key`(`tenantId`),
  UNIQUE INDEX `TenantSubscription_stripeCustomerId_key`(`stripeCustomerId`),
  UNIQUE INDEX `TenantSubscription_stripeSubscriptionId_key`(`stripeSubscriptionId`),

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

/* FK: TenantSubscription -> Tenant */
ALTER TABLE `TenantSubscription`
  ADD CONSTRAINT `TenantSubscription_tenantId_fkey`
  FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
