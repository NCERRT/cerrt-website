"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { formatZodError } from "@/lib/schemas";
import { requireSuperadmin } from "@/lib/server/auth";
import {
  approveMdaRegistration,
  getMdaOrganizations,
  getMdaRegistrationById,
  getMdaRegistrations,
  rejectMdaRegistration,
  submitMdaRegistration,
  toggleMdaOrganizationActive,
} from "@/lib/server/mdaRegistration";

const mdaRegisterSchema = z.object({
  organizationName: z.string().trim().min(3, "Organization name must be at least 3 characters.").max(120),
  acronym: z.string().trim().max(30).optional(),
  sector: z.string().trim().max(60).optional(),
  contactName: z.string().trim().min(2, "Contact person name is required.").max(80),
  contactEmail: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  jobTitle: z.string().trim().min(2, "Job title is required.").max(80),
  phone: z.string().trim().max(30).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
});

const rejectSchema = z.object({
  registrationId: z.string().min(1, "Registration ID is required."),
  reason: z.string().trim().min(5, "Rejection reason must be at least 5 characters.").max(500),
});

export type ActionResult<T = void> =
  | { success: true; message?: string; data?: T }
  | { success: false; error: string };

/**
 * Public Server Action: Submit Self-Registration
 */
export async function submitMdaRegistrationAction(
  rawInput: z.infer<typeof mdaRegisterSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parseResult = mdaRegisterSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return { success: false, error: formatZodError(parseResult.error) };
    }

    const registration = await submitMdaRegistration(parseResult.data);
    return {
      success: true,
      message: "Registration submitted successfully. Your application is under review by CERRT Administration.",
      data: { id: registration.id },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred during registration.";
    return { success: false, error: message };
  }
}

/**
 * Retrieves list of MDA registration applications for CERRT admin approval queue with pagination and search.
 */
export async function getMdaRegistrationsAction(
  params: Parameters<typeof getMdaRegistrations>[0] = {},
): Promise<ActionResult<Awaited<ReturnType<typeof getMdaRegistrations>>>> {
  try {
    await requireSuperadmin();
    const data = await getMdaRegistrations(params);
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load registrations.";
    return { success: false, error: message };
  }
}

/**
 * Retrieves details for a single registration application.
 */
export async function getMdaRegistrationByIdAction(
  id: string,
): Promise<ActionResult<Awaited<ReturnType<typeof getMdaRegistrationById>>>> {
  try {
    await requireSuperadmin();
    const data = await getMdaRegistrationById(id);
    if (!data) {
      return { success: false, error: "Registration application not found." };
    }
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load registration details.";
    return { success: false, error: message };
  }
}

/**
 * Approves an MDA registration application.
 */
export async function approveMdaRegistrationAction(
  registrationId: string,
): Promise<ActionResult> {
  try {
    const admin = await requireSuperadmin();

    await approveMdaRegistration(
      registrationId,
      admin.id,
      admin.email,
      admin.name || undefined,
    );

    revalidatePath("/cerrt-ops/mda-registrations");
    revalidatePath("/cerrt-ops/organizations");

    return {
      success: true,
      message: "MDA registration approved successfully. Organization and login account created.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to approve registration.";
    return { success: false, error: message };
  }
}

/**
 * Rejects an MDA registration application with reason.
 */
export async function rejectMdaRegistrationAction(
  registrationId: string,
  reason: string,
): Promise<ActionResult> {
  try {
    const admin = await requireSuperadmin();
    const parseResult = rejectSchema.safeParse({ registrationId, reason });
    if (!parseResult.success) {
      return { success: false, error: formatZodError(parseResult.error) };
    }

    await rejectMdaRegistration(
      parseResult.data.registrationId,
      parseResult.data.reason,
      admin.id,
      admin.email,
      admin.name || undefined,
    );

    revalidatePath("/cerrt-ops/mda-registrations");

    return {
      success: true,
      message: "MDA registration application rejected.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reject registration.";
    return { success: false, error: message };
  }
}

/**
 * Retrieves all registered MDA Organizations for Superadmin management with pagination and search.
 */
export async function getMdaOrganizationsAction(
  params: Parameters<typeof getMdaOrganizations>[0] = {},
): Promise<ActionResult<Awaited<ReturnType<typeof getMdaOrganizations>>>> {
  try {
    await requireSuperadmin();
    const data = await getMdaOrganizations(params);
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load MDA organizations.";
    return { success: false, error: message };
  }
}

/**
 * Toggles active status of an MDA Organization.
 */
export async function toggleMdaOrganizationActiveAction(
  organizationId: string,
): Promise<ActionResult> {
  try {
    const admin = await requireSuperadmin();
    await toggleMdaOrganizationActive(
      organizationId,
      admin.id,
      admin.email,
      admin.name || undefined,
    );

    revalidatePath("/cerrt-ops/organizations");

    return { success: true, message: "Organization status updated." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update organization status.";
    return { success: false, error: message };
  }
}
