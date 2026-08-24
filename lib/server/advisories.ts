import "server-only";
import { prisma } from "@/lib/prisma";
import type { AdvisoryCategory, Prisma } from "@prisma/client";

/**
 * Data-access layer for advisories.
 * Read functions are called directly by Server Components.
 * Write functions are called by Server Actions (which add auth + validation).
 */

export interface ListAdvisoriesParams {
  page?: number;
  pageSize?: number;
  category?: AdvisoryCategory;
}

export async function listAdvisories(params: ListAdvisoriesParams = {}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 12;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (params.category) {
    where.category = params.category;
  }

  const [advisories, totalCount] = await Promise.all([
    prisma.advisory.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take: pageSize,
      include: { posterItems: { orderBy: { order: "asc" } } },
    }),
    prisma.advisory.count({ where }),
  ]);

  return { advisories, totalCount };
}

export function getAdvisoryById(id: string) {
  return prisma.advisory.findUnique({
    where: { id },
    include: { posterItems: { orderBy: { order: "asc" } } },
  });
}

export function getAdvisoryByAdvisoryId(advisoryId: string) {
  return prisma.advisory.findUnique({
    where: { advisoryId },
    include: { posterItems: { orderBy: { order: "asc" } } },
  });
}

export function getAdvisoryBySlug(slug: string) {
  return prisma.advisory.findUnique({
    where: { slug },
    include: { posterItems: { orderBy: { order: "asc" } } },
  });
}

export function createAdvisory(data: Prisma.AdvisoryUncheckedCreateInput) {
  return prisma.advisory.create({ data });
}

export function updateAdvisory(id: string, data: Prisma.AdvisoryUncheckedUpdateInput) {
  return prisma.advisory.update({ where: { id }, data });
}

export function deleteAdvisory(id: string) {
  return prisma.advisory.delete({ where: { id } });
}
