import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey.trim()).digest("hex");
}

export async function validateApiKey(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false as const };
  }

  const rawKey = authHeader.substring(7).trim();
  if (!rawKey) {
    return { valid: false as const };
  }

  const keyHash = hashApiKey(rawKey);

  const apiKeyRecord = await prisma.apiKey.findUnique({
    where: { keyHash },
  });

  if (!apiKeyRecord || !apiKeyRecord.isActive) {
    return { valid: false as const };
  }

  // Asynchronously update lastUsedAt without blocking request response
  prisma.apiKey
    .update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return { valid: true as const, apiKey: apiKeyRecord };
}
