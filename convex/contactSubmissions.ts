import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkRateLimit } from "./lib/rateLimit";
import { requireAuth } from "./lib/auth";
import { contactFormSchema, formatZodError } from "../lib/schemas";

// Submit contact form (public - no auth required)
export const submit = mutation({
  args: {
    inquiryType: v.union(
      v.literal("general"),
      v.literal("incident"),
      v.literal("advisory"),
      v.literal("training"),
      v.literal("partnership"),
    ),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    organization: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate and sanitize input with Zod (authoritative server-side validation)
    const parseResult = contactFormSchema.safeParse(args);
    if (!parseResult.success) {
      throw new Error(formatZodError(parseResult.error));
    }
    const validated = parseResult.data;

    // Rate limit by email
    await checkRateLimit(ctx, validated.email, "contact_form");

    const id = await ctx.db.insert("contactSubmissions", {
      inquiryType: validated.inquiryType,
      name: validated.name,
      email: validated.email,
      phone: validated.phone || undefined,
      organization: validated.organization || undefined,
      subject: validated.subject,
      message: validated.message,
      submittedAt: Date.now(),
      status: "new",
    });

    return id;
  },
});

// List contact submissions (admin only)
export const list = query({
  args: {
    sessionId: v.id("sessions"),
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("read"),
        v.literal("responded"),
        v.literal("closed"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx, args.sessionId);

    if (args.status) {
      const submissions = await ctx.db
        .query("contactSubmissions")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
      return submissions.sort((a, b) => b.submittedAt - a.submittedAt);
    }

    const submissions = await ctx.db.query("contactSubmissions").collect();
    return submissions.sort((a, b) => b.submittedAt - a.submittedAt);
  },
});

// Update contact submission status (admin only)
export const updateStatus = mutation({
  args: {
    id: v.id("contactSubmissions"),
    status: v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("responded"),
      v.literal("closed"),
    ),
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx, args.sessionId);

    await ctx.db.patch(args.id, {
      status: args.status,
    });

    return args.id;
  },
});
