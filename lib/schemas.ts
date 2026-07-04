/**
 * Shared Zod validation schemas
 * Used on both client (forms) and server (Convex mutations)
 */
import { z } from "zod";

// Field length limits
export const LIMITS = {
  NAME_MAX: 100,
  EMAIL_MAX: 254, // RFC 5321
  PHONE_MAX: 30,
  ORGANIZATION_MAX: 200,
  DESCRIPTION_MAX: 5000,
  NOTES_MAX: 2000,
  TITLE_MAX: 200,
  ADVISORY_ID_MAX: 50,
} as const;

// Reusable primitives
const safeString = (maxLength: number) =>
  z
    .string()
    .trim()
    // Reject control characters (except tab, newline, CR)
    .refine(
      (s) => !/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(s),
      "Contains invalid control characters",
    )
    .max(maxLength, `Must not exceed ${maxLength} characters`);

const requiredString = (maxLength: number, fieldName = "Field") =>
  safeString(maxLength).min(1, `${fieldName} is required`);

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(LIMITS.EMAIL_MAX, `Email must not exceed ${LIMITS.EMAIL_MAX} characters`)
  .email("Invalid email address");

const phoneSchema = z
  .string()
  .trim()
  .max(LIMITS.PHONE_MAX, `Phone must not exceed ${LIMITS.PHONE_MAX} characters`)
  .regex(/^[+]?[\d\s\-()]+$/, "Invalid phone number format")
  .refine((s) => {
    const digits = s.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }, "Phone number must have 7-15 digits");

// Enums
export const incidentTypeSchema = z.enum([
  "security-breach",
  "malware",
  "phishing",
  "ransomware",
  "data-leak",
  "ddos",
  "unauthorized-access",
  "other",
]);

export const severitySchema = z.enum(["critical", "high", "medium", "low"]);

export const incidentStatusSchema = z.enum([
  "new",
  "reviewing",
  "resolved",
  "closed",
]);

export const inquiryTypeSchema = z.enum([
  "general",
  "incident",
  "advisory",
  "training",
  "partnership",
]);

export const contactStatusSchema = z.enum([
  "new",
  "read",
  "responded",
  "closed",
]);

export const advisoryCategorySchema = z.enum([
  "individuals",
  "organizations",
  "kids",
  "general",
]);

// ============================================================
// Incident Report Schema
// ============================================================
export const incidentReportSchema = z.object({
  type: incidentTypeSchema,
  description: requiredString(LIMITS.DESCRIPTION_MAX, "Description"),
  contactName: requiredString(LIMITS.NAME_MAX, "Name"),
  contactEmail: emailSchema,
  contactPhone: phoneSchema,
  organization: requiredString(LIMITS.ORGANIZATION_MAX, "Organization"),
  severity: severitySchema,
});

export type IncidentReportInput = z.infer<typeof incidentReportSchema>;

// ============================================================
// Contact Form Schema
// ============================================================
export const contactFormSchema = z.object({
  inquiryType: inquiryTypeSchema,
  name: requiredString(LIMITS.NAME_MAX, "Name"),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal("")),
  organization: safeString(LIMITS.ORGANIZATION_MAX).optional().or(z.literal("")),
  subject: requiredString(LIMITS.TITLE_MAX, "Subject"),
  message: requiredString(LIMITS.DESCRIPTION_MAX, "Message"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// ============================================================
// Advisory Schema
// ============================================================

// Advisory ID format: NCA-DDMMYY-NN
// e.g., NCA-130226-01 = first advisory on 13 Feb 2026
const ADVISORY_ID_PATTERN = /^NCA-(\d{2})(\d{2})(\d{2})-\d{2}$/;

export const advisoryIdSchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine((id) => ADVISORY_ID_PATTERN.test(id), {
    message: "Format must be NCA-DDMMYY-NN (e.g., NCA-130226-01)",
  })
  .refine(
    (id) => {
      const match = id.match(ADVISORY_ID_PATTERN);
      if (!match) return true; // First refine catches format issues
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      return day >= 1 && day <= 31 && month >= 1 && month <= 12;
    },
    {
      message:
        "Invalid date in advisory ID (DD must be 01-31, MM must be 01-12)",
    },
  );

export const advisoryTitleSchema = requiredString(LIMITS.TITLE_MAX, "Title");
export const advisoryDescriptionSchema = requiredString(
  LIMITS.DESCRIPTION_MAX,
  "Description",
);

export const advisorySchema = z.object({
  title: advisoryTitleSchema,
  description: advisoryDescriptionSchema,
  category: advisoryCategorySchema,
  severity: severitySchema,
  advisoryId: advisoryIdSchema,
});

export type AdvisoryInput = z.infer<typeof advisorySchema>;

// ============================================================
// Auth Schemas
// ============================================================
export const signUpSchema = z.object({
  name: requiredString(LIMITS.NAME_MAX, "Name"),
  email: emailSchema,
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password must not exceed 128 characters"),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required").max(128),
});

// ============================================================
// Subscribe Schema
// ============================================================
export const subscribeSchema = z.object({
  email: emailSchema,
});

// ============================================================
// Helper: Format Zod errors for user display
// ============================================================
export function formatZodError(error: z.ZodError): string {
  const firstIssue = error.issues[0];
  if (!firstIssue) return "Validation failed";
  // Build a user-friendly path for nested fields
  const path = firstIssue.path.join(".");
  return path ? `${path}: ${firstIssue.message}` : firstIssue.message;
}
