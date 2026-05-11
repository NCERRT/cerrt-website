import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table
  users: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // Sessions table
  sessions: defineTable({
    userId: v.id("users"),
    expiresAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Advisory documents
  advisories: defineTable({
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
    advisoryId: v.string(), // e.g., "IND-2024-001"
    date: v.number(), // timestamp
    fileStorageId: v.optional(v.id("_storage")), // PDF or image file
    fileType: v.optional(
      v.union(v.literal("pdf"), v.literal("image"))
    ), // Strict type validation
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_advisoryId", ["advisoryId"])
    .index("by_date", ["date"]),

  // Defacement statistics (monthly data)
  defacementStats: defineTable({
    year: v.number(),
    month: v.number(), // 1-12
    incidents: v.number(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_year", ["year"])
    .index("by_year_month", ["year", "month"]),

  // Rate limiting tracking
  rateLimits: defineTable({
    identifier: v.string(), // email, IP, or sessionId
    action: v.string(), // "login", "signup", "incident_report", "file_upload"
    attemptCount: v.number(),
    windowStart: v.number(), // timestamp
    lastAttempt: v.number(), // timestamp
  })
    .index("by_identifier_action", ["identifier", "action"])
    .index("by_windowStart", ["windowStart"]),

  // Contact form submissions (from public users via Contact page)
  contactSubmissions: defineTable({
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
    submittedAt: v.number(),
    status: v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("responded"),
      v.literal("closed"),
    ),
  })
    .index("by_status", ["status"])
    .index("by_submittedAt", ["submittedAt"]),

  // Incident reports (from public users via Report Incident modal)
  incidentReports: defineTable({
    type: v.string(), // e.g., "Phishing", "Malware", "Data Breach"
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
    status: v.union(
      v.literal("new"),
      v.literal("reviewing"),
      v.literal("resolved"),
      v.literal("closed"),
    ),
    submittedAt: v.number(),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_submittedAt", ["submittedAt"]),
});
