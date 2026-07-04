import "server-only";
import { prisma } from "@/lib/prisma";
import type { ContactStatus, InquiryType } from "@prisma/client";

/**
 * Data-access layer for contact form submissions.
 */

export function listContactSubmissions(status?: ContactStatus) {
  return prisma.contactSubmission.findMany({
    where: status ? { status } : undefined,
    orderBy: { submittedAt: "desc" },
  });
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
