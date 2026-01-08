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


COMMIT;
