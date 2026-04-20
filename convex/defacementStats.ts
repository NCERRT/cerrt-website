import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all stats (public)
export const list = query({
  args: {
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.year) {
      const stats = await ctx.db
        .query("defacementStats")
        .withIndex("by_year", (q) => q.eq("year", args.year!))
        .collect();

      return stats.sort((a, b) => a.month - b.month);
    }

    const stats = await ctx.db.query("defacementStats").collect();

    // Group by year
    const grouped: Record<number, typeof stats> = {};
    for (const stat of stats) {
      if (!grouped[stat.year]) {
        grouped[stat.year] = [];
      }
      grouped[stat.year].push(stat);
    }

    // Sort each year's months
    for (const year in grouped) {
      grouped[year].sort((a, b) => a.month - b.month);
    }

    return grouped;
  },
});

// Get available years
export const getYears = query({
  handler: async (ctx) => {
    const stats = await ctx.db.query("defacementStats").collect();
    const years = [...new Set(stats.map((s) => s.year))];
    return years.sort((a, b) => b - a); // descending
  },
});

// Get stats for a specific year and month
export const getByYearMonth = query({
  args: {
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    const stat = await ctx.db
      .query("defacementStats")
      .withIndex("by_year_month", (q) =>
        q.eq("year", args.year).eq("month", args.month),
      )
      .first();

    return stat;
  },
});

// Create or update stats (admin only)
export const upsert = mutation({
  args: {
    year: v.number(),
    month: v.number(), // 1-12
    incidents: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Validate month
    if (args.month < 1 || args.month > 12) {
      throw new Error("Month must be between 1 and 12");
    }

    // Check if record already exists
    const existing = await ctx.db
      .query("defacementStats")
      .withIndex("by_year_month", (q) =>
        q.eq("year", args.year).eq("month", args.month),
      )
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        incidents: args.incidents,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new record
      const id = await ctx.db.insert("defacementStats", {
        year: args.year,
        month: args.month,
        incidents: args.incidents,
        createdBy: args.userId,
        createdAt: now,
        updatedAt: now,
      });
      return id;
    }
  },
});

// Delete stats (admin only)
export const remove = mutation({
  args: { id: v.id("defacementStats") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
