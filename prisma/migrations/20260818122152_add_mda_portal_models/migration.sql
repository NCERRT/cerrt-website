-- CreateEnum
CREATE TYPE "MdaRegistrationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "case_communications" ADD COLUMN     "isSyncedToHive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "incident_reports" ADD COLUMN     "mdaOrganizationId" TEXT;

-- CreateTable
CREATE TABLE "mda_registrations" (
    "id" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "acronym" TEXT,
    "sector" TEXT,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "emailDomain" TEXT NOT NULL,
    "status" "MdaRegistrationStatus" NOT NULL DEFAULT 'pending',
    "reviewedById" TEXT,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mda_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mda_organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT,
    "sector" TEXT,
    "verifiedDomains" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mda_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mda_accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "jobTitle" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mdaOrganizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mda_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mda_sessions" (
    "id" TEXT NOT NULL,
    "mdaAccountId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mda_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mda_registrations_status_idx" ON "mda_registrations"("status");

-- CreateIndex
CREATE INDEX "mda_registrations_emailDomain_idx" ON "mda_registrations"("emailDomain");

-- CreateIndex
CREATE UNIQUE INDEX "mda_registrations_contactEmail_key" ON "mda_registrations"("contactEmail");

-- CreateIndex
CREATE UNIQUE INDEX "mda_accounts_email_key" ON "mda_accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "mda_accounts_mdaOrganizationId_key" ON "mda_accounts"("mdaOrganizationId");

-- CreateIndex
CREATE INDEX "mda_sessions_mdaAccountId_idx" ON "mda_sessions"("mdaAccountId");

-- CreateIndex
CREATE INDEX "case_communications_isSyncedToHive_idx" ON "case_communications"("isSyncedToHive");

-- CreateIndex
CREATE INDEX "incident_reports_mdaOrganizationId_idx" ON "incident_reports"("mdaOrganizationId");

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_mdaOrganizationId_fkey" FOREIGN KEY ("mdaOrganizationId") REFERENCES "mda_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mda_accounts" ADD CONSTRAINT "mda_accounts_mdaOrganizationId_fkey" FOREIGN KEY ("mdaOrganizationId") REFERENCES "mda_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mda_sessions" ADD CONSTRAINT "mda_sessions_mdaAccountId_fkey" FOREIGN KEY ("mdaAccountId") REFERENCES "mda_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
