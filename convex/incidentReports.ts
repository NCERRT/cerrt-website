import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Submit incident report (public - no auth required)
export const submit = mutation({
  args: {
    type: v.string(),
    description: v.string(),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    organization: v.optional(v.string()),
    severity: v.optional(
      v.union(
        v.literal("critical"),
        v.literal("high"),
        v.literal("medium"),
        v.literal("low"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("incidentReports", {
      ...args,
      status: "new",
      submittedAt: Date.now(),
    });

    return id;
  },
});

// List all incident reports (admin only)
export const list = query({
  args: {
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
  args: { id: v.id("incidentReports") },
  handler: async (ctx, args) => {
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
    userId: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      reviewedBy: args.userId,
      reviewedAt: Date.now(),
      notes: args.notes,
    });

    return args.id;
  },
});

// Get incident statistics (admin only)
export const getStats = query({
  handler: async (ctx) => {
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
