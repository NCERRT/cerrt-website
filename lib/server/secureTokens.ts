import "server-only";
import { prisma } from "@/lib/prisma";

export type TokenValidationResult =
  | { valid: true; tokenData: NonNullable<Awaited<ReturnType<typeof fetchToken>>> }
  | { valid: false; reason: "not_found" | "already_used" | "expired" };

export async function fetchToken(token: string) {
  return prisma.secureToken.findUnique({
    where: { token },
    include: {
      incidentReport: {
        select: {
          id: true,
          title: true,
          type: true,
          contactName: true,
          contactEmail: true,
          organization: true,
          submittedAt: true,
        },
      },
    },
  });
}

/**
 * Validates a secure token for MDA response submission.
 * Checks that the token exists, has not been used, and has not expired.
 */
export async function validateToken(token: string): Promise<TokenValidationResult> {
  const tokenRecord = await prisma.secureToken.findUnique({
    where: { token },
    include: {
      incidentReport: {
        select: {
          id: true,
          title: true,
          type: true,
          contactName: true,
          contactEmail: true,
          organization: true,
          submittedAt: true,
        },
      },
    },
  });

  if (!tokenRecord) {
    return { valid: false, reason: "not_found" };
  }

  if (tokenRecord.isUsed) {
    return { valid: false, reason: "already_used" };
  }

  if (new Date() > tokenRecord.expiresAt) {
    return { valid: false, reason: "expired" };
  }

  return { valid: true, tokenData: tokenRecord };
}
