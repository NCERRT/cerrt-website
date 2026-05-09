import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkRateLimit } from "./lib/rateLimit";
import { requireAuth } from "./lib/auth";
import { incidentReportSchema, formatZodError, LIMITS } from "../lib/schemas";

// Submit incident report (public - no auth required)
export const submit = mutation({
  args: {
    type: v.string(),
    description: v.string(),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.string(),
    organization: v.string(),
    severity: v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low"),
    ),
  },
  handler: async (ctx, args) => {
    // Validate and sanitize input with Zod (authoritative server-side validation)
    const parseResult = incidentReportSchema.safeParse(args);
    if (!parseResult.success) {
      throw new Error(formatZodError(parseResult.error));
    }
    const validated = parseResult.data;

    // Rate limit by sanitized email
    await checkRateLimit(ctx, validated.contactEmail, "incident_report");

    const id = await ctx.db.insert("incidentReports", {
      type: validated.type,
      description: validated.description,
      contactName: validated.contactName,
      contactEmail: validated.contactEmail,
      contactPhone: validated.contactPhone,
      organization: validated.organization,
      severity: validated.severity,
      status: "new",
      submittedAt: Date.now(),
    });

    return id;
  },
});

// List all incident reports (admin only)
export const list = query({
  args: {
    sessionId: v.id("sessions"), // Required for authentication
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("reviewing"),
        v.literal("resolved"),
        v.literal("closed"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    // Verify authentication - incident reports contain PII
    await requireAuth(ctx, args.sessionId);

    if (args.status) {
      const reports = await ctx.db
        .query("incidentReports")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();

      return reports.sort((a, b) => b.submittedAt - a.submittedAt);
    }

    const reports = await ctx.db.query("incidentReports").collect();

    return reports.sort((a, b) => b.submittedAt - a.submittedAt);
  },
});

// Get single incident report (admin only)
export const getById = query({
  args: {
    id: v.id("incidentReports"),
    sessionId: v.id("sessions"), // Required for authentication
  },
  handler: async (ctx, args) => {
    // Verify authentication - incident reports contain PII
    await requireAuth(ctx, args.sessionId);

    return await ctx.db.get(args.id);
  },
});

// Update incident report status (admin only)
export const updateStatus = mutation({
  args: {
    id: v.id("incidentReports"),
    status: v.union(
      v.literal("new"),
      v.literal("reviewing"),
      v.literal("resolved"),
      v.literal("closed"),
    ),
    sessionId: v.id("sessions"), // Required for authentication
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const userId = await requireAuth(ctx, args.sessionId);

    // Validate notes length if provided
    let validatedNotes = args.notes;
    if (args.notes !== undefined) {
      const trimmed = args.notes.trim();
      if (trimmed.length > LIMITS.NOTES_MAX) {
        throw new Error(`Notes must not exceed ${LIMITS.NOTES_MAX} characters`);
      }
      validatedNotes = trimmed.length > 0 ? trimmed : undefined;
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      reviewedBy: userId, // Use authenticated user ID
      reviewedAt: Date.now(),
      notes: validatedNotes,
    });

    return args.id;
  },
});

// Get incident statistics (admin only)
export const getStats = query({
  args: {
    sessionId: v.id("sessions"), // Required for authentication
  },
  handler: async (ctx, args) => {
    // Verify authentication
    await requireAuth(ctx, args.sessionId);

    const reports = await ctx.db.query("incidentReports").collect();

    const stats = {
      total: reports.length,
      new: reports.filter((r) => r.status === "new").length,
      reviewing: reports.filter((r) => r.status === "reviewing").length,
      resolved: reports.filter((r) => r.status === "resolved").length,
      closed: reports.filter((r) => r.status === "closed").length,
      bySeverity: {
        critical: reports.filter((r) => r.severity === "critical").length,
        high: reports.filter((r) => r.severity === "high").length,
        medium: reports.filter((r) => r.severity === "medium").length,
        low: reports.filter((r) => r.severity === "low").length,
      },
    };

    return stats;
  },
});
