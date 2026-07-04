"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/server/auth";
import {
  upsertStat,
  deleteStat,
  listStats,
  getStatYears,
} from "@/lib/server/defacementStats";

/**
 * Fetch all defacement statistics grouped by year (public read).
 */
export async function getDefacementStatsAction(): Promise<{
  statsByYear: Record<
    number,
    { id: string; month: number; incidents: number }[]
  >;
  years: number[];
}> {
  const [stats, years] = await Promise.all([listStats(), getStatYears()]);

  const statsByYear: Record<
    number,
    { id: string; month: number; incidents: number }[]
  > = {};
  for (const s of stats) {
    (statsByYear[s.year] ??= []).push({
      id: s.id,
      month: s.month,
      incidents: s.incidents,
    });
  }

  return { statsByYear, years };
}

function revalidateStats() {
  revalidatePath("/");
  revalidatePath("/admin/statistics");
  revalidatePath("/admin");
}

export async function upsertStatAction(
  year: number,
  month: number,
  incidents: number,
): Promise<void> {
  const user = await requireAuth();

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12");
  }
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error("Year must be between 2000 and 2100");
  }
  if (!Number.isInteger(incidents) || incidents < 0) {
    throw new Error("Incidents must be a non-negative whole number");
  }

  await upsertStat(year, month, incidents, user.id);
  revalidateStats();
}

export async function deleteStatAction(id: string): Promise<void> {
  await requireAuth();
  await deleteStat(id);
  revalidateStats();
}
