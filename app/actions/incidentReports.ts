"use server";

import { revalidatePath } from "next/cache";
import {
  createIncidentReport,
  updateIncidentReportStatus,
  getIncidentStats,
  listIncidentReports,
  findIncidentByTrackingCode,
} from "@/lib/server/incidentReports";
import { requireAuth } from "@/lib/server/auth";
import type { IncidentStatus, Severity } from "@prisma/client";
import { checkRateLimit } from "@/lib/server/rateLimit";
import {
  incidentReportSchema,
  incidentStatusSchema,
  formatZodError,
  LIMITS,
} from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/server/audit";
import {
  generateTrackingCode,
  isValidTrackingCode,
  normalizeTrackingCode,
} from "@/lib/server/trackingCode";

/**
 * Submit an incident report (public — no auth required).
 * Returns the generated tracking code so the reporter can check status later.
 */
export async function submitIncidentReportAction(input: {
  title?: string;
  type: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  organization: string;
  severity: string;
}): Promise<{ trackingCode: string }> {
  const parsed = incidentReportSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  // Rate limit by email
  await checkRateLimit(parsed.data.contactEmail, "incident_report");

  const trackingCode = generateTrackingCode();

  await createIncidentReport({
    title: parsed.data.title,
    type: parsed.data.type,
    description: parsed.data.description,
    contactName: parsed.data.contactName,
    contactEmail: parsed.data.contactEmail,
    contactPhone: parsed.data.contactPhone,
    organization: parsed.data.organization,
    severity: parsed.data.severity,
    trackingCode,
  });

  revalidatePath("/admin/reports");
  revalidatePath("/admin");

  return { trackingCode };
}

/**
 * Public tracking lookup. Returns minimal, non-sensitive status info if the
 * tracking code + email match a real report. Rate-limited by email to slow
 * brute-force enumeration.
 */
export interface IncidentTrackingResult {
  trackingCode: string;
  status: IncidentStatus;
  type: string;
  severity: Severity;
  submittedAt: Date;
  reviewedAt: Date | null;
}

export async function lookupIncidentTrackingAction(input: {
  trackingCode: string;
  email: string;
}): Promise<IncidentTrackingResult | null> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedCode = normalizeTrackingCode(input.trackingCode);

  // Rate-limit by email (the legit user knows their own email)
  await checkRateLimit(normalizedEmail || "anonymous", "incident_tracking");

  if (!isValidTrackingCode(normalizedCode)) return null;
  if (!normalizedEmail || !normalizedEmail.includes("@")) return null;

  const report = await findIncidentByTrackingCode(normalizedCode);
  if (!report) return null;
  if (report.contactEmail.toLowerCase() !== normalizedEmail) return null;

  // Return ONLY safe fields. Never expose contact details, description,
  // notes, or reviewer info on the public lookup.
  return {
    trackingCode: report.trackingCode!,
    status: report.status,
    type: report.type,
    severity: report.severity,
    submittedAt: report.submittedAt,
    reviewedAt: report.reviewedAt,
  };
}

/**
 * Fetch incident reports (admin only).
 */
export async function getIncidentReportsAction(status?: IncidentStatus) {
  await requireAuth();
  return listIncidentReports(status);
}

/**
 * Fetch incident report statistics (admin only).
 */
export async function getIncidentStatsAction() {
  await requireAuth();
  return getIncidentStats();
}

/**
 * Update an incident report's status (admin only).
 */
export async function updateIncidentStatusAction(
  id: string,
  status: string,
  notes?: string,
): Promise<void> {
  const user = await requireAuth();

  const statusResult = incidentStatusSchema.safeParse(status);
  if (!statusResult.success) {
    throw new Error("Invalid status");
  }

  let validatedNotes: string | undefined = undefined;
  if (notes !== undefined) {
    const trimmed = notes.trim();
    if (trimmed.length > LIMITS.NOTES_MAX) {
      throw new Error(`Notes must not exceed ${LIMITS.NOTES_MAX} characters`);
    }
    validatedNotes = trimmed.length > 0 ? trimmed : undefined;
  }

  await updateIncidentReportStatus(
    id,
    statusResult.data,
    user.id,
    validatedNotes,
  );

  const report = await prisma.incidentReport.findUnique({
    where: { id },
  });

  await logAction({
    action: "INCIDENT_UPDATE",
    description: `Incident report ${report?.trackingCode || id} updated to status: ${statusResult.data}`,
    targetId: id,
    targetType: "IncidentReport",
    metadata: {
      status: statusResult.data,
      notesProvided: !!validatedNotes,
    },
  });

  revalidatePath("/admin/reports");
  revalidatePath("/admin");
}
