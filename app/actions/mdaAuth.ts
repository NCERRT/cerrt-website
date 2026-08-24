"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { formatZodError } from "@/lib/schemas";
import {
  changeMdaPassword,
  getMdaSession,
  mdaLogin,
  mdaLogout,
  updateMdaProfile,
  type AuthenticatedMdaUser,
} from "@/lib/server/mdaAuth";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const profileSchema = z.object({
  contactName: z.string().trim().min(2, "Contact name is required.").max(100),
  jobTitle: z.string().trim().min(2, "Job title is required.").max(150),
  phone: z.string().trim().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters long.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
});

export type ActionResult<T = void> =
  | { success: true; message?: string; data?: T }
  | { success: false; error: string };

/**
 * Log in MDA user.
 */
export async function mdaLoginAction(
  rawInput: z.infer<typeof loginSchema>,
): Promise<ActionResult<AuthenticatedMdaUser>> {
  try {
    const parseResult = loginSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return { success: false, error: formatZodError(parseResult.error) };
    }

    const user = await mdaLogin(parseResult.data.email, parseResult.data.password);
    return {
      success: true,
      message: "Login successful.",
      data: user,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred during login.";
    return { success: false, error: message };
  }
}

/**
 * Log out MDA user.
 */
export async function mdaLogoutAction(): Promise<ActionResult> {
  try {
    await mdaLogout();
    return { success: true, message: "Logged out successfully." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to log out.";
    return { success: false, error: message };
  }
}

/**
 * Retrieves current active MDA session user.
 */
export async function getMdaSessionAction(): Promise<AuthenticatedMdaUser | null> {
  try {
    return await getMdaSession();
  } catch {
    return null;
  }
}

/**
 * Updates contact officer details.
 */
export async function updateMdaProfileAction(
  rawInput: z.infer<typeof profileSchema>,
): Promise<ActionResult> {
  try {
    const parseResult = profileSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return { success: false, error: formatZodError(parseResult.error) };
    }

    await updateMdaProfile(parseResult.data);
    revalidatePath("/mda-portal");
    revalidatePath("/mda-portal/settings");

    return { success: true, message: "Profile updated successfully." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update profile.";
    return { success: false, error: message };
  }
}

/**
 * Changes MDA account password.
 */
export async function changeMdaPasswordAction(
  rawInput: z.infer<typeof passwordSchema>,
): Promise<ActionResult> {
  try {
    const parseResult = passwordSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return { success: false, error: formatZodError(parseResult.error) };
    }

    await changeMdaPassword(parseResult.data.currentPassword, parseResult.data.newPassword);
    return { success: true, message: "Password updated successfully." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to change password.";
    return { success: false, error: message };
  }
}
