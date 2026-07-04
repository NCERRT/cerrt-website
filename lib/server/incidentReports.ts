import "server-only";
import { prisma } from "@/lib/prisma";
import type { IncidentStatus, Severity } from "@prisma/client";

/**
 * Data-access layer for incident reports.
 */

export function listIncidentReports(status?: IncidentStatus) {
  return prisma.incidentReport.findMany({
    where: status ? { status } : undefined,
    orderBy: { submittedAt: "desc" },
  });
}

export function getIncidentReportById(id: string) {
  return prisma.incidentReport.findUnique({ where: { id } });
}

export interface CreateIncidentReportData {
  type: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  organization: string;
  severity: Severity;
  trackingCode: string;
}

export function createIncidentReport(data: CreateIncidentReportData) {
  return prisma.incidentReport.create({
    data: { ...data, status: "new" },
  });
}

/**
 * Look up an incident by its public tracking code.
 * Returns the report or null. Caller is responsible for verifying that
 * the requesting email matches `contactEmail` before exposing data.
 */
export function findIncidentByTrackingCode(trackingCode: string) {
  return prisma.incidentReport.findUnique({ where: { trackingCode } });
}

export function updateIncidentReportStatus(
  id: string,
  status: IncidentStatus,
  reviewedById: string,
  notes?: string,
) {
  return prisma.incidentReport.update({
    where: { id },
    data: { status, reviewedById, reviewedAt: new Date(), notes },
  });
}

export async function getIncidentStats() {
  const [total, newCount, reviewing, resolved, closed, critical, high, medium, low] =
    await Promise.all([
      prisma.incidentReport.count(),
      prisma.incidentReport.count({ where: { status: "new" } }),
      prisma.incidentReport.count({ where: { status: "reviewing" } }),
      prisma.incidentReport.count({ where: { status: "resolved" } }),
      prisma.incidentReport.count({ where: { status: "closed" } }),
      prisma.incidentReport.count({ where: { severity: "critical" } }),
      prisma.incidentReport.count({ where: { severity: "high" } }),
      prisma.incidentReport.count({ where: { severity: "medium" } }),
      prisma.incidentReport.count({ where: { severity: "low" } }),
    ]);

  return {
    total,
    new: newCount,
    reviewing,
    resolved,
    closed,
    bySeverity: { critical, high, medium, low },
  };
}
