"use server";

import { headers } from "next/headers";
import { validateToken } from "@/lib/server/secureTokens";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/server/rateLimit";
import {
  generateEvidenceFileKey,
  uploadEvidenceFile,
} from "@/lib/server/storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export async function validateTokenAction(token: string) {
  if (!token || typeof token !== "string") {
    return { valid: false as const, reason: "not_found" as const };
  }
  return validateToken(token.trim());
}

export async function submitMdaResponseAction(formData: FormData): Promise<{ success: boolean }> {
  const token = formData.get("token") as string | null;
  const messageBody = formData.get("messageBody") as string | null;
  const file = formData.get("file") as File | null;

  if (!token || !token.trim()) {
    throw new Error("Invalid or missing token.");
  }

  if (!messageBody || !messageBody.trim()) {
    throw new Error("Response message text is required.");
  }

  const trimmedMessage = messageBody.trim();
  if (trimmedMessage.length > 10000) {
    throw new Error("Response text must not exceed 10,000 characters.");
  }

  // Rate limiting by client IP
  const headersList = await headers();
  const clientIp =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  await checkRateLimit(clientIp, "mda_respond");

  // Validate token
  const validation = await validateToken(token.trim());
  if (!validation.valid) {
    if (validation.reason === "already_used") {
      throw new Error("This link has already been used to submit a response.");
    }
    if (validation.reason === "expired") {
      throw new Error("This link has expired. Please contact CERRT to request a new link.");
    }
    throw new Error("Invalid link.");
  }

  const { tokenData } = validation;
  let attachmentKey: string | undefined = undefined;
  let attachmentName: string | undefined = undefined;

  // File upload processing
  if (file && file.size > 0) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("Uploaded image must not exceed 10MB.");
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      throw new Error("Only PNG, JPG, and JPEG image evidence uploads are allowed.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    attachmentKey = generateEvidenceFileKey(file.name, tokenData.cerrtCaseId);
    attachmentName = file.name;

    await uploadEvidenceFile(attachmentKey, buffer, file.type);
  }

  // Atomic transaction: Insert communication entry & mark token as used
  await prisma.$transaction([
    prisma.caseCommunication.create({
      data: {
        cerrtCaseId: tokenData.cerrtCaseId,
        senderType: "mda_poc",
        messageBody: trimmedMessage,
        attachmentKey,
        attachmentName,
      },
    }),
    prisma.secureToken.update({
      where: { id: tokenData.id },
      data: { isUsed: true },
    }),
  ]);

  return { success: true };
}
