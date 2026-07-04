import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Session management for admin authentication.
 *
 * Sessions are stored in PostgreSQL and referenced by an HTTP-only cookie.
 * Server Actions and Server Components read the cookie directly — there is
 * no need to pass a session ID through function arguments (unlike Convex).
 */

export const SESSION_COOKIE = "sessionId";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
export const SESSION_DURATION_SEC = 24 * 60 * 60;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  mustChangePassword: boolean;
  role: string;
}

/**
 * Create a fresh session for a user. Any existing sessions for that user
 * are removed first (single active session per user).
 */
export async function createSession(userId: string): Promise<string> {
  await prisma.session.deleteMany({ where: { userId } });

  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
    },
  });

  return session.id;
}

/**
 * Resolve the currently authenticated user from the session cookie.
 * Returns null if there is no valid, unexpired session.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (
    !session ||
    session.expiresAt < new Date() ||
    session.user.isDeactivated
  ) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    mustChangePassword: session.user.mustChangePassword,
    role: session.user.role,
  };
}

/**
 * Require an authenticated user. Throws if not authenticated —
 * call this at the top of every admin-only Server Action.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required. Please log in.");
  }
  return user;
}

/**
 * Require an authenticated superadmin. Throws if the user is not signed in
 * OR is not a superadmin. Used to gate team management actions (invite,
 * resend, list, delete).
 */
export async function requireSuperadmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== "superadmin") {
    throw new Error("Only super-administrators can perform this action.");
  }
  return user;
}

/**
 * Delete a session by its ID (used on sign-out).
 */
export async function destroySession(sessionId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { id: sessionId } });
}
