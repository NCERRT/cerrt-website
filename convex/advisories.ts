import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// File size limits (in bytes)
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

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

// Create advisory (admin only - auth check done in client)
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
    fileType: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    userId: v.id("users"), // passed from authenticated session
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Validate file size
    if (args.fileSize) {
      const maxSize =
        args.fileType === "pdf" ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
      if (args.fileSize > maxSize) {
        throw new Error(
          `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
        );
      }
    }

    const id = await ctx.db.insert("advisories", {
      title: args.title,
      description: args.description,
      category: args.category,
      severity: args.severity,
      advisoryId: args.advisoryId,
      date: now,
      fileStorageId: args.fileStorageId,
      fileType: args.fileType,
      fileName: args.fileName,
      fileSize: args.fileSize,
      createdBy: args.userId,
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
    fileType: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Validate file size if provided
    if (updates.fileSize) {
      const maxSize =
        updates.fileType === "pdf" ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
      if (updates.fileSize > maxSize) {
        throw new Error(
          `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
        );
      }
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
  args: { id: v.id("advisories") },
  handler: async (ctx, args) => {
    const advisory = await ctx.db.get(args.id);

    // Delete associated file from storage if exists
    if (advisory?.fileStorageId) {
      await ctx.storage.delete(advisory.fileStorageId);
    }

    await ctx.db.delete(args.id);
  },
});

// Generate file upload URL
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
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
