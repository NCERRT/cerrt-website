import "server-only";
import { prisma } from "@/lib/prisma";
import type { AdvisoryCategory, Prisma } from "@prisma/client";

/**
 * Data-access layer for advisories.
 * Read functions are called directly by Server Components.
 * Write functions are called by Server Actions (which add auth + validation).
 */

export function listAdvisories(category?: AdvisoryCategory) {
  return prisma.advisory.findMany({
    where: category ? { category } : undefined,
    orderBy: { date: "desc" },
    include: { posterItems: { orderBy: { order: 'asc' } } },
  });
}

export function getAdvisoryById(id: string) {
  return prisma.advisory.findUnique({
    where: { id },
    include: { posterItems: { orderBy: { order: 'asc' } } },
  });
}

export function getAdvisoryByAdvisoryId(advisoryId: string) {
  return prisma.advisory.findUnique({
    where: { advisoryId },
    include: { posterItems: { orderBy: { order: 'asc' } } },
  });
}

export function getAdvisoryBySlug(slug: string) {
  return prisma.advisory.findUnique({
    where: { slug },
    include: { posterItems: { orderBy: { order: 'asc' } } },
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
