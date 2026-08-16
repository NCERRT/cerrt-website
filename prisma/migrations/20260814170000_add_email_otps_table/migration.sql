-- CreateTable
CREATE TABLE IF NOT EXISTS "email_otps" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "email_otps_otpHash_key" ON "email_otps"("otpHash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "email_otps_email_idx" ON "email_otps"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "email_otps_otpHash_idx" ON "email_otps"("otpHash");
