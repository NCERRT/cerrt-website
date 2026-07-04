import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Data-access layer for defacement statistics (monthly incident counts).
 */

export function listStats() {
  return prisma.defacementStat.findMany({
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });
}

export function listStatsByYear(year: number) {
  return prisma.defacementStat.findMany({
    where: { year },
    orderBy: { month: "asc" },
  });
}

export async function getStatYears(): Promise<number[]> {
  const rows = await prisma.defacementStat.findMany({
    distinct: ["year"],
    select: { year: true },
    orderBy: { year: "desc" },
  });
  return rows.map((r) => r.year);
}

export function upsertStat(
  year: number,
  month: number,
  incidents: number,
  createdById: string,
) {
  return prisma.defacementStat.upsert({
    where: { year_month: { year, month } },
    create: { year, month, incidents, createdById },
    update: { incidents },
  });
}

export function deleteStat(id: string) {
  return prisma.defacementStat.delete({ where: { id } });
}
