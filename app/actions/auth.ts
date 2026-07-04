"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  getCurrentUser,
  requireAuth,
  SESSION_COOKIE,
  SESSION_DURATION_SEC,
  type AuthUser,
} from "@/lib/server/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/server/rateLimit";
import { validatePassword } from "@/lib/server/passwordPolicy";

/**
 * Sign in an admin user. Sets the session cookie on success.
 * @throws Error with a generic message on invalid credentials or rate limit.
 */
export async function signInAction(
  email: string,
  password: string,
): Promise<AuthUser> {
  const normalizedEmail = email.toLowerCase().trim();

  // Rate limit BEFORE credential check (mitigates brute force + timing)
  await checkRateLimit(normalizedEmail, "login");

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Generic error — never reveal whether the email exists
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid email or password");
  }

  // Check if temp password has expired
  if (user.tempPasswordExpiresAt && user.tempPasswordExpiresAt < new Date()) {
    throw new Error("Your temporary password has expired. Please contact a super-admin for a new invite.");
  }

  // Prevent login for deactivated users
  if (user.isDeactivated) {
    throw new Error("Your account has been deactivated. Please contact a super-administrator.");
  }

  // Create session and set the HTTP-only cookie
  const sessionId = await createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_SEC,
    path: "/",
  });

  // Clear the rate limit on successful login
  await resetRateLimit(normalizedEmail, "login");

  return { id: user.id, email: user.email, name: user.name, mustChangePassword: user.mustChangePassword, role: user.role };
}

/**
 * Sign out the current user. Destroys the session and clears the cookie.
 */
export async function signOutAction(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    await destroySession(sessionId);
    cookieStore.delete(SESSION_COOKIE);
  }
}

/**
 * Return the currently authenticated user (or null).
 * Used by the client-side auth context on mount.
 */
export async function getCurrentUserAction(): Promise<AuthUser | null> {
  return getCurrentUser();
}

/**
 * Change the current user's password. Used for forced password change on first
 * login and voluntary password changes.
 *
 * Destroys all existing sessions and creates a fresh one.
 */
export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
): Promise<AuthUser> {
  const authUser = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // Verify current password
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    throw new Error("Current password is incorrect");
  }

  // Validate new password (structure + HIBP breach check)
  const pwCheck = await validatePassword(newPassword);
  if (!pwCheck.valid) {
    throw new Error(pwCheck.error || "Invalid password");
  }

  // Hash and update
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      mustChangePassword: false,
      tempPasswordExpiresAt: null,
    },
  });

  // Destroy all sessions and create a fresh one
  await prisma.session.deleteMany({ where: { userId: user.id } });
  const sessionId = await createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_SEC,
    path: "/",
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    mustChangePassword: false,
    role: user.role,
  };
}

/**
 * Request a password reset email. Always succeeds (never reveals whether the
 * email exists in the system).
 */
export async function requestPasswordResetAction(
  email: string,
): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();

  // Rate limit: max 3 reset requests per email per hour
  await checkRateLimit(normalizedEmail, "password_reset");

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // If user doesn't exist, silently return (no email enumeration)
  if (!user) return;

  // Generate a cryptographically random token
  const { randomBytes, createHash } = await import("crypto");
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  // Invalidate any prior unused tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  // Store the hashed token
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  // Send the reset email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/admin/reset-password?token=${rawToken}`;

  const { sendPasswordResetEmail } = await import("@/lib/server/email");
  await sendPasswordResetEmail(user.email, user.name, resetUrl);
}

/**
 * Reset a user's password using a valid reset token.
 */
export async function resetPasswordAction(
  token: string,
  newPassword: string,
): Promise<void> {
  // Hash the incoming token to find the matching record
  const { createHash } = await import("crypto");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!resetToken) {
    throw new Error("Invalid or expired reset link. Please request a new one.");
  }

  if (resetToken.usedAt) {
    throw new Error("This reset link has already been used. Please request a new one.");
  }

  if (resetToken.expiresAt < new Date()) {
    throw new Error("This reset link has expired. Please request a new one.");
  }

  // Validate new password (structure + HIBP breach check)
  const pwCheck = await validatePassword(newPassword);
  if (!pwCheck.valid) {
    throw new Error(pwCheck.error || "Invalid password");
  }

  // Hash and update password
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: {
      passwordHash,
      mustChangePassword: false,
      tempPasswordExpiresAt: null,
    },
  });

  // Mark token as used
  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { usedAt: new Date() },
  });

  // Destroy all sessions for this user
  await prisma.session.deleteMany({ where: { userId: resetToken.userId } });
}

