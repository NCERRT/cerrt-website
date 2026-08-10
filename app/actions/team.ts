"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin } from "@/lib/server/auth";
import { sendInviteEmail } from "@/lib/server/email";
import { z } from "zod";
import { formatZodError, LIMITS } from "@/lib/schemas";
import { logAction } from "@/lib/server/audit";
import type { ActionResult } from "@/lib/types/actionResult";

// 72-hour temp password validity
const TEMP_PASSWORD_TTL_MS = 72 * 60 * 60 * 1000;

/**
 * Generate a memorable-ish temporary password.
 * Format: 4 random uppercase letters + 4 random digits + a symbol.
 * ~28 bits of entropy — fine for a 72-hour one-time password that also
 * requires the recipient to have received the invite email.
 */
function generateTempPassword(): string {
  const bytes = randomBytes(9);
  const letters = "ABCDEFGHJKMNPQRSTUVWXYZ"; // no I, L, O
  const digits = "23456789"; // no 0, 1
  const symbols = "!@#$&";

  let out = "";
  for (let i = 0; i < 4; i++) out += letters[bytes[i] % letters.length];
  for (let i = 0; i < 4; i++) out += digits[bytes[i + 4] % digits.length];
  out += symbols[bytes[8] % symbols.length];
  return out;
}

const inviteSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(LIMITS.EMAIL_MAX)
    .email("Invalid email address"),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(LIMITS.NAME_MAX, `Name must not exceed ${LIMITS.NAME_MAX} characters`),
});

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: string;
  status: "active" | "pending" | "expired" | "deactivated";
  createdAt: Date;
  tempPasswordExpiresAt: Date | null;
  createdById: string | null;
  isSelf: boolean;
}

function statusFor(user: {
  mustChangePassword: boolean;
  tempPasswordExpiresAt: Date | null;
  isDeactivated: boolean;
}): TeamMember["status"] {
  if (user.isDeactivated) return "deactivated";
  if (!user.mustChangePassword) return "active";
  if (user.tempPasswordExpiresAt && user.tempPasswordExpiresAt < new Date()) {
    return "expired";
  }
  return "pending";
}

/**
 * List all admin users. Superadmin-only.
 */
export async function getTeamMembersAction(): Promise<TeamMember[]> {
  const me = await requireSuperadmin();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    status: statusFor(u),
    createdAt: u.createdAt,
    tempPasswordExpiresAt: u.tempPasswordExpiresAt,
    createdById: u.createdById,
    isSelf: u.id === me.id,
  }));
}

/**
 * Invite a new admin user (superadmin-only).
 * Generates a high-entropy temporary password, stores a hash in the database,
 * and dispatches an invitation email with instructions.
 */
export async function inviteAdminAction(input: {
  email: string;
  name: string;
}): Promise<ActionResult<{ email: string }>> {
  try {
    const me = await requireSuperadmin();

    const parsed = inviteSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: formatZodError(parsed.error) };
    }

    const { email, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return {
        success: false,
        error: `A user with email ${email} already exists.`,
      };
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const expiresAt = new Date(Date.now() + TEMP_PASSWORD_TTL_MS);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "admin",
        mustChangePassword: true,
        tempPasswordExpiresAt: expiresAt,
        createdById: me.id,
      },
    });

    await sendInviteEmail(email, name, tempPassword);

    await logAction({
      action: "USER_INVITE",
      description: `Invited new administrator ${name} (${email})`,
      targetId: user.id,
      targetType: "User",
    });

    revalidatePath("/cerrt-ops/team");
    return { success: true, data: { email } };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message || "Failed to invite administrator." };
  }
}

/**
 * Regenerate a fresh temp password for a pending/expired invite and resend
 * the email. Superadmin-only. Fails if the user has already completed setup.
 */
export async function resendInviteAction(
  userId: string,
): Promise<ActionResult<{ email: string }>> {
  try {
    await requireSuperadmin();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User not found" };
    if (!user.mustChangePassword) {
      return {
        success: false,
        error:
          "This user has already completed setup and no longer needs an invite.",
      };
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const expiresAt = new Date(Date.now() + TEMP_PASSWORD_TTL_MS);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: true,
        tempPasswordExpiresAt: expiresAt,
      },
    });

    // Invalidate any existing sessions for the invitee
    await prisma.session.deleteMany({ where: { userId } });

    await sendInviteEmail(user.email, user.name, tempPassword);

    revalidatePath("/cerrt-ops/team");
    return { success: true, data: { email: user.email } };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message || "Failed to resend invite." };
  }
}

/**
 * Toggle active/deactivated state of an admin user. Superadmin-only.
 * Terminate all active sessions of this user if deactivating.
 */
export async function toggleTeamMemberActiveAction(
  userId: string,
): Promise<ActionResult<{ isDeactivated: boolean }>> {
  try {
    const me = await requireSuperadmin();

    if (userId === me.id) {
      return { success: false, error: "You cannot deactivate your own account." };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const nextDeactivatedState = !user.isDeactivated;

    await prisma.user.update({
      where: { id: userId },
      data: { isDeactivated: nextDeactivatedState },
    });

    if (nextDeactivatedState) {
      // Force log out: delete all active sessions of this user
      await prisma.session.deleteMany({
        where: { userId },
      });
    }

    await logAction({
      action: nextDeactivatedState
        ? "USER_DEACTIVATE"
        : "USER_REACTIVATE",
      description: `${nextDeactivatedState ? "Deactivated" : "Reactivated"} user ${user.email}`,
      targetId: user.id,
      targetType: "User",
    });

    revalidatePath("/cerrt-ops/team");
    return { success: true, data: { isDeactivated: nextDeactivatedState } };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message || "Failed to update member status." };
  }
}
