"use server";

import { revalidatePath } from "next/cache";
import {
  createContactSubmission,
  updateContactStatus,
} from "@/lib/server/contactSubmissions";
import { requireAuth } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rateLimit";
import {
  contactFormSchema,
  contactStatusSchema,
  formatZodError,
} from "@/lib/schemas";

/**
 * Submit a contact form (public — no auth required).
 */
export async function submitContactAction(input: {
  inquiryType: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  subject: string;
  message: string;
}): Promise<void> {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  // Rate limit by email
  await checkRateLimit(parsed.data.email, "contact_form");

  await createContactSubmission({
    inquiryType: parsed.data.inquiryType,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || undefined,
    organization: parsed.data.organization || undefined,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  revalidatePath("/admin/contact");
}

/**
 * Update a contact submission's status (admin only).
 */
export async function updateContactStatusAction(
  id: string,
  status: string,
): Promise<void> {
  await requireAuth();

  const statusResult = contactStatusSchema.safeParse(status);
  if (!statusResult.success) {
    throw new Error("Invalid status");
  }

  await updateContactStatus(id, statusResult.data);
  revalidatePath("/admin/contact");
}
