import "server-only";
import { prisma } from "@/lib/prisma";
import type { ContactStatus, InquiryType } from "@prisma/client";

/**
 * Data-access layer for contact form submissions.
 */

export interface ListContactSubmissionsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ContactStatus;
}

export async function listContactSubmissions(params: ListContactSubmissionsParams = {}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 15;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (params.status) {
    where.status = params.status;
  }

  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { subject: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
      { organization: { contains: q, mode: "insensitive" } },
    ];
  }

  const [submissions, totalCount] = await Promise.all([
    prisma.contactSubmission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.contactSubmission.count({ where }),
  ]);

  return { submissions, totalCount };
}

export function getContactSubmissionById(id: string) {
  return prisma.contactSubmission.findUnique({ where: { id } });
}

export interface CreateContactSubmissionData {
  inquiryType: InquiryType;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  subject: string;
  message: string;
}

export function createContactSubmission(data: CreateContactSubmissionData) {
  return prisma.contactSubmission.create({
    data: { ...data, status: "new" },
  });
}

export function updateContactStatus(id: string, status: ContactStatus) {
  return prisma.contactSubmission.update({
    where: { id },
    data: { status },
  });
}
