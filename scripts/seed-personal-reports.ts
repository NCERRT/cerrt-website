/**
 * Seed 2 test incident reports for lorem@mailsac.com to test Passwordless Personal Access.
 *
 * Usage:
 *   pnpm tsx scripts/seed-personal-reports.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const targetEmail = "lorem@mailsac.com";
  console.log(`🌱 Seeding 2 test incident reports for ${targetEmail}...`);

  // Report 1: Active Phishing Incident
  const report1 = await prisma.incidentReport.create({
    data: {
      trackingCode: "CERRT-2026-8812",
      title: "Credential Harvesting Phishing Campaign targeting Office 365 Users",
      type: "phishing",
      description:
        "Several staff members received suspicious emails claiming to be an urgent password reset notification from Microsoft 365. Clicking the link redirects to a fake login portal at https://login-office365-verify.com.",
      contactName: "Lorem Ipsum",
      contactEmail: targetEmail,
      contactPhone: "+2348039988776",
      organization: "National Energy Commission",
      severity: "high",
      status: "reviewing",
      ticketId: "CERRT-2026-PHISH-8812",
      thehiveCaseId: "CASE-9921",
      hiveStatus: "In Progress",
      hiveType: "Phishing",
      hiveSeverity: "High",
      hiveSummary: "Analyst actively investigating malicious domain infrastructure.",
      caseCommunications: {
        create: [
          {
            senderType: "analyst",
            messageBody:
              "CERRT Incident Response Team has received your report. We have initiated domain take-down procedures for the phishing URL and notified ISP providers.",
          },
          {
            senderType: "analyst",
            messageBody:
              "Analyst Update: Block rules have been issued across national perimeter firewalls. Please ensure any staff who entered credentials reset their passwords immediately.",
          },
        ],
      },
    },
  });

  console.log(`✓ Report 1 Created (ID: ${report1.id}, Tracking: ${report1.trackingCode})`);

  // Report 2: Resolved Defacement Incident
  const report2 = await prisma.incidentReport.create({
    data: {
      trackingCode: "CERRT-2026-9904",
      title: "Unauthorized Access Attempt & Defacement Notice on Subdomain",
      type: "web_defacement",
      description:
        "Subdomain portal.energy.gov.ng experienced unauthorized file upload resulting in an unauthorized landing page. Incident was contained within 15 minutes of occurrence.",
      contactName: "Lorem Ipsum",
      contactEmail: targetEmail,
      contactPhone: "+2348039988776",
      organization: "National Energy Commission",
      severity: "medium",
      status: "resolved",
      ticketId: "CERRT-2026-DEFACE-9904",
      thehiveCaseId: "CASE-9904",
      hiveStatus: "Resolved",
      hiveType: "Web Defacement",
      hiveSeverity: "Medium",
      hiveSummary: "Vulnerability patched, compromised files removed, server restored.",
      caseCommunications: {
        create: [
          {
            senderType: "analyst",
            messageBody:
              "CERRT Security Analyst Notice: Case resolved. The file upload vulnerability on the portal has been patched, backdoors removed, and clean backup restored.",
          },
        ],
      },
    },
  });

  console.log(`✓ Report 2 Created (ID: ${report2.id}, Tracking: ${report2.trackingCode})`);

  console.log("\n=======================================================");
  console.log("🎉 Test Reports Successfully Created!");
  console.log("=======================================================");
  console.log(` Target Email: ${targetEmail}`);
  console.log(` Report 1:     ${report1.trackingCode} (${report1.title})`);
  console.log(` Report 2:     ${report2.trackingCode} (${report2.title})`);
  console.log("=======================================================");
  console.log("Follow these steps to test Passwordless Access:");
  console.log("1. Open http://localhost:3000/my-reports");
  console.log(`2. Enter email: ${targetEmail}`);
  console.log("3. Check your terminal output for the 6-digit OTP code.");
  console.log("4. Enter the 6-digit code to view both reports!");
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
