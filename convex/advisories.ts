import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./lib/auth";
import { checkRateLimit } from "./lib/rateLimit";
import {
  advisoryIdSchema,
  advisoryTitleSchema,
  advisoryDescriptionSchema,
} from "../lib/schemas";

// File size limits (in bytes)
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILENAME_LENGTH = 200;

// Server-side filename sanitization (defense in depth)
function sanitizeFileName(fileName: string): string {
  // Remove any path components
  let sanitized = fileName.replace(/^.*[\\/]/, "");
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");
  // Only allow safe characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "_");
  // Remove leading dots
  sanitized = sanitized.replace(/^\.+/, "");
  // Limit length
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    const extension = sanitized.match(/\.[^.]+$/)?.[0] || "";
    sanitized = sanitized.slice(0, MAX_FILENAME_LENGTH - extension.length) + extension;
  }
  if (!sanitized) {
    sanitized = `file_${Date.now()}`;
  }
  return sanitized;
}

// Validate file metadata
function validateFileMetadata(
  fileType: "pdf" | "image" | undefined,
  fileSize: number | undefined,
  fileName: string | undefined,
): void {
  if (!fileType && !fileSize && !fileName) return; // No file data to validate

  if (fileType && fileSize) {
    const maxSize = fileType === "pdf" ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
    if (fileSize > maxSize) {
      throw new Error(
        `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
      );
    }
    if (fileSize <= 0) {
      throw new Error("Invalid file size");
    }
  }

  if (fileName && fileName.length > MAX_FILENAME_LENGTH) {
    throw new Error(`Filename too long. Maximum ${MAX_FILENAME_LENGTH} characters`);
  }
}

// Get all advisories (public)
export const list = query({
  args: {
    category: v.optional(
      v.union(
        v.literal("individuals"),
        v.literal("organizations"),
        v.literal("kids"),
        v.literal("general"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      const advisories = await ctx.db
        .query("advisories")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();

      return advisories.sort((a, b) => b.date - a.date);
    }

    const advisories = await ctx.db.query("advisories").collect();
    return advisories.sort((a, b) => b.date - a.date);
  },
});

// Get single advisory by ID (public)
export const getById = query({
  args: { id: v.id("advisories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get single advisory by advisoryId (e.g., "IND-2024-001")
export const getByAdvisoryId = query({
  args: { advisoryId: v.string() },
  handler: async (ctx, args) => {
    const advisory = await ctx.db
      .query("advisories")
      .withIndex("by_advisoryId", (q) => q.eq("advisoryId", args.advisoryId))
      .first();

    return advisory;
  },
});

// Create advisory (admin only)
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("individuals"),
      v.literal("organizations"),
      v.literal("kids"),
      v.literal("general"),
    ),
    severity: v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low"),
    ),
    advisoryId: v.string(),
    fileStorageId: v.optional(v.id("_storage")),
    fileType: v.optional(v.union(v.literal("pdf"), v.literal("image"))),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    sessionId: v.id("sessions"), // Required for authentication
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const userId = await requireAuth(ctx, args.sessionId);

    const now = Date.now();

    // Validate title (length, control chars)
    const titleResult = advisoryTitleSchema.safeParse(args.title);
    if (!titleResult.success) {
      throw new Error(
        titleResult.error.issues[0]?.message || "Invalid title",
      );
    }
    const validatedTitle = titleResult.data;

    // Validate description (length, control chars)
    const descriptionResult = advisoryDescriptionSchema.safeParse(
      args.description,
    );
    if (!descriptionResult.success) {
      throw new Error(
        descriptionResult.error.issues[0]?.message ||
          "Invalid description",
      );
    }
    const validatedDescription = descriptionResult.data;

    // Validate advisory ID format (NCA-DDMMYY-NN)
    const advisoryIdResult = advisoryIdSchema.safeParse(args.advisoryId);
    if (!advisoryIdResult.success) {
      throw new Error(
        advisoryIdResult.error.issues[0]?.message ||
          "Invalid advisory ID format",
      );
    }
    const validatedAdvisoryId = advisoryIdResult.data;

    // Check for duplicate advisory ID
    const existing = await ctx.db
      .query("advisories")
      .withIndex("by_advisoryId", (q) =>
        q.eq("advisoryId", validatedAdvisoryId),
      )
      .first();
    if (existing) {
      throw new Error(
        `Advisory ID "${validatedAdvisoryId}" already exists. Use a different sequence number.`,
      );
    }

    // Validate file metadata (size, name length)
    validateFileMetadata(args.fileType, args.fileSize, args.fileName);

    // Sanitize filename server-side (defense in depth)
    const sanitizedFileName = args.fileName
      ? sanitizeFileName(args.fileName)
      : undefined;

    const id = await ctx.db.insert("advisories", {
      title: validatedTitle,
      description: validatedDescription,
      category: args.category,
      severity: args.severity,
      advisoryId: validatedAdvisoryId,
      date: now,
      fileStorageId: args.fileStorageId,
      fileType: args.fileType,
      fileName: sanitizedFileName,
      fileSize: args.fileSize,
      createdBy: userId, // Use authenticated user ID
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

// Update advisory (admin only)
export const update = mutation({
  args: {
    id: v.id("advisories"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("individuals"),
        v.literal("organizations"),
        v.literal("kids"),
        v.literal("general"),
      ),
    ),
    severity: v.optional(
      v.union(
        v.literal("critical"),
        v.literal("high"),
        v.literal("medium"),
        v.literal("low"),
      ),
    ),
    advisoryId: v.optional(v.string()),
    fileStorageId: v.optional(v.id("_storage")),
    fileType: v.optional(v.union(v.literal("pdf"), v.literal("image"))),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    sessionId: v.id("sessions"), // Required for authentication
  },
  handler: async (ctx, args) => {
    // Verify authentication
    await requireAuth(ctx, args.sessionId);

    // Extract id and exclude sessionId from updates
    const { id, sessionId, ...updates } = args;
    void sessionId; // Explicitly mark as unused

    // Validate title if changing
    if (updates.title !== undefined) {
      const result = advisoryTitleSchema.safeParse(updates.title);
      if (!result.success) {
        throw new Error(result.error.issues[0]?.message || "Invalid title");
      }
      updates.title = result.data;
    }

    // Validate description if changing
    if (updates.description !== undefined) {
      const result = advisoryDescriptionSchema.safeParse(updates.description);
      if (!result.success) {
        throw new Error(
          result.error.issues[0]?.message || "Invalid description",
        );
      }
      updates.description = result.data;
    }

    // Validate advisory ID format if changing it
    if (updates.advisoryId !== undefined) {
      const advisoryIdResult = advisoryIdSchema.safeParse(updates.advisoryId);
      if (!advisoryIdResult.success) {
        throw new Error(
          advisoryIdResult.error.issues[0]?.message ||
            "Invalid advisory ID format",
        );
      }
      updates.advisoryId = advisoryIdResult.data;

      // Check for duplicate (excluding the current record)
      const existing = await ctx.db
        .query("advisories")
        .withIndex("by_advisoryId", (q) =>
          q.eq("advisoryId", updates.advisoryId!),
        )
        .first();
      if (existing && existing._id !== id) {
        throw new Error(
          `Advisory ID "${updates.advisoryId}" already exists.`,
        );
      }
    }

    // Validate file metadata
    validateFileMetadata(updates.fileType, updates.fileSize, updates.fileName);

    // Sanitize filename if provided
    if (updates.fileName) {
      updates.fileName = sanitizeFileName(updates.fileName);
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete advisory (admin only)
export const remove = mutation({
  args: {
    id: v.id("advisories"),
    sessionId: v.id("sessions"), // Required for authentication
  },
  handler: async (ctx, args) => {
    // Verify authentication
    await requireAuth(ctx, args.sessionId);

    const advisory = await ctx.db.get(args.id);

    // Delete associated file from storage if exists
    if (advisory?.fileStorageId) {
      await ctx.storage.delete(advisory.fileStorageId);
    }

    await ctx.db.delete(args.id);
  },
});

// Generate file upload URL (admin only)
export const generateUploadUrl = mutation({
  args: {
    sessionId: v.id("sessions"), // Required for authentication
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const userId = await requireAuth(ctx, args.sessionId);

    // Rate limit file uploads per user
    await checkRateLimit(ctx, userId, "file_upload");

    return await ctx.storage.generateUploadUrl();
  },
});

// Get file URL
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
