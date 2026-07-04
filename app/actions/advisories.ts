"use server";

import { revalidatePath } from "next/cache";
import type { AdvisoryCategory, FileType } from "@prisma/client";
import { requireAuth } from "@/lib/server/auth";
import {
  createAdvisory,
  updateAdvisory,
  deleteAdvisory,
  getAdvisoryById,
  getAdvisoryByAdvisoryId,
  listAdvisories,
} from "@/lib/server/advisories";
import { deleteFile, getDownloadUrl } from "@/lib/server/storage";
import { advisorySchema, formatZodError } from "@/lib/schemas";

interface FileMeta {
  fileKey: string;
  fileType: FileType;
  fileName: string;
  fileSize: number;
}

export interface AdvisoryWithFileUrl {
  id: string;
  title: string;
  description: string;
  category: AdvisoryCategory;
  severity: string;
  advisoryId: string;
  date: Date;
  fileType: FileType | null;
  fileName: string | null;
  fileSize: number | null;
  fileUrl: string | null;
}

/**
 * Fetch advisories (optionally filtered by category) with presigned file URLs.
 */
export async function getAdvisoriesAction(
  category?: AdvisoryCategory,
): Promise<AdvisoryWithFileUrl[]> {
  const advisories = await listAdvisories(category);

  return Promise.all(
    advisories.map(async (a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      category: a.category,
      severity: a.severity,
      advisoryId: a.advisoryId,
      date: a.date,
      fileType: a.fileType,
      fileName: a.fileName,
      fileSize: a.fileSize,
      fileUrl: a.fileKey ? await getDownloadUrl(a.fileKey, a.fileName) : null,
    })),
  );
}

/** Revalidate every page that displays advisories. */
function revalidateAdvisories() {
  revalidatePath("/");
  revalidatePath("/advisories", "layout");
  revalidatePath("/kids-advisory");
  revalidatePath("/admin/advisories");
}

export async function createAdvisoryAction(input: {
  title: string;
  description: string;
  category: string;
  severity: string;
  advisoryId: string;
  file?: FileMeta;
}): Promise<void> {
  const user = await requireAuth();

  const parsed = advisorySchema.safeParse({
    title: input.title,
    description: input.description,
    category: input.category,
    severity: input.severity,
    advisoryId: input.advisoryId,
  });
  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  // Duplicate advisory ID check
  const existing = await getAdvisoryByAdvisoryId(parsed.data.advisoryId);
  if (existing) {
    throw new Error(
      `Advisory ID "${parsed.data.advisoryId}" already exists. Use a different sequence number.`,
    );
  }

  await createAdvisory({
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    severity: parsed.data.severity,
    advisoryId: parsed.data.advisoryId,
    date: new Date(),
    createdById: user.id,
    fileKey: input.file?.fileKey,
    fileType: input.file?.fileType,
    fileName: input.file?.fileName,
    fileSize: input.file?.fileSize,
  });

  revalidateAdvisories();
}

export async function updateAdvisoryAction(
  id: string,
  input: {
    title: string;
    description: string;
    category: string;
    severity: string;
    advisoryId: string;
    file?: FileMeta;
  },
): Promise<void> {
  await requireAuth();

  const current = await getAdvisoryById(id);
  if (!current) {
    throw new Error("Advisory not found");
  }

  const parsed = advisorySchema.safeParse({
    title: input.title,
    description: input.description,
    category: input.category,
    severity: input.severity,
    advisoryId: input.advisoryId,
  });
  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  // Duplicate advisory ID check (excluding this record)
  const existing = await getAdvisoryByAdvisoryId(parsed.data.advisoryId);
  if (existing && existing.id !== id) {
    throw new Error(`Advisory ID "${parsed.data.advisoryId}" already exists.`);
  }

  // If a new file was uploaded, remove the old one from storage
  if (input.file && current.fileKey && current.fileKey !== input.file.fileKey) {
    try {
      await deleteFile(current.fileKey);
    } catch {
      // Non-fatal — orphaned file can be cleaned up later
    }
  }

  await updateAdvisory(id, {
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    severity: parsed.data.severity,
    advisoryId: parsed.data.advisoryId,
    ...(input.file
      ? {
          fileKey: input.file.fileKey,
          fileType: input.file.fileType,
          fileName: input.file.fileName,
          fileSize: input.file.fileSize,
        }
      : {}),
  });

  revalidateAdvisories();
}

export async function deleteAdvisoryAction(id: string): Promise<void> {
  await requireAuth();

  const advisory = await getAdvisoryById(id);
  if (!advisory) {
    throw new Error("Advisory not found");
  }

  // Remove the associated file from storage, if any
  if (advisory.fileKey) {
    try {
      await deleteFile(advisory.fileKey);
    } catch {
      // Non-fatal
    }
  }

  await deleteAdvisory(id);
  revalidateAdvisories();
}
