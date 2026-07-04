"use server";

import { requireSuperadmin } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

export interface AuditLogItem {
  id: string;
  timestamp: Date;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  action: string;
  description: string;
  ipAddress: string | null;
  targetId: string | null;
  targetType: string | null;
}

export interface GetAuditLogsResult {
  logs: AuditLogItem[];
  totalCount: number;
}

/**
 * Fetch a paginated, filterable list of audit logs. Superadmin-only.
 */
export async function getAuditLogsAction(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  actionType?: string;
}): Promise<GetAuditLogsResult> {
  await requireSuperadmin();

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const skip = (page - 1) * pageSize;

  const where: any = {};

  // Search keyword filter
  if (params.search) {
    const s = params.search.trim();
    where.OR = [
      { userEmail: { contains: s, mode: "insensitive" } },
      { userName: { contains: s, mode: "insensitive" } },
      { description: { contains: s, mode: "insensitive" } },
      { ipAddress: { contains: s, mode: "insensitive" } },
    ];
  }

  // Action type prefix filter (e.g. AUTH, USER, INCIDENT)
  if (params.actionType && params.actionType !== "ALL") {
    where.action = { startsWith: params.actionType };
  }

  const [logs, totalCount] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs: logs.map((l) => ({
      id: l.id,
      timestamp: l.timestamp,
      userId: l.userId,
      userEmail: l.userEmail,
      userName: l.userName,
      action: l.action,
      description: l.description,
      ipAddress: l.ipAddress,
      targetId: l.targetId,
      targetType: l.targetType,
    })),
    totalCount,
  };
}
