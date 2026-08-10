-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('analyst', 'mda_poc');

-- CreateTable
CREATE TABLE "secure_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "cerrtCaseId" TEXT NOT NULL,
    "taskLogId" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "secure_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_communications" (
    "id" TEXT NOT NULL,
    "cerrtCaseId" TEXT NOT NULL,
    "thehiveCaseId" TEXT,
    "senderType" "SenderType" NOT NULL,
    "messageBody" TEXT NOT NULL,
    "attachmentKey" TEXT,
    "attachmentName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_communications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "secure_tokens_token_key" ON "secure_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "secure_tokens_taskLogId_key" ON "secure_tokens"("taskLogId");

-- CreateIndex
CREATE INDEX "secure_tokens_token_idx" ON "secure_tokens"("token");

-- CreateIndex
CREATE INDEX "secure_tokens_cerrtCaseId_idx" ON "secure_tokens"("cerrtCaseId");

-- CreateIndex
CREATE INDEX "case_communications_cerrtCaseId_idx" ON "case_communications"("cerrtCaseId");

-- CreateIndex
CREATE INDEX "case_communications_createdAt_idx" ON "case_communications"("createdAt");

-- AddForeignKey
ALTER TABLE "secure_tokens" ADD CONSTRAINT "secure_tokens_cerrtCaseId_fkey" FOREIGN KEY ("cerrtCaseId") REFERENCES "incident_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_communications" ADD CONSTRAINT "case_communications_cerrtCaseId_fkey" FOREIGN KEY ("cerrtCaseId") REFERENCES "incident_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
