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
