import "server-only";
import { prisma } from "@/lib/prisma";
import type { AdvisoryCategory, FileType, Severity } from "@prisma/client";

/**
 * Data-access layer for advisories.
 * Read functions are called directly by Server Components.
 * Write functions are called by Server Actions (which add auth + validation).
 */

export function listAdvisories(category?: AdvisoryCategory) {
  return prisma.advisory.findMany({
    where: category ? { category } : undefined,
    orderBy: { date: "desc" },
  });
}

export function getAdvisoryById(id: string) {
  return prisma.advisory.findUnique({ where: { id } });
}

export function getAdvisoryByAdvisoryId(advisoryId: string) {
  return prisma.advisory.findUnique({ where: { advisoryId } });
}

export interface CreateAdvisoryData {
  title: string;
  description: string;
  category: AdvisoryCategory;
  severity: Severity;
  advisoryId: string;
  date: Date;
  fileKey?: string;
  fileType?: FileType;
  fileName?: string;
  fileSize?: number;
  createdById: string;
}

export function createAdvisory(data: CreateAdvisoryData) {
  return prisma.advisory.create({ data });
}

export interface UpdateAdvisoryData {
  title?: string;
  description?: string;
  category?: AdvisoryCategory;
  severity?: Severity;
  advisoryId?: string;
  fileKey?: string;
  fileType?: FileType;
  fileName?: string;
  fileSize?: number;
}

export function updateAdvisory(id: string, data: UpdateAdvisoryData) {
  return prisma.advisory.update({ where: { id }, data });
}

export function deleteAdvisory(id: string) {
  return prisma.advisory.delete({ where: { id } });
}
