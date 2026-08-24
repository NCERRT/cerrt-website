import "server-only";
import { prisma } from "@/lib/prisma";
import type { IncidentStatus, Severity, SubmissionChannel } from "@prisma/client";

/**
 * Data-access layer for incident reports.
 */

export interface ListIncidentReportsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: IncidentStatus;
  submissionChannel?: SubmissionChannel;
}

export async function listIncidentReports(params: ListIncidentReportsParams = {}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 15;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (params.status) {
    where.status = params.status;
  }

  if (params.submissionChannel) {
    where.submissionChannel = params.submissionChannel;
  }

  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { contactName: { contains: q, mode: "insensitive" } },
      { contactEmail: { contains: q, mode: "insensitive" } },
      { organization: { contains: q, mode: "insensitive" } },
      { thehiveCaseId: { contains: q, mode: "insensitive" } },
    ];
  }

  const [reports, totalCount] = await Promise.all([
    prisma.incidentReport.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.incidentReport.count({ where }),
  ]);

  return { reports, totalCount };
}

export function getIncidentReportById(id: string) {
  return prisma.incidentReport.findUnique({ where: { id } });
}

export interface CreateIncidentReportData {
  title?: string;
  type: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  organization: string;
  severity: Severity;
  trackingCode?: string;
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
