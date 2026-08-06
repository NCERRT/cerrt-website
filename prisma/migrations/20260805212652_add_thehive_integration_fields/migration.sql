-- AlterTable
ALTER TABLE "incident_reports" ADD COLUMN     "hiveSeverity" TEXT,
ADD COLUMN     "hiveStatus" TEXT,
ADD COLUMN     "hiveSummary" TEXT,
ADD COLUMN     "hiveType" TEXT,
ADD COLUMN     "thehiveCaseId" TEXT,
ADD COLUMN     "ticketId" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3);
