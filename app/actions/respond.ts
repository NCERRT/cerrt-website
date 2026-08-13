"use server";

import { headers } from "next/headers";
import { validateToken } from "@/lib/server/secureTokens";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/server/rateLimit";
import {
  generateEvidenceFileKey,
  uploadEvidenceFile,
} from "@/lib/server/storage";

import { logAction } from "@/lib/server/audit";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES_COUNT = 3;
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

  // Retrieve single or multiple files safely
  let rawFiles = formData.getAll("files") as File[];
  if (!rawFiles || rawFiles.length === 0) {
    const singleFile = formData.get("file") as File | null;
    if (singleFile) rawFiles = [singleFile];
  }

  const files = (rawFiles || []).filter((f) => f && f.size > 0);

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

  if (files.length > MAX_FILES_COUNT) {
    throw new Error(`You can upload a maximum of ${MAX_FILES_COUNT} evidence images.`);
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
  const attachmentsList: { key: string; name: string }[] = [];

  // Multi-file upload processing
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File "${file.name}" exceeds the 5MB size limit.`);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      throw new Error(`File "${file.name}" is not an allowed format. Only PNG, JPG, and JPEG images are accepted.`);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const key = generateEvidenceFileKey(file.name, tokenData.cerrtCaseId);

    await uploadEvidenceFile(key, buffer, file.type);
    attachmentsList.push({ key, name: file.name });
  }

  const primaryAttachment = attachmentsList[0];

  // Atomic transaction: Insert communication entry & mark token as used
  await prisma.$transaction([
    prisma.caseCommunication.create({
      data: {
        cerrtCaseId: tokenData.cerrtCaseId,
        senderType: "mda_poc",
        messageBody: trimmedMessage,
        attachmentKey: primaryAttachment?.key ?? null,
        attachmentName: primaryAttachment?.name ?? null,
        attachments: attachmentsList.length > 0 ? attachmentsList : undefined,
      },
    }),
    prisma.secureToken.update({
      where: { id: tokenData.id },
      data: { isUsed: true },
    }),
  ]);

  await logAction({
    action: "MDA_RESPONSE_SUBMIT",
    description: `MDA contact submitted response for case ${tokenData.cerrtCaseId} (${attachmentsList.length} evidence attachment(s))`,
    targetId: tokenData.cerrtCaseId,
    targetType: "IncidentReport",
    actorOverride: { id: null, email: "mda_poc@external", name: "MDA Point of Contact" },
    metadata: {
      cerrtCaseId: tokenData.cerrtCaseId,
      attachmentCount: attachmentsList.length,
      attachments: attachmentsList,
    },
  });

  return { success: true };
}
