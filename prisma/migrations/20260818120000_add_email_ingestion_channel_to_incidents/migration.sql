-- CreateEnum
CREATE TYPE "SubmissionChannel" AS ENUM ('web', 'email', 'api');

-- AlterTable
ALTER TABLE "incident_reports"
  ADD COLUMN IF NOT EXISTS "submissionChannel" "SubmissionChannel" NOT NULL DEFAULT 'web',
  ADD COLUMN IF NOT EXISTS "emailMessageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "incident_reports_emailMessageId_key" ON "incident_reports"("emailMessageId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "incident_reports_submissionChannel_idx" ON "incident_reports"("submissionChannel");
