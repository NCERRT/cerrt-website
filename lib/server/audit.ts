import "server-only";
import { headers } from "next/headers";
import { getCurrentUser } from "./auth";
import { prisma } from "../prisma";

export async function logAction(params: {
  action: string;
  description: string;
  targetId?: string | null;
  targetType?: string | null;
  metadata?: any;
  actorOverride?: { id: string | null; email: string; name: string };
}) {
  try {
    let user = params.actorOverride;
    if (!user) {
      const activeUser = await getCurrentUser();
      if (activeUser) {
        user = {
          id: activeUser.id,
          email: activeUser.email,
          name: activeUser.name,
        };
      }
    }

    let ipAddress: string | null = null;
    try {
      const headerList = await headers();
      ipAddress = headerList.get("x-forwarded-for")?.split(",")[0] || null;
    } catch {
      // headers() might throw outside of a request context (e.g. in some server commands/CLI)
    }

    await prisma.auditLog.create({
      data: {
        action: params.action,
        description: params.description,
        targetId: params.targetId || null,
        targetType: params.targetType || null,
        userId: user?.id || null,
        userEmail: user?.email || null,
        userName: user?.name || null,
        ipAddress,
        metadata: params.metadata || null,
      },
    });
  } catch (error) {
    // Fail-open to prevent audit logging issues from breaking critical flows
    console.error("Failed to write audit log:", error);
  }
}
