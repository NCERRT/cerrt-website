/**
 * Seed a test token and incident report to test the MDA two-way communication flow locally.
 *
 * Usage:
 *   pnpm tsx scripts/seed-test-token.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomUUID } from "node:crypto";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding local test data for MDA Communication testing...");

  // 1. Find or create a test incident report
  let report = await prisma.incidentReport.findFirst({
    where: { contactEmail: "mda.poc@agency.gov.ng" },
  });

  if (!report) {
    report = await prisma.incidentReport.create({
      data: {
        title: "Suspected Ransomware Incident on Agency Server",
        type: "ransomware",
        description: "Multiple files encrypted with .locked extension. Demand note left on desktop.",
        contactName: "Dr. Ibrahim Musa",
        contactEmail: "mda.poc@agency.gov.ng",
        contactPhone: "+2348012345678",
        organization: "Federal Ministry of Technology",
        severity: "high",
        status: "reviewing",
        ticketId: "CERRT-2026-TEST",
        thehiveCaseId: "CASE-9901",
        hiveStatus: "In Progress",
        hiveType: "Ransomware",
        hiveSeverity: "High",
        hiveSummary: "Analyst actively investigating encrypted server artifacts.",
      },
    });
    console.log(`✓ Created test incident report (ID: ${report.id})`);
  } else {
    console.log(`✓ Found existing test incident report (ID: ${report.id})`);
  }

  // 2. Clear old test tokens
  const TEST_TOKEN = "test-mda-token-12345";
  const TEST_TASK_LOG_ID = `log-${randomUUID()}`;

  await prisma.secureToken.deleteMany({
    where: { token: TEST_TOKEN },
  });

  // 3. Create fresh secure token (expires in 72 hours)
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
  const tokenRecord = await prisma.secureToken.create({
    data: {
      token: TEST_TOKEN,
      cerrtCaseId: report.id,
      taskLogId: TEST_TASK_LOG_ID,
      isUsed: false,
      expiresAt,
    },
  });

  console.log(`✓ Created fresh secure token: ${tokenRecord.token}`);
  console.log(`  Expires at: ${expiresAt.toLocaleString()}`);

  // 4. Create initial analyst prompt communication log
  await prisma.caseCommunication.create({
    data: {
      cerrtCaseId: report.id,
      thehiveCaseId: "CASE-9901",
      senderType: "analyst",
      messageBody: "CERRT Analyst requested additional information: Please provide screenshots of the ransomware note and any affected IP addresses or file extensions.",
    },
  });

  console.log("✓ Added sample analyst request log to case_communications");

  console.log("\n=======================================================");
  console.log("🎉 Test Data Ready! Follow these steps to test locally:");
  console.log("=======================================================");
  console.log(`1. Open this URL in your browser:`);
  console.log(`   http://localhost:3000/respond?token=${TEST_TOKEN}`);
  console.log(`2. Submit a response with text and an image attachment.`);
  console.log(`3. Verify the success screen is shown and token is consumed.`);
  console.log(`4. Re-open the same link to verify it shows 'Link Already Used'.`);
  console.log(`5. Check the admin details page at:`);
  console.log(`   http://localhost:3000/cerrt-ops/reports/${report.id}`);
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
