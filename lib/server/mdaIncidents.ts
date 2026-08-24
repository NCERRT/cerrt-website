import "server-only";

import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/server/audit";
import { requireMdaSession } from "@/lib/server/mdaAuth";
import { matchMdaOrganizationByEmail } from "@/lib/server/mdaDomainMatcher";

export interface MdaIncidentReportInput {
  title?: string;
  type: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

/**
 * Retrieves incident reports linked to the authenticated MDA organization.
 */
export async function getMdaIncidents() {
  const session = await requireMdaSession();

  return prisma.incidentReport.findMany({
    where: {
      OR: [
        { mdaOrganizationId: session.organizationId },
        {
          contactEmail: {
            endsWith: session.verifiedDomains[0] ? `@${session.verifiedDomains[0]}` : undefined,
            mode: "insensitive",
          },
        },
      ],
    },
    include: {
      caseCommunications: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { submittedAt: "desc" },
  });
}

/**
 * Retrieves a single MDA incident report by ID (with security validation).
 */
export async function getMdaIncidentById(id: string) {
  const session = await requireMdaSession();

  const report = await prisma.incidentReport.findUnique({
    where: { id },
    include: {
      caseCommunications: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!report) return null;

  // Validate that the report belongs to this MDA organization or domain
  const isDirectMatch = report.mdaOrganizationId === session.organizationId;
  const isDomainMatch = session.verifiedDomains.some((d) =>
    report.contactEmail.toLowerCase().endsWith(`@${d.toLowerCase()}`),
  );

  if (!isDirectMatch && !isDomainMatch) {
    throw new Error("Unauthorized to access this incident report.");
  }

  // Audit log case view
  await logAction({
    action: "MDA_CASE_VIEW",
    description: `MDA user ${session.email} viewed case ${id}`,
    actorOverride: {
      id: session.accountId,
      email: session.email,
      name: session.contactName,
    },
    targetId: id,
    targetType: "IncidentReport",
  });

  return report;
}

/**
 * Submits a new incident report directly from the MDA Portal.
 * Automatically links to the authenticated MDA Organization.
 */
export async function submitMdaIncidentReport(input: MdaIncidentReportInput) {
  const session = await requireMdaSession();

  const contactEmail = input.contactEmail || session.email;
  const contactName = input.contactName || session.contactName;
  const contactPhone = input.contactPhone || session.phone || "";

  // Perform domain matching fallback if needed
  const matchedMdaId =
    session.organizationId || (await matchMdaOrganizationByEmail(contactEmail));

  const report = await prisma.incidentReport.create({
    data: {
      title: input.title?.trim() || null,
      type: input.type,
      description: input.description.trim(),
      severity: input.severity,
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      contactPhone: contactPhone.trim(),
      organization: session.organizationName,
      status: "new",
      submissionChannel: "web",
      mdaOrganizationId: matchedMdaId,
    },
  });

  await logAction({
    action: "MDA_INCIDENT_REPORT",
    description: `Incident reported by MDA ${session.organizationName} (${session.email})`,
    actorOverride: {
      id: session.accountId,
      email: session.email,
      name: session.contactName,
    },
    targetId: report.id,
    targetType: "IncidentReport",
  });

  return report;
}

/**
 * Posts a message from an MDA Officer to the case communication thread.
 */
export async function postMdaCaseCommunication(
  incidentId: string,
  messageBody: string,
  attachmentKey?: string,
  attachmentName?: string,
) {
  const session = await requireMdaSession();
  const report = await getMdaIncidentById(incidentId);

  if (!report) {
    throw new Error("Incident report not found.");
  }

  const communication = await prisma.caseCommunication.create({
    data: {
      cerrtCaseId: incidentId,
      thehiveCaseId: report.thehiveCaseId,
      senderType: "mda_poc",
      messageBody: messageBody.trim(),
      attachmentKey: attachmentKey || null,
      attachmentName: attachmentName || null,
      isSyncedToHive: false, // Local bridge worker will poll and push to TheHive!
    },
  });

  await logAction({
    action: "MDA_RESPONSE_SUBMIT",
    description: `MDA Officer ${session.email} posted a response on case ${incidentId}`,
    actorOverride: {
      id: session.accountId,
      email: session.email,
      name: session.contactName,
    },
    targetId: communication.id,
    targetType: "CaseCommunication",
  });

  return communication;
}

/**
 * Summary statistics for MDA dashboard.
 */
export async function getMdaDashboardStats() {
  const incidents = await getMdaIncidents();

  const total = incidents.length;
  const newCount = incidents.filter((i) => i.status === "new").length;
  const reviewingCount = incidents.filter((i) => i.status === "reviewing").length;
  const resolvedCount = incidents.filter((i) => i.status === "resolved").length;

  return {
    total,
    newCount,
    reviewingCount,
    resolvedCount,
    recentIncidents: incidents.slice(0, 5),
  };
}
