"use server";

import { revalidatePath } from "next/cache";
import type { AdvisoryCategory, FileType, AdvisoryType } from "@prisma/client";
import { requireAuth } from "@/lib/server/auth";
import {
  createAdvisory,
  updateAdvisory,
  deleteAdvisory,
  getAdvisoryById,
  getAdvisoryByAdvisoryId,
  getAdvisoryBySlug,
  listAdvisories,
} from "@/lib/server/advisories";
import { deleteFile, getDownloadUrl } from "@/lib/server/storage";
import { advisorySchema, formatZodError, type AdvisoryInput } from "@/lib/schemas";
import { logAction } from "@/lib/server/audit";

interface FileMeta {
  fileKey: string;
  fileType: FileType;
  fileName: string;
  fileSize: number;
}

export interface PosterItemWithUrl {
  id: string;
  imageKey: string;
  fileName: string;
  fileSize: number;
  order: number;
  fileUrl: string;
}

export interface AdvisoryDetailWithUrls {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  type: AdvisoryType;
  overview: string | null;
  impact: string | null;
  affectedProducts: string[];
  recommendedActions: string[];
  references: string[];
  tags: string[];
  category: AdvisoryCategory;
  severity: string;
  advisoryId: string;
  date: Date;
  fileType: FileType | null;
  fileName: string | null;
  fileSize: number | null;
  fileUrl: string | null;
  posterItems: PosterItemWithUrl[];
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Fetch advisories (optionally filtered by category) with presigned file URLs.
 */
export async function getAdvisoriesAction(
  category?: AdvisoryCategory,
): Promise<AdvisoryDetailWithUrls[]> {
  const advisories = await listAdvisories(category);

  return Promise.all(
    advisories.map(async (a) => ({
      ...a,
      fileUrl: a.fileKey ? await getDownloadUrl(a.fileKey, a.fileName || undefined) : null,
      posterItems: await Promise.all(
        (a as unknown as { posterItems?: { imageKey: string; fileName: string | null }[] }).posterItems?.map(async (p) => ({
          ...p,
          fileUrl: await getDownloadUrl(p.imageKey, p.fileName),
        })) || []
      ),
    }))
  ) as unknown as AdvisoryDetailWithUrls[];
}

export async function getAdvisoryBySlugAction(
  slug: string,
): Promise<AdvisoryDetailWithUrls | null> {
  const a = await getAdvisoryBySlug(slug) as unknown as { fileKey?: string | null; fileName?: string | null; posterItems?: { imageKey: string; fileName: string | null }[] } | null;
  if (!a) return null;

  return {
    ...a,
    fileUrl: a.fileKey ? await getDownloadUrl(a.fileKey, a.fileName || undefined) : null,
    posterItems: await Promise.all(
      (a.posterItems || []).map(async (p) => ({
        ...p,
        fileUrl: await getDownloadUrl(p.imageKey, p.fileName),
      }))
    ),
  } as unknown as AdvisoryDetailWithUrls;
}

/** Revalidate every page that displays advisories. */
function revalidateAdvisories() {
  revalidatePath("/");
  revalidatePath("/advisories", "layout");
  revalidatePath("/kids-advisory");
  revalidatePath("/cerrt-ops/advisories");
}

export async function createAdvisoryAction(input: AdvisoryInput & {
  file?: FileMeta;
  posterItems?: { imageKey: string; fileName: string; fileSize: number; order: number }[];
}): Promise<void> {
  const user = await requireAuth();

  const parsed = advisorySchema.safeParse(input);
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

  let slug = slugify(parsed.data.title);
  const existingSlug = await getAdvisoryBySlug(slug);
  if (existingSlug) {
    slug = `${slug}-${parsed.data.advisoryId.toLowerCase()}`;
  }

  const { type, title, overview, category, severity, advisoryId, tags } = parsed.data;

  let standardFields = {};
  if (parsed.data.type === 'standard') {
    standardFields = {
      impact: parsed.data.impact,
      affectedProducts: parsed.data.affectedProducts,
      recommendedActions: parsed.data.recommendedActions,
      references: parsed.data.references,
    };
  }

  const created = await createAdvisory({
    slug,
    title,
    description: overview, // fallback for now
    type,
    overview,
    category,
    severity,
    advisoryId,
    tags,
    ...standardFields,
    date: new Date(),
    createdById: user.id,
    fileKey: input.file?.fileKey,
    fileType: input.file?.fileType,
    fileName: input.file?.fileName,
    fileSize: input.file?.fileSize,
    posterItems: {
      create: input.posterItems?.map(p => ({
        imageKey: p.imageKey,
        fileName: p.fileName,
        fileSize: p.fileSize,
        order: p.order,
      })) || []
    }
  });

  await logAction({
    action: "ADVISORY_CREATE",
    description: `Created advisory ${advisoryId}: "${title}" (${category})`,
    targetId: created.id,
    targetType: "Advisory",
    metadata: { advisoryId, title, category, severity, type },
  });

  revalidateAdvisories();
}

export async function updateAdvisoryAction(
  id: string,
  input: AdvisoryInput & {
    file?: FileMeta;
    posterItems?: { id?: string; imageKey: string; fileName: string; fileSize: number; order: number }[];
  },
): Promise<void> {
  await requireAuth();

  const current = await getAdvisoryById(id);
  if (!current) {
    throw new Error("Advisory not found");
  }

  const parsed = advisorySchema.safeParse(input);
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

  const slug = current.slug || slugify(parsed.data.title);

  const { type, title, overview, category, severity, advisoryId, tags } = parsed.data;

  let standardFields = {};
  if (parsed.data.type === 'standard') {
    standardFields = {
      impact: parsed.data.impact,
      affectedProducts: parsed.data.affectedProducts,
      recommendedActions: parsed.data.recommendedActions,
      references: parsed.data.references,
    };
  } else {
    standardFields = {
      impact: null,
      affectedProducts: [],
      recommendedActions: [],
      references: [],
    };
  }

  await updateAdvisory(id, {
    slug,
    title,
    description: overview, // fallback for now
    type,
    overview,
    category,
    severity,
    advisoryId,
    tags,
    ...standardFields,
    ...(input.file
      ? {
          fileKey: input.file.fileKey,
          fileType: input.file.fileType,
          fileName: input.file.fileName,
          fileSize: input.file.fileSize,
        }
      : {}),
    // Simplified: Delete all poster items and recreate them to handle order updates easily
    posterItems: {
      deleteMany: {},
      create: input.posterItems?.map(p => ({
        imageKey: p.imageKey,
        fileName: p.fileName,
        fileSize: p.fileSize,
        order: p.order,
      })) || []
    }
  });

  await logAction({
    action: "ADVISORY_UPDATE",
    description: `Updated advisory ${advisoryId}: "${title}" (${category})`,
    targetId: id,
    targetType: "Advisory",
    metadata: { advisoryId, title, category, severity, type },
  });

  revalidateAdvisories();
}

export async function deleteAdvisoryAction(id: string): Promise<void> {
  await requireAuth();

  const advisory = await getAdvisoryById(id) as unknown as { fileKey?: string | null; posterItems?: { imageKey: string }[]; advisoryId?: string; title?: string } | null;
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

  if (advisory.posterItems) {
    for (const p of advisory.posterItems) {
      try {
        await deleteFile(p.imageKey);
      } catch {}
    }
  }

  await deleteAdvisory(id);

  await logAction({
    action: "ADVISORY_DELETE",
    description: `Deleted advisory ${advisory.advisoryId || id}: "${advisory.title || "Untitled"}"`,
    targetId: id,
    targetType: "Advisory",
  });

  revalidateAdvisories();
}
